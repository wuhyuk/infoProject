package com.example.infoBack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InfoBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(InfoBackApplication.class, args);
	}
}
