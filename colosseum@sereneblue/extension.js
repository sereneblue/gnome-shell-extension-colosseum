const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const EXTENSION = ExtensionUtils.getCurrentExtension();
const CONSTANTS = EXTENSION.imports.const;
const Client = EXTENSION.imports.client;

const Colosseum = new Lang.Class({
    Name: 'Colosseum',
    Extends: PanelMenu.Button,
    _init: function() {
        this.parent(0, "colosseum", false);

        this._scores = [];
        this._timeout = null;

        const schemaSource = Gio.SettingsSchemaSource.new_from_directory(
            EXTENSION.dir.get_child('schemas').get_path(), Gio.SettingsSchemaSource.get_default(), false
        );

        this._settings = new Gio.Settings({ 
            settings_schema: schemaSource.lookup("org.gnome.shell.extensions.colosseum", true) 
        });

        this._client = new Client.ColosseumClient(CONSTANTS, this._settings);

        this._panelBoxLayout = new St.BoxLayout();

        this._icon = new St.Icon({
            gicon : Gio.icon_new_for_string( EXTENSION.dir.get_path() + '/icon/colosseum-symbolic.svg' ),
            icon_size: 24
        });

        this._menuText = new St.Label({
            text: "",
            y_align: Clutter.ActorAlign.CENTER
        });
        
        this._panelBoxLayout.add(this._icon);
        this._panelBoxLayout.add(this._menuText);

        this.hide();
        this.add_child(this._panelBoxLayout);

        this._update();
    },
    _createMenu: function() {
        let menus = [];

        for (let i = 0; i < this._scores.length; i++) {
            let baseMenuItem = new PopupMenu.PopupBaseMenuItem({
                hover: false,
                activate: false
            });

            let submenu = new PopupMenu.PopupSubMenuMenuItem(this._scores[i].league);
            submenu.add_style_class_name('scoreBoardPanel');

            let grid = new Clutter.GridLayout();
            grid.set_row_homogeneous(false);
            grid.set_orientation(Clutter.Orientation.VERTICAL);

            let g = new St.Widget({
                style_class: 'scoreboard',
                can_focus: false,
                track_hover: false,
                reactive: false,
                layout_manager: grid
            });

            for (let j = 0; j < ((this._scores[i].games.length * 3) - 1); j++) {
                grid.insert_row(j);
                grid.insert_column(j);
                grid.insert_column(j);
                grid.insert_column(j);
            }

            for (let j = 0; j < this._scores[i].games.length; j++) {
                let homeRow = j * 3;
                let awayRow = homeRow + 1;
                let divider_row = (this._scores[i].games.length == 1) ? 0 : (j == this._scores[i].games.length - 1) ? 0 : homeRow + 2;

                let homeSuffix = this._scores[i].games[j].home.isWinner ? '--winner' : this._scores[i].games[j].home.isLoser ? '--loser' : '';
                let awaySuffix = this._scores[i].games[j].away.isWinner ? '--winner' : this._scores[i].games[j].away.isLoser ? '--loser' : '';

                let homeLabel = new St.Label({ 
                    text: this._scores[i].games[j].home.team,
                    style_class: 'team' + homeSuffix,
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });

                let homeScore = new St.Label({ 
                    text: this._scores[i].games[j].home.score,
                    style_class: 'score' + homeSuffix,
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });

                let gameMeta = new St.Label({ 
                    text: this._scores[i].games[j].meta,
                    style_class: 'meta',
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });
                
                grid.attach(homeLabel, 0, homeRow, 1, 1);
                grid.attach(homeScore, 1, homeRow, 1, 1);
                grid.attach(gameMeta, 2, homeRow, 1, 1);

                let awayLabel = new St.Label({ 
                    text: this._scores[i].games[j].away.team,
                    style_class: 'team' + awaySuffix,
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });

                let awayScore = new St.Label({ 
                    text: this._scores[i].games[j].away.score,
                    style_class: 'score' + awaySuffix,
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });

                grid.attach(awayLabel, 0, awayRow, 1, 1);
                grid.attach(awayScore, 1, awayRow, 1, 1);
                
                let div = new St.Label({ 
                    text: "",
                    style_class: 'divider',
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });

                if (divider_row) {
                    grid.attach(div, 0, divider_row, 3, 1);
                }
            }

            baseMenuItem.add_actor(g);
            submenu.menu.addMenuItem(baseMenuItem);

            menus.push(submenu);
        }

        return menus;
    },
    _getUpdateSec: function() {
        return (this._settings.get_int(CONSTANTS.PREF_UPDATE_FREQ) || 5) * 60;
    },
    _update: async function () {
        await this._loadData();

        let menus = this._createMenu();

        this.menu.removeAll();

        for (let i = 0; i < menus.length; i++) {
            this.menu.addMenuItem(menus[i]);   
        }

        this._setTopBarText();

        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }

        this._timeout = Mainloop.timeout_add_seconds(this._getUpdateSec(), Lang.bind(this, this._update));
    },
    _loadData: async function() {
        this._scores = await this._client.getScores();
    },
    _setTopBarText: function() {
        let remainingGames = 0;
        let liveGames = 0;
        let totalGames = 0;
        let labelText = "";

        for (let i = 0; i < this._scores.length; i++) {
            totalGames += this._scores[i].games.length;
            remainingGames += this._scores[i].games.filter(g => !g.isComplete).length;
            liveGames += this._scores[i].games.filter(g => g.live).length;

            for (let j = 0; j < this._scores[i].following.length; j++) {
                labelText += (this._scores[i].following[j] + " ");
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
            this._panelBoxLayout.hide();
            this.show();
        }

        this._menuText.set_text(labelText);
    },
    destroy: function() {
        this._client.session.abort();

        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = undefined;

            this.menu.removeAll();
        }

        this.parent();
    }
});

let ticker;

function init() {}

function enable() {
    ticker = new Colosseum;
    Main.panel.addToStatusArea('colosseum', ticker);
}

function disable() {
    ticker.destroy();
}