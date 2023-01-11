const ExtensionUtils = imports.misc.extensionUtils;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const EXTENSION = ExtensionUtils.getCurrentExtension();
const CONSTANTS = EXTENSION.imports.const;

const colosseum = GObject.registerClass({ GTypeName: 'colosseumPrefsWidget' },
    class colosseum extends Gtk.Box {
        _init(params) {
            super._init(params);

            this.orientation = Gtk.Orientation.VERTICAL;
            this.spacing = 0;

            this.total = {};

            this._settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.colosseum");

            const builder = new Gtk.Builder();
            builder.add_from_file(EXTENSION.path + "/ui/prefs.ui")

            this._leagues = builder.get_object("leagues");
            this._tournaments = builder.get_object("tournaments");
            const container = builder.get_object("container");
            const leagues = Object.keys(CONSTANTS.SPORTS);
            const tournaments = Object.keys(CONSTANTS.PREF_TOURNAMENTS);

        	for (let i = 0; i < leagues.length; i++) {
        		let followed = "followList" + leagues[i].replace(' ', '');
        		let notFollowing = "notFollowingList" + leagues[i].replace(' ', '');
                let tabContent = leagues[i].replace(' ', '').toLowerCase() + "-content";

                this.total[leagues[i]] = {
                    followed: 0,
                    notFollowing: 0
                };

                this["_" + followed] = builder.get_object(followed);
                this["_" + notFollowing] = builder.get_object(notFollowing);
                this["_" + tabContent] = builder.get_object(tabContent);

                this["_" + followed].set_sort_func(this._sortList.bind(this));
                this["_" + notFollowing].set_sort_func(this._sortList.bind(this));
                this["_" + tabContent].set_visible(false);

                this["_label" + leagues[i].replace(' ', '')] = builder.get_object(leagues[i].replace(' ', '').toLowerCase() + "-tab");

                for (let j = 0; j < CONSTANTS.SPORTS[leagues[i]].length; j++) {
                    this._addTeam(
                    	{
                    		league: leagues[i],
                    		team: CONSTANTS.SPORTS[leagues[i]][j]
                    	}
                    );
                }

                this._updateTabLabel(leagues[i]);
                this._addLeague(leagues[i]);
        	}

            for (let i = 0; i < tournaments.length; i++) {
                this._addTournament(tournaments[i]);
            }

            this.append(container);

            this._settings.bind(CONSTANTS.PREF_UPDATE_FREQ, builder.get_object("prefs_frequency"), "value", Gio.SettingsBindFlags.DEFAULT);
            this._settings.bind(CONSTANTS.PREF_FOLLOWED_ONLY, builder.get_object("prefs_followed_only"), "active", Gio.SettingsBindFlags.DEFAULT);
            this._settings.bind(CONSTANTS.PREF_COMPACT_MODE, builder.get_object("prefs_compact_mode"), "active", Gio.SettingsBindFlags.DEFAULT);
            this._settings.bind(CONSTANTS.PREF_POSITION_TOPBAR, builder.get_object("prefs_position_topbar"), "active", Gio.SettingsBindFlags.DEFAULT);
        }

        _addLeague(league) {
            let row = new LeagueRow(league, this._settings, this._toggleTabVisibility.bind(this));

            if (row.enabled) {
                this["_" + league.replace(' ', '').toLowerCase() + "-content"].set_visible(true);
            }

            this._leagues.append(row);
        }

        _addTeam(team) {
            let row = new TeamRow(team, this._settings, this._moveRow.bind(this));

            if (row.enabled) {
                this["_followList" + team.league.replace(' ', '')].append(row);
                this.total[team.league].followed += 1;
            } else {
                this["_notFollowingList" + team.league.replace(' ', '')].append(row);
                this.total[team.league].notFollowing += 1;
            }
        }

        _addTournament(tournament) {
            this._tournaments.append(new TournamentRow(tournament, this._settings));
        }

        _toggleTabVisibility(league, wasEnabled) {
            this["_" + league.replace(' ', '').toLowerCase() + "-content"].set_visible(wasEnabled);
        }

        _moveRow(data, wasEnabled) {
    		let followed = "_followList" + data.league.replace(' ', '');
    		let notFollowing = "_notFollowingList" + data.league.replace(' ', '');

            let row = [
                ...this[followed],
                ...this[notFollowing],
            ].find(t => t.name === data.team.name);

            if (row) {
                row.get_parent().remove(row);

                if (wasEnabled) {
                    this[followed].append(row);

                    this.total[data.league].followed += 1;
                    this.total[data.league].notFollowing -= 1;
                } else {
                    this[notFollowing].append(row);

                    this.total[data.league].followed -= 1;
                    this.total[data.league].notFollowing += 1;
                }

                this._updateTabLabel(data.league);
            }
        }

        _updateTabLabel(league) {
            this["_label" + league.replace(' ', '')].set_text(league + (this.total[league].followed ? ` (${this.total[league].followed})` : ""));
        }

        _sortList(a, b) {
            return a.name.localeCompare(b.name);
        }
    });


const TeamRow = GObject.registerClass({
    GTypeName: 'TeamRow',
    Template: 'file:///' + EXTENSION.path + "/ui/team-row.ui",
    InternalChildren: [
        'teamLabel',
        'teamSwitch'
    ],
}, class Row extends Gtk.ListBoxRow {
    _init(data, settings, callback) {
        super._init();

        this._app = Gio.Application.get_default();
        this._data = data;
        this._settings = settings;
        this._switchCallback = callback;

        this._teamLabel.label = this._data.team.name;
        this._teamSwitch.connect("notify::active", this._onSwitchChanged.bind(this));

        this._settings.bind(this._data.team.pref, this._teamSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
    }

    get enabled() {
        return this._settings.get_boolean(this._data.team.pref);
    }

    get name() {
        return this._data.team.name;
    }

    _onSwitchChanged(state) {
        let enabled = state.get_active();

        this._switchCallback(this._data, enabled);
    }
});

const LeagueRow = GObject.registerClass({
    GTypeName: 'LeagueRow',
    Template: 'file:///' + EXTENSION.path + "/ui/league-row.ui",
    InternalChildren: [
        'leagueLabel',
        'leagueSwitch'
    ],
}, class Row extends Gtk.ListBoxRow {
    _init(league, settings, callback) {
        super._init();

        this._app = Gio.Application.get_default();
        this._settings = settings;
        this._switchCallback = callback;

        this._league = league;
        this._leagueLabel.label = league;
        this._leagueSwitch.connect("notify::active", this._onSwitchChanged.bind(this));

        this._settings.bind(CONSTANTS.PREF_LEAGUES[league], this._leagueSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
    }

    get enabled() {
        return this._settings.get_boolean(CONSTANTS.PREF_LEAGUES[this._league]);
    }

    _onSwitchChanged(state) {
        let enabled = state.get_active();

        this._switchCallback(this._league, enabled);
    }
});


const TournamentRow = GObject.registerClass({
    GTypeName: 'TournamentRow',
    Template: 'file:///' + EXTENSION.path + "/ui/tournament-row.ui",
    InternalChildren: [
        'tournamentLabel',
        'tournamentSwitch'
    ],
}, class Row extends Gtk.ListBoxRow {
    _init(tournament, settings) {
        super._init();

        this._app = Gio.Application.get_default();
        this._settings = settings;

        this._tournament = tournament;
        this._tournamentLabel.label = tournament;

        this._settings.bind(CONSTANTS.PREF_TOURNAMENTS[tournament], this._tournamentSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
    }
});


function init() {}

function buildPrefsWidget() {
    let c = new colosseum();
    c.show();

    return c;
}