#!/usr/bin/env VERSIONER_PYTHON_PREFER_32_BIT=yes /usr/bin/python

import getopt
import os
import pdb
import platform
import shutil
import stat
import subprocess
import sys
    
g_bVerbose = False
g_szAbsPath = os.path.abspath( os.path.dirname( sys.argv[0] ) )

k_InstallScriptName = "installscript_osx.vdf"
k_WrapperExe = "wrap"


def usage():
    print "usage: ", sys.argv[0], "[options]"
    print ""
    print "options:"
    print "--console                      supress GUI progress indications"
    print ""
    print "-v/--verbose                   be verbose"
    print ""
    print "-s/--source = /path/to/my.app  path to the app bundle to be processed"
    print "-d/--dest = /output/directory  destination for processed app bundle"
    print "-a/--appid = appid             steam appid"
    print ""
    print "--nowrap                       skip applying the steam ownership check wrapper"
    print "--oldstartup                   support pre-2008 startup code in the wrapper"
    print "--noscramble                   disable binary scrambling in the wrapper"
    print ""
    print "-e/--exe = path/to/exe         path to the executable to be wrapped"
    print "                               relative to --source, if not the Info.plist executable"
    print ""
    print "example:"
    print ""
    print "     %s -v -s ~/MyApp.app -d ~/Desktop -a 200 -e Contents/MacOS/MyExe" % sys.argv[0]
    
    
def wrapExe( szInPath, szOutPath, szAppId, bOldStartupSupport, bNoScramble, szLogFile = None ):
    global g_bVerbose
    global g_szAbsPath
    if g_bVerbose:
        szDebugLevel = "3"
    else:
        szDebugLevel = "2"
    cmdList = [ os.path.join( g_szAbsPath, k_WrapperExe ), "-b", g_szAbsPath, "-a", szAppId, "-d", szDebugLevel, szInPath, szOutPath ]

    if bOldStartupSupport:
        cmdList.insert(1, "-o" )

    if bNoScramble:
        cmdList.insert(1, "-n" )
        
    proc = subprocess.Popen( cmdList, stdin = None, stdout = subprocess.PIPE, stderr = subprocess.PIPE )
    (stdout, stderr) = proc.communicate()
    if szLogFile:
        f = open( szLogFile, "w" )
        print >> f, stdout
        print >> f, stderr
        f.close()
    return proc.returncode
    
    
