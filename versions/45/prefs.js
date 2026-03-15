import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import Adw from "gi://Adw";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

import * as CONSTANTS from "./const.js";

const EXT_PATH = import.meta.url;

class Preferences {
  constructor(window, settings) {
    this._builder = new Gtk.Builder();

    this._settings = settings;

    this._builder.add_from_file(
      EXT_PATH.replace("prefs.js", "ui/prefs.ui").replace("file://", ""),
    );
    this._leagues = this._builder.get_object("leagues");
    this._tournaments = this._builder.get_object("tournaments");
    this._navView = this._builder.get_object("navView");
    this._leagueDetails = this._builder.get_object("leagueDetails");

    this._leagueRowContainer = this._builder.get_object("leagueRowContainer");
    this._leagueSwitch = this._builder.get_object("leagueSwitch");
    this._leagueSwitchBind = null;

    this._followedList = this._builder.get_object("followedList");
    this._followedList.set_sort_func(this._sortList.bind(this));

    this._notFollowingList = this._builder.get_object("notFollowingList");
    this._notFollowingList.set_sort_func(this._sortList.bind(this));

    this._settings.bind(
      CONSTANTS.PREF_UPDATE_FREQ,
      this._builder.get_object("prefs_frequency"),
      "value",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._settings.bind(
      CONSTANTS.PREF_FOLLOWED_ONLY,
      this._builder.get_object("prefs_followed_only"),
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._settings.bind(
      CONSTANTS.PREF_COMPACT_MODE,
      this._builder.get_object("prefs_compact_mode"),
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._settings.bind(
      CONSTANTS.PREF_POSITION_TOPBAR,
      this._builder.get_object("prefs_position_topbar"),
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    this._bootstrap();

    window.set_content(this._navView);
  }

  _bootstrap() {
    const leagues = Object.keys(CONSTANTS.SPORTS);
    const tournaments = Object.keys(CONSTANTS.PREF_TOURNAMENTS);

    for (let i = 0; i < leagues.length; i++) {
      this._addLeague(leagues[i]);
    }

    for (let i = 0; i < tournaments.length; i++) {
      this._addTournament(tournaments[i]);
    }
  }

  _addLeague(league) {
    let row = new LeagueRow(
      league,
      this._settings,
      this._leagueDetails,
      this._navView,
      this._openLeaguePage.bind(this),
    );
    this._leagues.add(row);
  }

  _addTeam(team) {
    let row = new TeamRow(team, this._settings, this._moveRow.bind(this));

    if (row.enabled) {
      this._followedList.append(row);
    } else {
      this._notFollowingList.append(row);
    }
  }

  _addTournament(tournament) {
    this._tournaments.add(new TournamentRow(tournament, this._settings));
  }

  _checkEmptyState(league) {
    const removeAllPlaceholders = (list) => {
      let child = list.get_first_child();
      while (child) {
        let next = child.get_next_sibling();
        if (child.is_placeholder) {
          list.remove(child);
        }
        child = next;
      }
    };

    removeAllPlaceholders(this._followedList);
    removeAllPlaceholders(this._notFollowingList);

    let followedCount = 0;
    let notFollowingCount = 0;

    let child = this._followedList.get_first_child();
    while (child) {
      followedCount++;
      child = child.get_next_sibling();
    }

    child = this._notFollowingList.get_first_child();
    while (child) {
      notFollowingCount++;
      child = child.get_next_sibling();
    }

    if (followedCount === 0) {
      this._followedList.append(this._createEmptyRow("No teams followed"));
    }

    if (notFollowingCount === 0) {
      this._notFollowingList.append(this._createEmptyRow("All teams followed"));
    }
  }

  _createEmptyRow(message) {
    const row = new Adw.ActionRow({
      title: message,
      sensitive: false,
      activatable: false,
    });
    row.is_placeholder = true;
    row.add_css_class("dim-label");
    return row;
  }

  _clearListBox(listBox) {
    let child;
    while ((child = listBox.get_first_child())) {
      listBox.remove(child);
    }
  }

  _moveRow(data, wasEnabled) {
    let row = [...this._followedList, ...this._notFollowingList].find(
      (t) => t.name === data.team.name,
    );

    if (row) {
      const league = data.league;
      row.get_parent().remove(row);

      if (wasEnabled) {
        this._followedList.append(row);
      } else {
        this._notFollowingList.append(row);
      }

      this._checkEmptyState(league);
    }
  }

  _openLeaguePage(league) {
    this._clearListBox(this._followedList);
    this._clearListBox(this._notFollowingList);

    this._updateSwitch();

    for (let j = 0; j < CONSTANTS.SPORTS[league].length; j++) {
      this._addTeam({
        league: league,
        team: CONSTANTS.SPORTS[league][j],
      });
    }

    this._checkEmptyState(league);

    this._leagueDetails.title = CONSTANTS.DISPLAY_NAME[league];
    this._leagueSwitch.active = this._settings.get_boolean(
      CONSTANTS.PREF_LEAGUES[league],
    );
    this._settings.bind(
      CONSTANTS.PREF_LEAGUES[league],
      this._leagueSwitch,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
  }

  _updateSwitch() {
    if (this._leagueSwitch) {
      let parent = this._leagueSwitch.get_parent();
      if (parent) {
        parent.remove(this._leagueSwitch);
      }
    }

    this._leagueSwitch = new Gtk.Switch({
      valign: Gtk.Align.CENTER,
    });

    this._leagueRowContainer.add_suffix(this._leagueSwitch);
  }

  _sortList(a, b) {
    return a.name.localeCompare(b.name);
  }
}

const TeamRow = GObject.registerClass(
  {
    GTypeName: "TeamRow",
    Template: EXT_PATH.replace("prefs.js", "ui/team-row.ui"),
    InternalChildren: ["teamLabel", "teamSwitch"],
  },
  class Row extends Gtk.ListBoxRow {
    _init(data, settings, callback) {
      super._init();

      this._data = data;
      this._settings = settings;
      this._switchCallback = callback;

      this._teamLabel.label = this._data.team.name;
      this._teamSwitch.connect(
        "notify::active",
        this._onSwitchChanged.bind(this),
      );

      this._settings.bind(
        this._data.team.pref,
        this._teamSwitch,
        "active",
        Gio.SettingsBindFlags.DEFAULT,
      );
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
  },
);

const LeagueRow = GObject.registerClass(
  {
    GTypeName: "LeagueRow",
    Template: EXT_PATH.replace("prefs.js", "ui/league-row.ui"),
    InternalChildren: ["statusLabel"],
  },
  class Row extends Adw.ActionRow {
    _init(league, settings, leagueDetails, navView, onOpen) {
      super._init();

      this._league = league;
      this._leagueDetails = leagueDetails;
      this._navView = navView;
      this._settings = settings;
      this._onOpen = onOpen;

      this.set_title(CONSTANTS.DISPLAY_NAME[league]);
      this._updateStatusLabel();

      this._settings.connect(`changed::${CONSTANTS.PREF_LEAGUES[league]}`, () =>
        this._updateStatusLabel(),
      );

      this.connect("activated", () => {
        this._onOpen(this._league);
        this._navView.push_by_tag("league-details");
      });
    }

    get enabled() {
      return this._settings.get_boolean(CONSTANTS.PREF_LEAGUES[this._league]);
    }

    _updateStatusLabel() {
      this._statusLabel.label = this.enabled ? "Enabled" : "";
    }
  },
);

const TournamentRow = GObject.registerClass(
  {
    GTypeName: "TournamentRow",
    Template: EXT_PATH.replace("prefs.js", "ui/tournament-row.ui"),
    InternalChildren: ["tournamentSwitch"],
  },
  class Row extends Adw.ActionRow {
    _init(tournament, settings) {
      super._init();

      this.set_title(tournament);

      this._settings = settings;
      this._settings.bind(
        CONSTANTS.PREF_TOURNAMENTS[tournament],
        this._tournamentSwitch,
        "active",
        Gio.SettingsBindFlags.DEFAULT,
      );
    }
  },
);

export default class ColosseumPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    let preferences = new Preferences(
      window,
      this.getSettings("org.gnome.shell.extensions.colosseum"),
    );
  }
}
