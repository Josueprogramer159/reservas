@echo off
cls
echo 🐳 Iniciando despliegue con Docker Compose...
echo.

docker-compose up -d --build

echo.
echo ✅ Despliegue completado!
echo.
echo 📱 Acceso a la aplicación:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:3002
echo    Base de datos: localhost:5432
echo.
echo 📋 Comandos útiles:
echo    Ver logs: docker-compose logs -f
echo    Detener: docker-compose down
echo    Remover volúmenes: docker-compose down -v
echo.
pause
