## steamcmd
node.js wrapper around the `steamcmd` tools. Only works on `macOS`.

### steamcmd.appPrep
Prepare a `macOS` based `.app` application before uploading to Steam. 
We run the `contentprep.py` script against our `.app` file and it creates 
a `installscript_osx.vdf` file used by Steam to preserve symlinks for upload and installation.

### steamcmd.appBuild
Builds a local cache and uploads the Steam application with its corresponding `depots`.