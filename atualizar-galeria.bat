@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Atualizando a lista de fotos, videos e musica do album...
echo.
where py >nul 2>nul
if %errorlevel%==0 (
  py gerar_galeria.py
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    python gerar_galeria.py
  ) else (
    echo  Python nao encontrado. Instale em https://www.python.org/downloads/ e tente de novo.
  )
)
echo.
echo  Pronto! Abra (ou atualize com F5) o index.html no navegador.
echo.
pause
