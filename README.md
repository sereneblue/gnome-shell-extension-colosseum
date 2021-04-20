# colosseum

![colosseum version](https://img.shields.io/badge/version-2-brightgreen.svg)
![GPL v3 License](https://img.shields.io/badge/license-GPL%20v3-blue.svg)

<p align="center">
	<img src="https://user-images.githubusercontent.com/14242625/115166165-9cfc4000-a07f-11eb-99df-400550fad124.png">
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

There are 5 supported sports leagues:

	MLB
	NBA
	NFL
	NHL
	WNBA

# Update

If you want to update the extension, install it by following the process above. Your settings will be preserved (excluding any deprecated options). You may need to restart your session for changes to appear.