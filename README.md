# colosseum

![colosseum version](https://img.shields.io/badge/version-3-brightgreen.svg)
![GPL v3 License](https://img.shields.io/badge/license-GPL%20v3-blue.svg)

<p align="center">
	<img src="https://user-images.githubusercontent.com/14242625/116025529-b1f84680-a61e-11eb-9a5b-e93e1272cb08.png">
</p>

A gnome-shell extension to view live scores for your favorite sports teams.

# Installation

### From extensions.gnome.org

Visit [extensions.gnome.org](https://extensions.gnome.org/extension/4207/colosseum/) and click on the switch to install colosseum. 

### Using the install script
```
$ wget -O install.sh https://raw.githubusercontent.com/sereneblue/gnome-shell-extension-colosseum/master/install.sh
$ chmod +x install.sh
$ ./install.sh
```

### From source code
```
$ git clone https://github.com/sereneblue/gnome-shell-extension-colosseum.git
$ cd gnome-shell-extension-colosseum
$ mv colosseum@sereneblue $HOME/.local/share/gnome-shell/extensions/colosseum@sereneblue
```

# Configuration

![colosseum preferences](https://user-images.githubusercontent.com/14242625/115166188-cb7a1b00-a07f-11eb-8df9-d9ec44f6c5ad.png)

#### Leagues

There are 11 supported sports leagues:

	Bundesliga
	English Premier League
	La Liga
	Ligue 1
	Major League Baseball
	National Basketball Association
	National Football League
	National Hockey League
	Serie A
	UEFA Champions League
	Women's National Basketball Association

# Update

If you want to update the extension, install it by following the process above. Your settings will be preserved (excluding any deprecated options). You may need to restart your session for changes to appear.