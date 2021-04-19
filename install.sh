#!/bin/bash
# Install colosseum extension for GNOME

EXTENSION_PATH="$HOME/.local/share/gnome-shell/extensions";
EXTENSION_UUID="colosseum@sereneblue";
URL="https://github.com/sereneblue/gnome-shell-extension-colosseum/archive/master.zip";

wget --header='Accept-Encoding:none' -O /tmp/colosseum_extension.zip "${URL}"

#Make directory and extract archive to it
mkdir -p "${EXTENSION_PATH}/${EXTENSION_UUID}";
unzip -q /tmp/colosseum_extension.zip -d ${EXTENSION_PATH}/${EXTENSION_UUID};
cp -r ${EXTENSION_PATH}/${EXTENSION_UUID}/gnome-shell-extension-colosseum-master/colosseum@sereneblue/* ${EXTENSION_PATH}/${EXTENSION_UUID}

# Remove repo directory and extra files
rm -r ${EXTENSION_PATH}/${EXTENSION_UUID}/gnome-shell-extension-colosseum-master;

# List enabled extensions
EXTENSION_LIST=$(gsettings get org.gnome.shell enabled-extensions | sed 's/^.\(.*\).$/\1/');

# Check if extension enabled
EXTENSION_ENABLED=$(echo ${EXTENSION_LIST} | grep ${EXTENSION_UUID});

if [ "$EXTENSION_ENABLED" = "" ]; then
	gsettings set org.gnome.shell enabled-extensions "[${EXTENSION_LIST},'${EXTENSION_UUID}']"
	# Extension is now available
	echo "colosseum has been enabled. Restart your desktop to take effect (XOrg: Alt+F2 then 'r'. Wayland: Logout/login)."
fi

# remove temporary files
rm -f /tmp/colosseum_extension.zip