def main():
    szInAppPath = None
    szOutPath = None
    nAppId = None
    szExe = None
    bGUI = True
    bClobber = False
    bDoWrap = True
    bOldStartupSupport = False
    bNoScramble = False
    szWrapArgs = ""
    
    if len( sys.argv ) > 1:
        for arg in sys.argv:
            if arg[:5] == "-psn_":
                sys.argv.remove(arg)
        try:
            opts, args = getopt.getopt( sys.argv[1:], "h?s:d:a:e:vcp", [ "help", "source=", "dest=", "appid=", "exe=", "console", "verbose", "clobber", "nowrap", "oldstartup", "noscramble" ] )
        except getopt.GetoptError, e:
            print ""
            print "Argument error:", e
            print ""
            sys.exit(1)
        for o,a in opts:
            if o in ( "-?", "-h", "--help" ):
                usage()
                sys.exit(1)
            if o in ( "-v", "--verbose" ):
                global g_bVerbose
                g_bVerbose = True
            if o in ( "-s", "--source" ):
                if not os.path.isdir( a ):
                    print "The chosen file (%s) doesn't appear to be an app bundle." % a
                    sys.exit(2)
                if a[-1:] == '/':
                    a = a[:len(a)-1]
                szInAppPath = os.path.normpath( os.path.abspath( a ) )
            if o in ( "-d", "--dest" ):
                if not os.path.isdir( a ):
                    print "The chosen destination (%s) doesn't appear to be a directory." % a
                    sys.exit(2)
                szOutPath = os.path.normpath( os.path.abspath( a ) )
            if o in ( "-a", "--appid" ):
                nAppId = int( a )
            if o in ( "-e", "--exe"):
                szExe = a
            if o in ( "c", "--console" ):
                bGUI = False
            if o == "--oldstartup":
                bOldStartupSupport = True
            if o == "--noscramble":
                bNoScramble = True
            if o == "--nowrap":
                bDoWrap = False
            if o == "--clobber":
                bClobber = True

       
        if szOutPath and szInAppPath and os.path.exists( os.path.join( szOutPath, os.path.split( szInAppPath )[1] ) ):
            if bClobber:
                shutil.rmtree( os.path.join( szOutPath, os.path.split( szInAppPath )[1] ) )
            else:
                print "The app already exists in the target directory.  (Re)move it and try again."
                sys.exit(2)
        
    if bGUI:
        try:
            import wxversion
            wxversion.select(["2.7","2.8"])
            import wx
        except:
            if os.getenv( "VERSIONER_PYTHON_PREFER_32_BIT" ) == "no":
                os.putenv( "VERSIONER_PYTHON_PREFER_32_BIT", "yes" )
                os.execv( sys.argv[0], sys.argv )
                sys.exit(2)
            else:
                # we're already 32bit, and we failed to import wx, fall back
                # to applescript to tell the user what to do.
                aScript = '''tell app "System Events" to display dialog \
                "This tool requires wxPython, which Apple has stopped shipping in OSX Lion.\n\
                \nwxPython for Python %s can be downloaded from the following URL:"\
                buttons "Exit" default answer "http://sourceforge.net/projects/wxpython/files/wxPython/2.8.12.1/wxPython2.8-osx-unicode-2.8.12.1-universal-py2.7.dmg/download" with icon 2'''
                ret = subprocess.call( [ 'osascript', '-e', aScript % platform.python_version() ],
                                       stdout = subprocess.PIPE, stderr = subprocess.STDOUT )
                sys.exit(2)
        global app
        app = wx.App(False)
    
    while szInAppPath is None and bGUI:
        dialog = wx.FileDialog( None, message = "Select App To Process", wildcard = "Apps | *.app", style = wx.FD_OPEN )
        if dialog.ShowModal() == wx.ID_CANCEL:
            sys.exit(1)
        szInAppPath = dialog.GetPath()
        # make sure it's a directory
        if not os.path.isdir( szInAppPath ):
            szInAppPath = None
            wx.MessageDialog( parent = None, message ="The chosen file doesn't appear to be an app bundle.  Choose again.",
                              style = wx.OK | wx.ICON_ERROR ).ShowModal()

        if not os.path.exists( os.path.join( szInAppPath, "Contents", "Info.plist" ) ):
            szInAppPath = None
            wx.MessageDialog( parent = None, message ="The chosen directory doesn't appear to be an app bundle (there's no Info.plist).  Choose again.",
                              style = wx.OK | wx.ICON_ERROR ).ShowModal()
    
    if bDoWrap:
        foundBundleExecutable = False
        if szExe is None:
            plistLines = open( os.path.join( szInAppPath, "Contents", "Info.plist" ) ).readlines()

            for line in plistLines:
                if foundBundleExecutable:
                    szExe = os.path.join( "Contents", "MacOS", line.strip()[8:-9] )
                    break
                if line.strip().lower() == "<key>CFBundleExecutable</key>".lower():
                    foundBundleExecutable = True

        # normalize the path to the exe for future comparisons
        szExe = os.path.normpath( os.path.join( szInAppPath, szExe ) )
        
        if not os.path.exists( szExe ):
            print "The specified exe ('%s') doesn't exist - make sure you specified a relative path" % szExe
            sys.exit(2)

        if bGUI:
            # defer the class definition 'till now so we can only import wx if not running --console
            class ExeAndAppIdConfirm( wx.Dialog ):
                def __init__( self, parent, title ):
                    wx.Dialog.__init__( self, parent, -1, title, size = (500,230), style=wx.DEFAULT_DIALOG_STYLE )

                    panel = wx.Panel( self, -1 )
                    wx.StaticText( self, -1, "Executable:", (10, 20) )
                    self.exe = wx.TextCtrl( self, -1, '', (90, 20), (320, -1) )
                    self.browse = wx.Button( self, -1, "Browse", (420,20) )
                    self.Bind( wx.EVT_BUTTON, self.OnBrowse, id = self.browse.GetId() )

                    wx.StaticText( self, -1, "AppId:", (10, 60) )   
                    self.appid = wx.TextCtrl( self, -1, '', (90, 60), (80, -1) )
                    self.appid.SetFocus()

                    self.noscramble = wx.CheckBox( self, -1, "Disable binary scrambling", (10, 100) )

                    self.oldstartup = wx.CheckBox( self, -1, "Support pre-2008 startup code", (10, 120) )
                    wx.StaticText( self, -1, "Use this only if DRM fails and the app is prior to 2008", (30, 140) )

                    self.ok = wx.Button( self, wx.ID_OK, "OK", (170, 170) )
                    self.cancel = wx.Button( self, wx.ID_CANCEL, "Cancel", (295, 170) )

                    self.Center()

                def ShowModal( self ):
                    if not os.path.isfile( self.exe.GetValue() ):
                        self.OnBrowse()
                    wx.Dialog.ShowModal( self )

                def getOldStartup( self ):
                    return self.oldstartup.GetValue()

                def getNoScramble( self ):
                    return self.noscramble.GetValue()
                
                def setExe( self, szExe ):
                    self.exe.SetValue( szExe )

                def getExe( self ):
                    return self.exe.GetValue()

                def setAppId( self, szAppId ):
                    self.appid.SetValue( szAppId )

                def getAppId( self ):
                    return int( self.appid.GetValue() )

                def OnBrowse( self, event = None ):
                    dialog = wx.FileDialog( None, message = "Select Executable", style = wx.FD_OPEN )
                    if not os.path.isdir( self.exe.GetValue() ):
                        szBrowseDir = self.exe.GetValue()[:-len(os.path.basename(self.exe.GetValue()))]
                    else:
                        szBrowseDir = os.path.join( self.exe.GetValue(), "Contents" )
                    dialog.SetDirectory( szBrowseDir )
                    if dialog.ShowModal() == wx.ID_CANCEL:
                        return
                    self.exe.SetValue( dialog.GetPath() )

            if not szExe or not nAppId:
                dialog = ExeAndAppIdConfirm( None, "Confirm Exe and AppId" )
                if nAppId:
                    dialog.setAppId( str(nAppId) )
                if foundBundleExecutable:
                    dialog.setExe( os.path.join( szInAppPath, "Contents", "MacOS", szExe ) )
                else:
                    dialog.setExe( os.path.join( szInAppPath ) )
                
                if dialog.ShowModal() == wx.ID_CANCEL:
                    sys.exit(1)
                szExe = dialog.getExe()
                bOldStartupSupport = dialog.getOldStartup();
                bNoScramble = dialog.getNoScramble();
                nAppId = int( dialog.getAppId() )
        else:
            if szExe and nAppId:
                print "processing executable '%s' as AppId %d" % ( szExe, nAppId ) 
            else:
                print "exe or appid not provided, skipping wrapping"
                
    while szOutPath is None and bGUI:
        dialog = wx.DirDialog( None, message = "Select Destination Directory", style = wx.FD_OPEN )
        if szOutPath:
            dialog.SetPath( szOutPath)
        else:
            dialog.SetPath( os.path.join( szInAppPath, ".." ) )
        if dialog.ShowModal() == wx.ID_CANCEL:
            sys.exit(1)
        szOutPath = dialog.GetPath()
        # make sure it's a directory
        if not os.path.isdir( szInAppPath ):
            szOutPath = None
            wx.MessageDialog( parent = None, message ="The target doesn't appear to be a directory.", style = wx.OK ).ShowModal()
        if os.path.exists( os.path.join( szOutPath, os.path.split( szInAppPath )[1] ) ):
            szOutPath = None
            wx.MessageDialog( parent = None, message ="The app to process already exists in the chosen output directory.  Choose again.",
                              style = wx.OK | wx.ICON_ERROR ).ShowModal()

    if g_bVerbose: print szInAppPath + " -> " + szOutPath

    szInAppParentDir = os.path.split( szInAppPath )[0] 
    szAppName = os.path.split( szInAppPath )[1]

    dialog = None
    if bGUI:
        dialog = wx.ProgressDialog( title = "Processing Application '%s'..." % szAppName[:-3], message = "Scanning '%s'..." % szAppName[:-3], style = wx.PD_CAN_ABORT )
        dialog.SetSize( ( 500, 50 ) )
    else:
        print "Processing %s" % szAppName[:-4],
    szTarget = os.path.join( szOutPath, szAppName )
    if g_bVerbose: print "mkdir " + szTarget

    # make sure the directory we create is writable, even if the source dir isn't
    os.mkdir( szTarget, os.stat( szInAppPath ).st_mode | stat.S_IWRITE )

    lLinks = []
    lExes = []
        
    for (root, dirs, files) in os.walk( szInAppPath, followlinks = True ):
        if bGUI:
            (bcontinue, bskip) = dialog.Pulse()
            if not bcontinue:
                sys.exit(2)
        
        bLoop = True
        while bLoop:
            bLoop = False
            for adir in dirs:
                if os.path.islink( os.path.join( root, adir ) ):
                    ( link, target ) = ( os.path.join( root[len(szInAppParentDir)+1:], adir ), os.readlink( os.path.join( root, adir ) ) )
                    if g_bVerbose: print "link: " + link + " -> " + target
                    lLinks.append( ( link, target ) )
                    dirs.remove( adir )
                    bLoop = True
                
        # start iteration again, we may have removed links
        for adir in dirs:
            assert( not os.path.islink( os.path.join( root, adir ) ) )
            szTarget = os.path.join( szOutPath, root[len(szInAppParentDir)+1:], adir )
            if bGUI:
                ( bcontinue, bskip ) = dialog.Pulse( "processing directory %s" % adir )
                if not bcontinue:
                    sys.exit(2)
            else:
                print ".",
            if g_bVerbose: print "mkdir " + szTarget
            # make sure the directory we create is writable, even if the source dir isn't
            os.mkdir( szTarget, os.stat( root ).st_mode | stat.S_IWRITE )

        for afile in files:
            if bGUI:
                ( bcontinue, bskip ) = dialog.Pulse()
                if not bcontinue:
                    sys.exit(2)
            if os.path.islink( os.path.join( root, afile ) ):
                ( link, target ) = ( os.path.join( root[len(szInAppParentDir)+1:], afile ), os.readlink( os.path.join( root, afile ) ) )
                if g_bVerbose: print "link: " + link + " -> " + target
                lLinks.append( ( link, target ) ) 
            else:
                statinfo = os.stat( os.path.join( root, afile ) )
                if statinfo.st_size > 1024 * 1024:
                    if bGUI:
                        szName = os.path.join( root[len(szInAppPath)+1:], afile )
                        if len( szName ) > 50:
                            szName = "..." + os.path.join( root[len(szInAppPath)+1:], afile )[-50:]
                        ( bcontinue, bskip ) = dialog.Pulse( "copying %s" % szName )
                        if not bcontinue:
                            sys.exit(2)
                    else:
                        print ".",
                else:
                    if bGUI:
                        ( bcontinue, bskip ) = dialog.Pulse()
                        if not bcontinue:
                            sys.exit(2)             
                mode = statinfo.st_mode
                if mode & stat.S_IEXEC:
                    if g_bVerbose: print "executable: " + os.path.join( root, afile )
                    lExes.append( ( os.path.join( root[len(szInAppParentDir)+1:], afile ), mode ) )
                szTarget = os.path.join( szOutPath, root[len(szInAppParentDir)+1:], afile )
                if g_bVerbose: print "copy file: " + os.path.join( root, afile ) + " -> " + szTarget
                if bDoWrap and os.path.join( root, afile ) == szExe:
                    print "found bundle executable '%s', wrapping..." % szExe
                    logFile = os.path.join( szOutPath, szAppName[:-3] + "txt" )
                    ret = wrapExe( szExe, szTarget, str( nAppId ), bOldStartupSupport, bNoScramble, szLogFile = logFile )
                    if ret != 0:
                        msg = "There was an error processing the executable. See logfile '%s' for more information." % logFile
                        if bGUI:
                            dialog.Hide()
                            wx.MessageDialog( parent = None,
                                              message = msg,
                                              style = wx.OK | wx.ICON_ERROR ).ShowModal()
                        else:
                            print msg
                        return
                else:
                    shutil.copy2( os.path.join( root, afile ), szTarget )

    if g_bVerbose: print lLinks
    if g_bVerbose: print lExes

    szInstallScript = ""

    if len( lLinks ) or len( lExes ):
        szInstallScript = '"Installscript"\n{'
        szInstallScript += '\n\t"version"\t"2"'
        
    if len( lLinks ):
        if bGUI:
            ( bcontinue, bskip ) = dialog.Pulse( "processing symlinks" )
            if not bcontinue:
                sys.exit(2)

        szInstallScript += '\n\t"symlink"\n\t{\n'
        i = 0
        for alink in lLinks:
            szInstallScript += '\t\t"%d"\n\t\t{\n' % i
            szInstallScript += '\t\t\t"link"\t"%s"\n' % alink[0]
            szInstallScript += '\t\t\t"target"\t"%s"\n' % alink[1]
            szInstallScript += '\t\t}\n'
            i+=1
        szInstallScript += '\t}'

    if len( lExes ):
        if bGUI:
            ( bcontinue, bskip ) = dialog.Pulse( "processing executables" )
            if not bcontinue:
                sys.exit(2)
        szInstallScript += '\n\t"chmod"\n\t{\n'

        i = 0
        for anexe in lExes:
            szInstallScript += '\t\t"%d"\n\t\t{\n' % i
            szInstallScript += '\t\t\t"file"\t"%s"\n' % anexe[0]
            szInstallScript += '\t\t\t"mode"\t"%o"\n' % stat.S_IMODE( anexe[1] )
            szInstallScript += '\t\t}\n'
            i+=1
        szInstallScript += '\t}'

    if len( lLinks ) or len( lExes ):
        szInstallScript += '\n}\n'
        if bGUI:
            ( bcontinue, bskip ) = dialog.Pulse( "writing installscript" )

        f = open( os.path.join( szOutPath, szAppName, k_InstallScriptName ), "a" )
        print >> f, szInstallScript
        f.close()
        
    if bGUI:
        dialog.Hide()
        wx.MessageDialog( parent = None, message ="%s Processed Successfully." % szAppName,
                          style = wx.OK | wx.ICON_INFORMATION ).ShowModal()
    else:
        print "done"

if __name__ == '__main__':
    main()
