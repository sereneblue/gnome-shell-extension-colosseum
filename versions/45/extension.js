import Clutter from "gi://Clutter";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Meta from "gi://Meta";
import St from "gi://St";
import Gtk from "gi://Gtk";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Config from "resource:///org/gnome/shell/misc/config.js";

import * as CONSTANTS from "./const.js";
import ColosseumClient from "./client.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

const EXT_PATH = import.meta.url;

const GameLink = GObject.registerClass(
  class GameLink extends St.Label {
    _init(link = "") {
      super._init({
        reactive: true,
        style_class: "shell-link",
        y_expand: true,
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._url = link;
      this.clutter_text.set_markup(`<span><u>Visit</u></span>`);
    }

    vfunc_button_press_event(event) {
      if (!this.visible || this.get_paint_opacity() === 0)
        return Clutter.EVENT_PROPAGATE;

      return true;
    }

    vfunc_button_release_event(event) {
      if (!this.visible || this.get_paint_opacity() === 0)
        return Clutter.EVENT_PROPAGATE;

      Gio.app_info_launch_default_for_uri(
        this._url,
        global.create_app_launch_context(0, -1),
      );

      return Clutter.EVENT_STOP;
    }

    vfunc_motion_event(event) {
      if (!this.visible || this.get_paint_opacity() === 0)
        return Clutter.EVENT_PROPAGATE;

      if (!this._cursorChanged) {
        let cursor = "POINTING_HAND";
        const [major, minor] = Config.PACKAGE_VERSION.split(".").map((s) =>
          Number(s),
        );

        if (major >= 48) {
          cursor = "POINTER";
        }

        global.display.set_cursor(Meta.Cursor[cursor]);
        this._cursorChanged = true;
      }

      return Clutter.EVENT_PROPAGATE;
    }

    vfunc_leave_event(event) {
      if (!this.visible || this.get_paint_opacity() === 0)
        return Clutter.EVENT_PROPAGATE;

      if (this._cursorChanged) {
        this._cursorChanged = false;
        global.display.set_cursor(Meta.Cursor.DEFAULT);
      }

      return super.vfunc_leave_event(event);
    }
  },
);

const Colosseum = GObject.registerClass(
  { GTypeName: "Colosseum" },
  class Colosseum extends PanelMenu.Button {
    _init() {
      super._init(0.0, "colosseum", false);

      this._scores = [];
      this._timeout = null;
      this._settings = null;

      this._panelBoxLayout = new St.BoxLayout();

      this._icon = new St.Icon({
        gicon: Gio.icon_new_for_string(
          EXT_PATH.replace("extension.js", "/icon/colosseum-symbolic.svg"),
        ),
        icon_size: 24,
      });

      this._menuText = new St.Label({
        text: "",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._panelBoxLayout.add_child(this._icon);
      this._panelBoxLayout.add_child(this._menuText);

      this.hide();
      this.add_child(this._panelBoxLayout);
    }

    setSettings(settings) {
      this._settings = settings;
      this._settings.connect(
        "changed::" + CONSTANTS.PREF_POSITION_TOPBAR,
        this._updatePositionInPanel.bind(this),
      );
      this._settings.connect(
        "changed::" + CONSTANTS.PREF_FOLLOWED_ONLY,
        this._update.bind(this),
      );
      this._settings.connect(
        "changed::" + CONSTANTS.PREF_COMPACT_MODE,
        this._update.bind(this),
      );

      this._client = new ColosseumClient(CONSTANTS, this._settings);
    }

    _addGamesToGrid(grid, games, offset = 0, league = null) {
      if (league != null) {
        grid.insert_row(offset);
        grid.insert_column(offset);
        grid.insert_column(offset);
        grid.insert_column(offset);

        let leagueName = new St.Label({
          text: league,
          y_expand: true,
          x_align: Clutter.ActorAlign.CENTER,
          y_align: Clutter.ActorAlign.CENTER,
        });

        grid.attach(leagueName, 0, offset, 3, 1);
        offset = offset + 1;
      }

      let pos;
      for (let j = 0; j < games.length * 3 - 1; j++) {
        pos = j + offset;

        grid.insert_row(pos);
        grid.insert_column(pos);
        grid.insert_column(pos);
        grid.insert_column(pos);
      }

      for (let j = 0; j < games.length; j++) {
        let homeRow = offset + j * 3;
        let awayRow = homeRow + 1;
        let divider_row =
          games.length == 1 ? 0 : j == games.length - 1 ? 0 : homeRow + 2;

        let homeSuffix = games[j].home.isWinner
          ? "--winner"
          : games[j].home.isLoser
            ? "--loser"
            : "";
        let awaySuffix = games[j].away.isWinner
          ? "--winner"
          : games[j].away.isLoser
            ? "--loser"
            : "";

        let homeLabel = new St.Label({
          text: games[j].home.team,
          style_class: "team" + homeSuffix,
          y_expand: true,
          y_align: Clutter.ActorAlign.CENTER,
        });

        let homeScore = new St.Label({
          text: games[j].home.score,
          style_class: "score" + homeSuffix,
          y_expand: true,
          y_align: Clutter.ActorAlign.CENTER,
        });

        let gameMeta = new St.Label({
          text: games[j].meta,
          style_class: "meta",
          y_expand: true,
          y_align: Clutter.ActorAlign.CENTER,
        });

        grid.attach(homeLabel, 0, homeRow, 1, 1);
        grid.attach(homeScore, 1, homeRow, 1, 1);
        grid.attach(gameMeta, 2, homeRow, 1, 1);

        let awayLabel = new St.Label({
          text: games[j].away.team,
          style_class: "team" + awaySuffix,
          y_expand: true,
          y_align: Clutter.ActorAlign.CENTER,
        });

        let awayScore = new St.Label({
          text: games[j].away.score,
          style_class: "score" + awaySuffix,
          y_expand: true,
          y_align: Clutter.ActorAlign.CENTER,
        });

        let gameLink = new GameLink(games[j].link);

        grid.attach(awayLabel, 0, awayRow, 1, 1);
        grid.attach(awayScore, 1, awayRow, 1, 1);
        grid.attach(gameLink, 2, awayRow, 1, 1);

        let div = new St.Label({
          text: "",
          style_class: "divider",
          y_expand: true,
          y_align: Clutter.ActorAlign.CENTER,
        });

        if (divider_row) {
          grid.attach(div, 0, divider_row, 3, 1);
        }
      }

      if (league != null) {
        grid.insert_row(pos + 1);
        grid.insert_column(pos + 1);

        grid.attach(
          new St.Label({
            text: "",
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
          }),
          0,
          pos + 1,
          1,
          1,
        );
      }

      return pos + 2;
    }

    _createMenu() {
      let menus = [];

      const HAS_COMPACT =
        this._isCompactMode() &&
        this._scores.filter((s) => s.games.length === 1).length > 0;

      const compactGrid = new Clutter.GridLayout();
      compactGrid.set_row_homogeneous(false);
      compactGrid.set_orientation(Clutter.Orientation.VERTICAL);

      const compactWidget = new St.Widget({
        style_class: "scoreboard",
        can_focus: false,
        track_hover: false,
        reactive: false,
        layout_manager: compactGrid,
      });

      let offset = 0;

      for (let i = 0; i < this._scores.length; i++) {
        if (HAS_COMPACT && this._scores[i].games.length === 1) {
          offset = this._addGamesToGrid(
            compactGrid,
            this._scores[i].games,
            offset,
            this._scores[i].league,
          );
        } else {
          let baseMenuItem = new PopupMenu.PopupBaseMenuItem({
            hover: false,
            activate: false,
          });

          let submenu = new PopupMenu.PopupSubMenuMenuItem(
            this._scores[i].league,
          );
          submenu.add_style_class_name("scoreBoardPanel");

          let grid = new Clutter.GridLayout();
          grid.set_row_homogeneous(false);
          grid.set_orientation(Clutter.Orientation.VERTICAL);

          let g = new St.Widget({
            style_class: "scoreboard",
            can_focus: false,
            track_hover: false,
            reactive: false,
            layout_manager: grid,
          });

          this._addGamesToGrid(grid, this._scores[i].games);

          baseMenuItem.add_child(g);
          submenu.menu.addMenuItem(baseMenuItem);
          menus.push(submenu);
        }
      }

      if (HAS_COMPACT) {
        const baseMenuItem = new PopupMenu.PopupBaseMenuItem({
          hover: false,
          activate: false,
        });
        const scrollView = new St.ScrollView({
          width: 295,
          hscrollbar_policy: St.PolicyType.NEVER,
          vscrollbar_policy: St.PolicyType.AUTOMATIC,
          enable_mouse_scrolling: true,
          y_expand: true,
        });
        const box = new St.BoxLayout({
          width: 295,
          y_expand: true,
        });

        box.add(compactWidget);
        scrollView.add_actor(box);
        baseMenuItem.add_actor(scrollView);
        menus.unshift(baseMenuItem);
      }

      return menus;
    }

    _getUpdateSec() {
      return (this._settings.get_int(CONSTANTS.PREF_UPDATE_FREQ) || 5) * 60;
    }

    _isCompactMode() {
      return this._settings.get_boolean(CONSTANTS.PREF_COMPACT_MODE);
    }

    async _update() {
      await this._loadData();
      let menus = this._createMenu();
      this.menu.removeAll();

      for (let i = 0; i < menus.length; i++) {
        this.menu.addMenuItem(menus[i]);
      }

      this._setTopBarText();

      if (this._timeout) {
        GLib.source_remove(this._timeout);
        this._timeout = null;
      }

      this._timeout = GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        this._getUpdateSec(),
        this._update.bind(this),
      );
    }

    async _loadData() {
      this._scores = await this._client.getScores();
    }

    _setTopBarText() {
      let remainingGames = 0;
      let liveGames = 0;
      let totalGames = 0;
      let following = 0;
      let labelText = "";

      for (let i = 0; i < this._scores.length; i++) {
        totalGames += this._scores[i].games.length;
        remainingGames += this._scores[i].games.filter(
          (g) => !g.isComplete,
        ).length;
        liveGames += this._scores[i].games.filter((g) => g.live).length;

        for (let j = 0; j < this._scores[i].following.length; j++) {
          if (following < 2) {
            labelText += this._scores[i].following[j] + " ";
          }

          following += 1;
        }
      }

      if (labelText === "") {
        this._icon.show();

        if (totalGames === 0) {
          this.hide();
        } else if (remainingGames === 0) {
          this._panelBoxLayout.show();
          this.show();
        } else if (liveGames === 0) {
          labelText = "" + remainingGames;
          this._panelBoxLayout.show();
          this.show();
        } else {
          labelText = `${liveGames} / ${remainingGames}`;
          this._panelBoxLayout.show();
          this.show();
        }
      } else {
        this._icon.hide();
        this._panelBoxLayout.show();
        this.show();
      }

      this._menuText.set_text(labelText);
    }

    _updatePositionInPanel() {
      this.container.get_parent().remove_actor(this.container);

      let boxes = {
        left: Main.panel._leftBox,
        center: Main.panel._centerBox,
        right: Main.panel._rightBox,
      };

      let position =
        this._settings.get_int(CONSTANTS.PREF_POSITION_TOPBAR) == 0
          ? "left"
          : "right";
      boxes[position].insert_child_at_index(this.container, 1);
    }

    destroy() {
      this._client.session.abort();

      if (this._timeout) {
        GLib.source_remove(this._timeout);
        this._timeout = undefined;

        this.menu.removeAll();
      }

      super.destroy();
    }
  },
);

export default class ColosseumExtension extends Extension {
  enable() {
    this.scores = new Colosseum();
    this.scores.setSettings(
      this.getSettings("org.gnome.shell.extensions.colosseum"),
    );
    this.scores._update();

    Main.panel.addToStatusArea(
      "colosseum",
      this.scores,
      1,
      this.scores._settings.get_int(CONSTANTS.PREF_POSITION_TOPBAR) == 0
        ? "left"
        : "right",
    );
  }

  disable() {
    this.scores.destroy();
    this.scores = null;
  }
}
