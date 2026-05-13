package com.example.infoBack.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "welfare.api")
@Getter @Setter
public class WelfareApiProperties {
    private String key;
    private String centralUrl;
    private String centralDetailUrl;
    private String localUrl;
    private String newsUrl;
    private String syncCron;
    private String newsRefreshCron;

    public boolean isConfigured() {
        return key != null && !key.isBlank() && !key.equals("여기에_일반_인증키_붙여넣기");
    }
}
