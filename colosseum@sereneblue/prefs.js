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

            const container = builder.get_object("container");
            const leagues = Object.keys(CONSTANTS.SPORTS);

        	for (let i = 0; i < leagues.length; i++) {
        		let enabled = "enabledList" + leagues[i];
        		let teams = "teamsList" + leagues[i];

                this.total[leagues[i]] = {
                    enabled: 0,
                    disabled: 0
                };

                this["_" + enabled] = builder.get_object(enabled);
                this["_" + teams] = builder.get_object(teams);

                this["_" + enabled].set_sort_func(this._sortList.bind(this));
                this["_" + teams].set_sort_func(this._sortList.bind(this));

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
        	}

            this.append(container);
        }

        _addTeam(team) {
            let row = new TeamRow(team, this._settings, this._moveRow.bind(this));

            if (row.enabled) {
                this["_enabledList" + team.league].append(row);
                this.total[team.league].enabled += 1;
            } else {
                this["_teamsList" + team.league].append(row);
                this.total[team.league].disabled += 1;
            }
        }

        _moveRow(data, wasEnabled) {
    		let enabled = "_enabledList" + data.league;
    		let teams = "_teamsList" + data.league;

            let row = [
                ...this[enabled],
                ...this[teams],
            ].find(t => t.name === data.team.name);

            if (row) {
                row.get_parent().remove(row);

                if (wasEnabled) {
                    this[enabled].append(row);

                    this.total[data.league].enabled += 1;
                    this.total[data.league].disabled -= 1;
                } else {
                    this[teams].append(row);

                    this.total[data.league].enabled -= 1;
                    this.total[data.league].disabled += 1;
                }

                this._updateTabLabel(data.league);
            }
        }

        _updateTabLabel(league) {
            this["_label" + league].set_text(league + (this.total[league].enabled ? ` (${this.total[league].enabled})` : ""));
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
}, class ExtensionRow extends Gtk.ListBoxRow {
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

function init() {}

function buildPrefsWidget() {
    let c = new colosseum();
    c.show();

    return c;
}