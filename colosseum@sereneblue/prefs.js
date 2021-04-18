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

            const schemaSource = Gio.SettingsSchemaSource.new_from_directory(
                EXTENSION.dir.get_child('schemas').get_path(), Gio.SettingsSchemaSource.get_default(), false
            );

            this._settings = new Gio.Settings({ 
                settings_schema: schemaSource.lookup("org.gnome.shell.extensions.colosseum", true) 
            });

            const builder = new Gtk.Builder();
            builder.add_from_file(EXTENSION.path + "/ui/prefs.ui")

            this._leagues = builder.get_object("leagues")
            ;
            const container = builder.get_object("container");
            const leagues = Object.keys(CONSTANTS.SPORTS);

        	for (let i = 0; i < leagues.length; i++) {
        		let followed = "followList" + leagues[i];
        		let notFollowing = "notFollowingList" + leagues[i];

                this.total[leagues[i]] = {
                    followed: 0,
                    notFollowing: 0
                };

                this["_" + followed] = builder.get_object(followed);
                this["_" + notFollowing] = builder.get_object(notFollowing);

                this["_" + followed].set_sort_func(this._sortList.bind(this));
                this["_" + notFollowing].set_sort_func(this._sortList.bind(this));

                this["_label" + leagues[i]] = builder.get_object(leagues[i].toLowerCase() + "-tab");

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

            this.append(container);

            this._settings.bind(CONSTANTS.PREF_UPDATE_FREQ, builder.get_object("prefs_frequency"), "value", Gio.SettingsBindFlags.DEFAULT);
            this._settings.bind(CONSTANTS.PREF_FOLLOWED_ONLY, builder.get_object("prefs_followed_only"), "active", Gio.SettingsBindFlags.DEFAULT);
        }

        _addLeague(league) {
            let row = new LeagueRow(league, this._settings);
            this._leagues.append(row);
        }

        _addTeam(team) {
            let row = new TeamRow(team, this._settings, this._moveRow.bind(this));

            if (row.enabled) {
                this["_followList" + team.league].append(row);
                this.total[team.league].followed += 1;
            } else {
                this["_notFollowingList" + team.league].append(row);
                this.total[team.league].notFollowing += 1;
            }
        }

        _moveRow(data, wasEnabled) {
    		let followed = "_followList" + data.league;
    		let notFollowing = "_notFollowingList" + data.league;

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
            this["_label" + league].set_text(league + (this.total[league].followed ? ` (${this.total[league].followed})` : ""));
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
    _init(league, settings) {
        super._init();

        this._app = Gio.Application.get_default();
        this._settings = settings;
        this._leagueLabel.label = league;

        this._settings.bind(CONSTANTS.PREF_LEAGUES[league], this._leagueSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
    }
});


function init() {}

function buildPrefsWidget() {
    let c = new colosseum();
    c.show();

    return c;
}