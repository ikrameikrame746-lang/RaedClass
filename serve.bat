@echo off
cd /d "%~dp0"
echo RaedClass is running at http://localhost:8000
echo Admin panel:          http://localhost:8000/admin/
echo (Close this window to stop.)
start "" http://localhost:8000
python -m http.server 8000 || py -m http.server 8000
pause
