# colosseum

![GNOME 40+](https://img.shields.io/badge/gnome-40%2B-blueviolet)
![colosseum version](https://img.shields.io/badge/version-10-brightgreen.svg)
![GPL v3 License](https://img.shields.io/badge/license-GPL%20v3-blue.svg)

<p align="center">
	<img src="https://user-images.githubusercontent.com/14242625/126881502-035c4601-686c-4a42-803b-ca817ad56ea4.png">
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

![colosseum preferences](https://user-images.githubusercontent.com/14242625/126881524-a9443361-12e1-4075-9cbc-8d257930cab6.png)


- The top panel can display `N (# of remaining games)` or the `A (# of live games) / B (# of remaining games)`. 

- Compact mode reduces the number of clicks needed to display scores from a league with only one game (as shown in the screen shot for NBA). 


#### Leagues

There are 12 supported sports leagues:

	Bundesliga
	2. Bundesliga
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

#### Tournaments

There are 4 supported tournaments:

	CONCACAF Gold Cup
	Copa America
	UEFA Champions League
	UEFA European Championship

# Update

If you want to update the extension, install it by following the process above. Your settings will be preserved (excluding any deprecated options). You may need to restart your session for changes to appear.