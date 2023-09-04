import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import * as CONSTANTS from './const.js';

const EXT_PATH = import.meta.url;

class Preferences {
    constructor(window, settings) {
        this._builder = new Gtk.Builder();

        this.total = {};
        this._settings = settings;

        this._builder.add_from_file(EXT_PATH.replace('prefs.js', "ui/prefs.ui").replace('file://', ''))
        this._leagues = this._builder.get_object("leagues");
        this._tournaments = this._builder.get_object("tournaments");
        this._prefsPage = this._builder.get_object("preferences_page");
        this._teamsPage = this._builder.get_object("teams_page");

        this._settings.bind(CONSTANTS.PREF_UPDATE_FREQ, this._builder.get_object("prefs_frequency"), "value", Gio.SettingsBindFlags.DEFAULT);
        this._settings.bind(CONSTANTS.PREF_FOLLOWED_ONLY, this._builder.get_object("prefs_followed_only"), "active", Gio.SettingsBindFlags.DEFAULT);
        this._settings.bind(CONSTANTS.PREF_COMPACT_MODE, this._builder.get_object("prefs_compact_mode"), "active", Gio.SettingsBindFlags.DEFAULT);
        this._settings.bind(CONSTANTS.PREF_POSITION_TOPBAR, this._builder.get_object("prefs_position_topbar"), "active", Gio.SettingsBindFlags.DEFAULT);

        this._bootstrap();

        window.add(this._prefsPage);
        window.add(this._teamsPage);
    }

    _bootstrap() {
        const leagues = Object.keys(CONSTANTS.SPORTS);
        const tournaments = Object.keys(CONSTANTS.PREF_TOURNAMENTS);

        for (let i = 0; i < leagues.length; i++) {
            let followed = "followList" + leagues[i].replaceAll(' ', '');
            let notFollowing = "notFollowingList" + leagues[i].replaceAll(' ', '');
            let tabContent = leagues[i].replaceAll(' ', '').toLowerCase() + "-content";

            this.total[leagues[i]] = {
                followed: 0,
                notFollowing: 0
            };

            this["_" + followed] = this._builder.get_object(followed);
            this["_" + notFollowing] = this._builder.get_object(notFollowing);
            this["_" + tabContent] = this._builder.get_object(tabContent);

            this["_" + followed].set_sort_func(this._sortList.bind(this));
            this["_" + notFollowing].set_sort_func(this._sortList.bind(this));
            this["_" + tabContent].set_visible(false);

            this["_label" + leagues[i].replaceAll(' ', '')] = this._builder.get_object(leagues[i].replaceAll(' ', '').toLowerCase() + "-tab");

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
    }

    _addLeague(league) {
        let row = new LeagueRow(league, this._settings, this._toggleTabVisibility.bind(this));

        if (row.enabled) {
            this["_" + league.replaceAll(' ', '').toLowerCase() + "-content"].set_visible(true);
        }

        this._leagues.add(row);
    }

    _addTeam(team) {
        let row = new TeamRow(team, this._settings, this._moveRow.bind(this));

        if (row.enabled) {
            this["_followList" + team.league.replaceAll(' ', '')].append(row);
            this.total[team.league].followed += 1;
        } else {
            this["_notFollowingList" + team.league.replaceAll(' ', '')].append(row);
            this.total[team.league].notFollowing += 1;
        }
    }

    _addTournament(tournament) {
        this._tournaments.add(new TournamentRow(tournament, this._settings));
    }

    _toggleTabVisibility(league, wasEnabled) {
        this["_" + league.replaceAll(' ', '').toLowerCase() + "-content"].set_visible(wasEnabled);
    }

    _moveRow(data, wasEnabled) {
		let followed = "_followList" + data.league.replaceAll(' ', '');
		let notFollowing = "_notFollowingList" + data.league.replaceAll(' ', '');

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
        this["_label" + league.replaceAll(' ', '')].set_text(league + (this.total[league].followed ? ` (${this.total[league].followed})` : ""));
    }

    _sortList(a, b) {
        return a.name.localeCompare(b.name);
    }
};

const TeamRow = GObject.registerClass({
    GTypeName: 'TeamRow',
    Template: EXT_PATH.replace('prefs.js', "ui/team-row.ui"),
    InternalChildren: [
        'teamLabel',
        'teamSwitch'
    ],
}, class Row extends Gtk.ListBoxRow {
    _init(data, settings, callback) {
        super._init();

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
    Template: EXT_PATH.replace('prefs.js', "ui/league-row.ui"),
    InternalChildren: [
        'leagueSwitch'
    ],
}, class Row extends Adw.ActionRow {
    _init(league, settings, callback) {
        super._init();

        this._switchCallback = callback;

        this.set_title(CONSTANTS.DISPLAY_NAME[league]);
        this._league = league;
        this._leagueSwitch.connect("notify::active", this._onSwitchChanged.bind(this));

        this._settings = settings;
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
    Template: EXT_PATH.replace('prefs.js', "ui/tournament-row.ui"),
    InternalChildren: [
        'tournamentSwitch'
    ],
}, class Row extends Adw.ActionRow {
    _init(tournament, settings) {
        super._init();

        this.set_title(tournament);

        this._settings = settings;
        this._settings.bind(CONSTANTS.PREF_TOURNAMENTS[tournament], this._tournamentSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
    }
});

export default class ColosseumPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        let preferences = new Preferences(window, this.getSettings("org.gnome.shell.extensions.colosseum"));
    }
}