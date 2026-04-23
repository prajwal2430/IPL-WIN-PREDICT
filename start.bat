@echo off
echo Starting IPL Match Prediction System...

:: Start ML Service (Flask)
start cmd /k "echo Starting ML Service... && cd ml-service && python app.py"

:: Start Node.js Backend
start cmd /k "echo Starting Backend... && cd backend && npm run dev"

:: Start React Frontend
start cmd /k "echo Starting Frontend... && cd frontend && npm run dev"

echo All services are starting up.
echo ML Service: http://localhost:5001
echo Backend API: http://localhost:5000
echo Frontend: http://localhost:3000
pause
