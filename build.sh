#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORK_DIR=`mktemp -d -p "$DIR"`

function cleanup {
  rm -rf "$WORK_DIR"
  echo "Deleted temp working directory $WORK_DIR"
}

if [[ ! "$WORK_DIR" || ! -d "$WORK_DIR" ]]; then
  echo "Could not create temp dir"
  exit 1
fi

trap cleanup EXIT

usage() {
  cat <<EOF
Usage: $0 [VERSION] [MODE]

VERSION  GNOME Shell version target to package:
           45       GNOME Shell 45+ (default)
           pre45    GNOME Shell 40-44

MODE     Package destination:
           manual   Install-by-hand zip; includes the compiled schema (default)
           release  extensions.gnome.org submission; for 45 the compiled schema
                    is excluded (compiled on install); pre45 keeps it included

EOF
}

VERSION="${1:-45}"
MODE="${2:-manual}"

if [[ "$VERSION" != "45" && "$VERSION" != "pre45" ]]; then
  echo "Unknown version: '$VERSION'" >&2
  usage
  exit 1
fi

if [[ "$MODE" != "manual" && "$MODE" != "release" ]]; then
  echo "Unknown mode: '$MODE'" >&2
  usage
  exit 1
fi

cp -r colosseum@sereneblue/* $WORK_DIR
cp -r "versions/$VERSION"/* $WORK_DIR

pushd $WORK_DIR >/dev/null

if [[ $VERSION = "45" ]]; then
  mv ui/prefs_adw.ui ui/prefs.ui
  mv ui/league-row_adw.ui ui/league-row.ui
  mv ui/tournament-row_adw.ui ui/tournament-row.ui

  sed -i -e 's/var/export const/g' ./const.js
else
  rm ui/*_adw.ui
fi

if command -v glib-compile-schemas &>/dev/null; then
  glib-compile-schemas ./schemas || {
    echo "Failed to compile schemas" >&2
    exit 1
  }
else
  echo "glib-compile-schemas not found; using committed gschemas.compiled" >&2
fi

OUTPUT="colosseum_${VERSION}"
if [[ $MODE = "release" ]]; then
  OUTPUT="${OUTPUT}_release"
fi

ZIP=(-r "../${OUTPUT}.zip" .)
if [[ $VERSION = "45" && $MODE = "release" ]]; then
  ZIP+=(-x "schemas/gschemas.compiled")
fi

zip "${ZIP[@]}"

popd >/dev/null

echo "Built ${DIR}/${OUTPUT}.zip ($MODE)"
