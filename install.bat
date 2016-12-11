@ECHO OFF

WHERE node > nul
IF %ERRORLEVEL% NEQ 0 (
  ECHO Node.js is not installed
  EXIT /B
)

WHERE git > nul
IF %ERRORLEVEL% NEQ 0 (
  ECHO git is not installed
  EXIT /B
)

IF EXIST %USERPROFILE%\.nom (
  ECHO nom is already installed or something is occupying %USERPROFILE%\.nom
  SET /P response=Remove %USERPROFILE%\.nom and update? [y\N]
  IF "%response%" NEQ "y" (
    EXIT /B
  ) ELSE (
    RMDIR /S /Q %USERPROFILE%\.nom
    ECHO.
  )
)

ECHO|set /p="Cloning repository..."
git clone https://github.com/nanalan/nom.git %USERPROFILE%\.nom --quiet > NUL
ECHO  done

attrib +h %USERPROFILE%\.nom
cd %USERPROFILE%\.nom
ECHO|set /p="Installing dependencies..."

WHERE yarn > nul
IF %ERRORLEVEL% NEQ 0 (
  CMD /C "npm install --ignore-scripts > nul"
) ELSE (
  CMD /C "yarn --ignore-scripts > nul"
)

ECHO  done

ECHO|set /p="Compiling grammar..."
./node_modules/nearley/bin/nearleyc.js src/grammar/grammar.ne -o src/grammar/grammar.js 2> NUL
ECHO  done

ECHO|set /p="Symlinking binary..."
CMD /C "npm link > nul"
IF %ERRORLEVEL% NEQ 0 (
  ECHO  fail
  EXIT /B
)
WHERE nom > nul
IF %ERRORLEVEL% NEQ 0 (
  ECHO  fail
  EXIT /B
)
ECHO Symlinking binary... done

ECHO    _ __    ___   _ __ ___
ECHO   ^| '_ \\ / _ \\^| '_ \` _\\
ECHO   ^| ^| ^| ^|  (_)  ^| ^| ^| ^| ^| ^|
ECHO   ^|_^| ^|_^| \___//^|_^| ^|_^| ^|_^|
ECHO.

ECHO|set /p="  Installed nom v"
nom hello
ECHO.
DEL %USERPROFILE%\.nom.bat
