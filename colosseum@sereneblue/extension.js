const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const EXTENSION = ExtensionUtils.getCurrentExtension();
const CONSTANTS = EXTENSION.imports.const;
const Client = EXTENSION.imports.client;

const Colosseum = GObject.registerClass({ GTypeName: 'Colosseum'},
    class Colosseum extends PanelMenu.Button {
        _init() {
            super._init(0.0, "colosseum", false);

            this._scores = [];
            this._timeout = null;

            this._settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.colosseum");
            this._settings.connect('changed::' + CONSTANTS.PREF_POSITION_TOPBAR, this._updatePositionInPanel.bind(this))

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
                    y_align: Clutter.ActorAlign.CENTER 
                })

                grid.attach(leagueName, 0, offset, 3, 1);
                offset = offset + 1;
            }

            let pos;
            for (let j = 0; j < ((games.length * 3) - 1); j++) {
                pos = j + offset;

                grid.insert_row(pos);
                grid.insert_column(pos);
                grid.insert_column(pos);
                grid.insert_column(pos);
            }

            for (let j = 0; j < games.length; j++) {
                let homeRow = offset + (j * 3);
                let awayRow = homeRow + 1;
                let divider_row = (games.length == 1) ? 0 : (j == (games.length - 1)) ? 0 : homeRow + 2;

                let homeSuffix = games[j].home.isWinner ? '--winner' : games[j].home.isLoser ? '--loser' : '';
                let awaySuffix = games[j].away.isWinner ? '--winner' : games[j].away.isLoser ? '--loser' : '';

                let homeLabel = new St.Label({ 
                    text: games[j].home.team,
                    style_class: 'team' + homeSuffix,
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });

                let homeScore = new St.Label({ 
                    text: games[j].home.score,
                    style_class: 'score' + homeSuffix,
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });

                let gameMeta = new St.Label({ 
                    text: games[j].meta,
                    style_class: 'meta',
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });
                
                grid.attach(homeLabel, 0, homeRow, 1, 1);
                grid.attach(homeScore, 1, homeRow, 1, 1);
                grid.attach(gameMeta, 2, homeRow, 1, 1);

                let awayLabel = new St.Label({ 
                    text: games[j].away.team,
                    style_class: 'team' + awaySuffix,
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                });

                let awayScore = new St.Label({ 
                    text: games[j].away.score,
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

            if (league != null) {
                grid.insert_row(pos + 1);
                grid.insert_column(pos + 1);

                grid.attach(new St.Label({ 
                    text: "",
                    y_expand: true,
                    y_align: Clutter.ActorAlign.CENTER 
                }), 0, pos + 1, 1, 1);
            }

            return pos + 2;
       }

        _createMenu() {
            let menus = [];

            const HAS_COMPACT = this._isCompactMode() && this._scores.filter(s => s.games.length === 1).length > 0;

            const compactGrid = new Clutter.GridLayout();
            compactGrid.set_row_homogeneous(false);
            compactGrid.set_orientation(Clutter.Orientation.VERTICAL);

            const compactWidget = new St.Widget({
                style_class: 'scoreboard',
                can_focus: false,
                track_hover: false,
                reactive: false,
                layout_manager: compactGrid
            });

            let offset = 0;

            for (let i = 0; i < this._scores.length; i++) {
                if (HAS_COMPACT && this._scores[i].games.length === 1) {
                    offset = this._addGamesToGrid(compactGrid, this._scores[i].games, offset, this._scores[i].league);
                } else {
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

                    this._addGamesToGrid(grid, this._scores[i].games);

                    baseMenuItem.add_actor(g);
                    submenu.menu.addMenuItem(baseMenuItem);
                    menus.push(submenu);
                }
            }

            if (HAS_COMPACT) {
                const baseMenuItem = new PopupMenu.PopupBaseMenuItem({
                    hover: false,
                    activate: false
                });
                const scrollView = new St.ScrollView({ 
                    width: 295,
                    hscrollbar_policy: St.PolicyType.NEVER,
                    vscrollbar_policy: St.PolicyType.AUTOMATIC,
                    enable_mouse_scrolling: true,
                    y_expand: true
                });
                const box = new St.BoxLayout({
                    width: 295,
                    y_expand: true
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
                Mainloop.source_remove(this._timeout);
                this._timeout = null;
            }

            this._timeout = Mainloop.timeout_add_seconds(this._getUpdateSec(), this._update.bind(this));
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
                remainingGames += this._scores[i].games.filter(g => !g.isComplete).length;
                liveGames += this._scores[i].games.filter(g => g.live).length;

                for (let j = 0; j < this._scores[i].following.length; j++) {
                    if (following < 2) {
                        labelText += (this._scores[i].following[j] + " ");
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

        _updatePositionInPanel(){
            this.container.get_parent().remove_actor(this.container);

            let boxes = {
                left: Main.panel._leftBox,
                center: Main.panel._centerBox,
                right: Main.panel._rightBox
            };

            let position = this._settings.get_int(CONSTANTS.PREF_POSITION_TOPBAR) == 0 ? "left" : "right";
            boxes[position].insert_child_at_index(this.container, 1);
        }

        destroy() {
            this._client.session.abort();

            if (this._timeout) {
                Mainloop.source_remove(this._timeout);
                this._timeout = undefined;

                this.menu.removeAll();
            }

            super.destroy();
        }
});

let scores;

function init() {}

function enable() {
    scores = new Colosseum;
    Main.panel.addToStatusArea('colosseum', scores, 1, scores._settings.get_int(CONSTANTS.PREF_POSITION_TOPBAR) == 0 ? "left" : "right" );
}

function disable() {
    scores.destroy();
    scores = null;
}