@echo off
echo Starting Fuel Rationing System Development Servers...

echo Starting Laravel Backend...
start cmd /k "cd backend && php artisan serve"

echo Starting React Frontend...
start cmd /k "cd frontend && npm run dev"

echo Development servers are spinning up in separate windows!
