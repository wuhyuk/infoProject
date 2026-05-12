package com.example.infoBack.dto.welfare;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@JacksonXmlRootElement(localName = "response")
@Getter @Setter @NoArgsConstructor
public class PolicyNewsApiResponse {

    @JacksonXmlProperty(localName = "body")
    private Body body;

    @Getter @Setter @NoArgsConstructor
    public static class Body {

        // 실제 API 응답: <body><NewsItem>...</NewsItem><NewsItem>...</NewsItem></body>
        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "NewsItem")
        private List<PressReleaseItem> newsItems;
    }
}
