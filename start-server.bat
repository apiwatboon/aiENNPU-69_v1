@echo off
chcp 65001 >nul
title AI Lecture Server
echo.
echo  ===== เว็บสื่อการสอนวิชา AI =====
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "192.168.208"') do set IP=%%a
echo  เปิดจากคอมเครื่องนี้:   http://localhost:8000
echo  เปิดจากมือถือ (Wi-Fi เดียวกัน):  http://%IP: =%:8000
echo.
echo  ปิดหน้าต่างนี้ = ปิด server
echo.
npx --yes http-server "%~dp0" -p 8000 -a 0.0.0.0 -c-1
