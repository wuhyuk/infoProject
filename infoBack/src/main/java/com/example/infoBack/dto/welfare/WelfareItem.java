package com.example.infoBack.dto.welfare;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class WelfareItem {
    private String servId;
    private String servNm;
    private String jurMnofNm;
    private String lifeNmArray;
    private String trgterIndvdlNmArray;
    private String intrsThemaNmArray;
    private String servDgst;
    private String servTypeNm;
    private String onapPsbltYn;
    private String alwServYn;
    private String servDtlLink;
}
