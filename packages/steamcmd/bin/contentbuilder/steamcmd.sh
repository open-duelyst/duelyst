#!/usr/bin/env bash

STEAMROOT="$(cd "${0%/*}" && echo $PWD)"
STEAMEXE=`basename "$0" .sh`

UNAME=`uname`
if [ "$UNAME" == "Linux" ]; then
	PLATFORM=linux32
	export LD_LIBRARY_PATH="$STEAMROOT/$PLATFORM:$LD_LIBRARY_PATH"
else # if [ "$UNAME" == "Darwin" ]; then
	PLATFORM=osx32
    export DYLD_LIBRARY_PATH="$STEAMROOT/$PLATFORM:$DYLD_LIBRARY_PATH"
fi

ulimit -n 2048

MAGIC_RESTART_EXITCODE=42

if [ "$DEBUGGER" == "gdb" ] || [ "$DEBUGGER" == "cgdb" ]; then
	ARGSFILE=$(mktemp $USER.steam.gdb.XXXX)

	# Set the LD_PRELOAD varname in the debugger, and unset the global version. 
	if [ "$LD_PRELOAD" ]; then
		echo set env LD_PRELOAD=$LD_PRELOAD >> "$ARGSFILE"
		echo show env LD_PRELOAD >> "$ARGSFILE"
		unset LD_PRELOAD
	fi

	$DEBUGGER -x "$ARGSFILE" "$STEAMROOT/$PLATFORM/$STEAMEXE" "$@"
	rm "$ARGSFILE"
else
	$DEBUGGER "$STEAMROOT/$PLATFORM/$STEAMEXE" "$@"
fi

STATUS=$?

if [ $STATUS -eq $MAGIC_RESTART_EXITCODE ]; then
    exec "$0" "$@"
fi
exit $STATUS
