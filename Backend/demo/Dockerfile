# --- Giai đoạn 1: Build file JAR từ mã nguồn ---
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy file cấu hình maven và mã nguồn vào container
COPY pom.xml .
COPY src ./src

# Build đóng gói ứng dụng, bỏ qua chạy test để tăng tốc
RUN mvn clean package -DskipTests

# --- Giai đoạn 2: Khởi chạy ứng dụng lightweight ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy file JAR đã build từ giai đoạn 1 sang
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080 gác của Spring Boot
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]