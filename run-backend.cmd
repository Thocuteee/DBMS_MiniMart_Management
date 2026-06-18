@echo off
echo.
echo ===================================================
echo  Dang tu dong giai phong cong 8080...
echo ===================================================
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Tim thay tien trinh PID: %%a dang chiem cong 8080. Dang giai phong...
    taskkill /f /pid %%a
)
echo Cong 8080 da san sang.
echo.
echo ===================================================
echo  Dang khoi dong ung dung Spring Boot...
echo ===================================================
cd Backend\demo
call mvnw.cmd spring-boot:run
