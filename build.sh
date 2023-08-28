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

if [[ $1 = "45" ]]; then
	cp -r colosseum@sereneblue/* $WORK_DIR
	cp -r versions/45/* $WORK_DIR
	pushd $WORK_DIR
	sed -i -e 's/var/export const/g' ./const.js
	zip -r ../colosseum_45.zip .
	popd
else 
	cp -r colosseum@sereneblue/* $WORK_DIR
	cp -r versions/pre45/* $WORK_DIR
	pushd $WORK_DIR
	zip -r ../colosseum_pre45.zip .
	popd
fi

trap cleanup EXIT