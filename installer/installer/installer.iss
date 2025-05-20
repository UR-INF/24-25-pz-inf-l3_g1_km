[Setup]
AppName=Hotel Task Manager
AppVersion=1.0
DefaultDirName={pf}\Hotel Task Manager
DefaultGroupName=Hotel Task Manager
OutputDir=.
OutputBaseFilename=HotelTaskManagerInstaller
PrivilegesRequired=admin

[Files]
Source: "..\frontend.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\backend.jar"; DestDir: "{app}\backend"; Flags: ignoreversion
Source: "..\mariadb.msi"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "..\installer\setup.ps1"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{group}\Hotel Task Manager"; Filename: "{app}\frontend.exe"

[Run]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{tmp}\setup.ps1"" -AppDir ""{app}"" -JarPath ""{app}\backend.jar"" -MariaDbInstaller ""{tmp}\mariadb.msi"""; Flags: runhidden
