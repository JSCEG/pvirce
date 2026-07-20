@echo off
setlocal
cd /d "%~dp0"
set "PAGE=ENERGIA-LIMPIA-SENER.sd75.html"
set "PORT=8000"
echo ============================================================
echo  SENER - Servidor local para los dashboards
echo  Carpeta: "%CD%"
echo  URL:     http://localhost:%PORT%/%PAGE%
echo  (Deja esta ventana abierta. Ctrl+C para detener.)
echo  Si al abrir ves un error, espera 1s y pulsa F5.
echo ============================================================
start "" "http://localhost:%PORT%/%PAGE%"
where python >nul 2>nul
if %errorlevel%==0 ( python -m http.server %PORT% & goto end )
where py >nul 2>nul
if %errorlevel%==0 ( py -m http.server %PORT% & goto end )
where npx >nul 2>nul
if %errorlevel%==0 ( npx --yes http-server -p %PORT% & goto end )
echo.
echo No encontre Python ni Node instalados.
echo Alternativa: en VS Code, clic derecho sobre el HTML -^> "Open with Live Server".
pause
:end
