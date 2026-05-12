package com.example.infoBack.dto.welfare;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class PressReleaseItem {

    @JacksonXmlProperty(localName = "NewsItemId")
    private String newsItemId;

    @JacksonXmlProperty(localName = "Title")
    private String title;

    @JacksonXmlProperty(localName = "SubTitle1")
    private String subTitle1;

    @JacksonXmlProperty(localName = "MinisterCode")
    private String ministerCode;

    @JacksonXmlProperty(localName = "MinisterNm")
    private String ministerNm;

    @JacksonXmlProperty(localName = "ApproveDate")
    private String approveDate;

    @JacksonXmlProperty(localName = "OriginalUrl")
    private String originalUrl;
}
