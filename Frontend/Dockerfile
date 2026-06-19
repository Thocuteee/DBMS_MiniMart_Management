# --- Giai đoạn 1: Build mã nguồn React ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy các file quản lý thư viện vào trước để cache layer
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn FE và tiến hành build production
COPY . .
RUN npm run build

# --- Giai đoạn 2: Deploy bản build lên máy chủ Nginx ---
FROM nginx:alpine
# Copy thư mục tĩnh đã build từ Vite sang thư mục phân phối của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80 công khai của giao diện web
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]