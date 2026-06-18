package com.sieuthi.demo;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		try {
            String os = System.getProperty("os.name").toLowerCase();
            if (os.contains("win")) {
                Runtime.getRuntime().exec("cmd /c for /f \"tokens=5\" %a in ('netstat -aon ^| findstr 8080') do taskkill /f /pid %a");
            } else {
                Runtime.getRuntime().exec("sh -c kill -9 $(lsof -t -i:8080)");
            }
            Thread.sleep(500); 
        } catch (Exception e) {
        }

		Dotenv dotenv = Dotenv.configure()
						.directory("./")
						.ignoreIfMalformed()
						.ignoreIfMissing()
						.load();
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
		});

		SpringApplication.run(DemoApplication.class, args);
	}

}
