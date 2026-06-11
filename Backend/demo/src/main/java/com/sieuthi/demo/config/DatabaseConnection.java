package com.sieuthi.demo.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import io.github.cdimascio.dotenv.Dotenv; 

public class DatabaseConnection {
    
    public static Connection getConnection() throws SQLException {
        Dotenv dotenv = Dotenv.configure()
                        .directory("./") 
                        .ignoreIfMalformed()
                        .ignoreIfMissing()
                        .load();
        String url = dotenv.get("DB_URL");
        String user = dotenv.get("DB_USER");
        String password = dotenv.get("DB_PASSWORD");

        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            return DriverManager.getConnection(url, user, password);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Không tìm thấy Driver kết nối SQL Server! Hãy kiểm tra lại file pom.xml", e);
        }
    }
}
