Set WshShell = CreateObject("WScript.Shell")
strScriptPath = Replace(WScript.ScriptFullName, WScript.ScriptName, "") & "sync-portfolio.ps1"
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & strScriptPath & """", 0, False
