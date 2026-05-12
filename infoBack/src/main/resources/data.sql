DELETE FROM benefit;

INSERT INTO benefit (title, category, description, min_age, max_age, target_region, max_income_level, employment_status, requires_disability, family_type, requires_gender, requires_foreign_worker, requires_north_korean, disability_grade, min_children, apply_url, organization) VALUES

-- 주거
('청년 월세 한시 특별지원', '주거', '만 19~34세 청년에게 월 최대 20만원 월세 지원. 최대 12개월 지급하며 무주택 청년이라면 소득 6분위 이하 신청 가능합니다.', 19, 34, '전국', 6, null, false, null, null, false, false, null, null, 'https://bokjiro.go.kr', '국토교통부'),
('주거급여', '주거', '소득인정액 기준 이하 가구에 임차료(최대 월 50만원) 또는 주택 수선비를 지원합니다. 중위소득 48% 이하 가구 대상.', null, null, '전국', 4, null, false, null, null, false, false, null, null, 'https://www.hb.go.kr', '국토교통부'),
('청년 전세자금 대출', '주거', '만 19~34세 청년의 전세 보증금 대출 지원. 보증금 3억원 이하 주택에 최대 2억원까지 연 1~2%대 금리로 대출 가능.', 19, 34, '전국', 5, null, false, null, null, false, false, null, null, 'https://nhuf.molit.go.kr', '국토교통부'),
('신혼부부 전세자금 대출', '주거', '혼인 기간 7년 이내 신혼부부에게 전세 보증금의 80%까지 저금리 대출 지원. 최대 3억원 한도, 연 1.2~2.1% 금리 적용.', 20, 45, '전국', 6, null, false, null, null, false, false, null, null, 'https://nhuf.molit.go.kr', '국토교통부'),
('영구임대아파트 입주', '주거', '무주택 저소득 가구에게 시중 임대료의 30% 수준으로 공공임대주택 공급. 기초수급자, 한부모, 장애인 우선 배정.', null, null, '전국', 2, null, false, null, null, false, false, null, null, 'https://www.lh.or.kr', '한국토지주택공사'),

-- 취업·고용
('국민취업지원제도', '취업·고용', '취업을 원하는 실업자에게 취업지원서비스와 구직촉진수당(월 최대 50만원, 6개월)을 제공합니다.', 15, 69, '전국', 6, '실업', false, null, null, false, false, null, null, 'https://www.kua.go.kr', '고용노동부'),
('고용보험 실업급여', '취업·고용', '비자발적 실직 시 이직 전 평균임금의 60%를 최대 270일간 지급. 단, 고용보험 피보험 단위기간 180일 이상 충족 필요.', 18, 65, '전국', null, '실업', false, null, null, false, false, null, null, 'https://www.ei.go.kr', '고용노동부'),
('청년 내일채움공제', '취업·고용', '중소기업 취업 청년이 2년 근속 시 1,200만원 적립. 본인 300만원, 기업 400만원, 정부 500만원 부담.', 15, 34, '전국', null, '취업', false, null, null, false, false, null, null, 'https://www.work.go.kr', '고용노동부'),
('경력단절 여성 재취업 지원', '취업·고용', '임신·출산·육아로 경력이 단절된 여성에게 직업훈련, 취업 알선, 인턴십 연계 및 취업 장려금 최대 60만원 지원.', 20, 60, '전국', 8, null, false, null, '여성', false, false, null, null, 'https://www.work.go.kr', '고용노동부'),
('외국인근로자 취업교육 지원', '취업·고용', '합법적으로 취업한 외국인근로자의 한국어 능력 향상 및 직업능력 개발을 위한 교육훈련비 지원.', 18, 60, '전국', null, null, false, null, null, true, false, null, null, 'https://www.eps.go.kr', '고용노동부'),
('북한이탈주민 취업 장려금', '취업·고용', '탈북민 취업 시 취업 장려금 및 고용 업체 지원금 지급. 직업훈련 연계 및 사후 취업 관리 서비스 제공.', 18, 65, '전국', null, null, false, null, null, false, true, null, null, 'https://www.unikorea.go.kr', '통일부'),
('청년 디지털 일자리', '취업·고용', 'IT 역량 갖춘 청년을 디지털 직무에 채용하는 중소·중견기업에 인건비 최대 월 200만원 지원. 청년은 정규직 전환 기회 제공.', 15, 34, '전국', null, null, false, null, null, false, false, null, null, 'https://www.work.go.kr', '고용노동부'),
('서울시 청년 수당', '취업·고용', '서울 거주 미취업 청년에게 월 50만원 최대 6개월 지원. 구직 활동 계획 수립 필수, 온라인 신청.', 19, 34, '서울', 7, '실업', false, null, null, false, false, null, null, 'https://youth.seoul.go.kr', '서울특별시'),
('외국인근로자 산재보험 지원', '취업·고용', '업무상 재해를 당한 외국인근로자에게 치료비, 휴업급여, 장해급여 등 산재보험 내국인과 동일하게 적용.', 18, null, '전국', null, '취업', false, null, null, true, false, null, null, 'https://www.comwel.or.kr', '근로복지공단'),

-- 교육·장학
('국가장학금 1유형', '교육·장학', '소득분위 8분위 이하 대학생에게 최대 연 570만원 지원. 성적 기준 충족 시(직전 학기 12학점·80점 이상) 매 학기 신청 가능.', 18, 35, '전국', 8, '학생', false, null, null, false, false, null, null, 'https://www.kosaf.go.kr', '한국장학재단'),
('다자녀 가구 대학 장학금', '교육·장학', '자녀 3명 이상 다자녀 가구의 대학생 자녀에게 소득 분위와 무관하게 연 450만원 추가 장학 혜택 지원.', 18, 30, '전국', null, null, false, '다자녀', null, false, false, null, null, 'https://www.kosaf.go.kr', '한국장학재단'),
('장애인 고등교육비 지원', '교육·장학', '장애 대학생의 학습권 보장을 위한 등록금 감면 및 도우미 서비스, 보조공학기기 지원.', 18, 35, '전국', null, '학생', true, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('북한이탈주민 학비 지원', '교육·장학', '탈북민 및 그 자녀의 교육권 보장을 위한 초·중·고 학비 전액 및 대학 등록금 최대 전액 지원.', null, null, '전국', null, null, false, null, null, false, true, null, null, 'https://www.unikorea.go.kr', '통일부'),
('평생교육 바우처', '교육·장학', '저소득층 성인의 평생학습 기회 확대를 위해 연 35만원 평생교육 바우처 지원. 온·오프라인 강좌 수강 가능.', 19, null, '전국', 4, null, false, null, null, false, false, null, null, 'https://www.lifelongedu.go.kr', '교육부'),

-- 의료·건강
('산모·신생아 건강관리 서비스', '의료·건강', '출산 가정에 건강관리사를 파견하여 산모 회복 및 신생아 돌봄 서비스 최대 20일 제공. 소득 수준에 따라 본인부담 차등.', 15, 49, '전국', 8, null, false, null, '여성', false, false, null, 1, 'https://www.socialservice.or.kr', '보건복지부'),
('노인 틀니·임플란트 보험 적용', '의료·건강', '만 65세 이상 어르신 틀니 및 임플란트 건강보험 적용으로 본인부담 30%. 7년마다 급여 적용 가능.', 65, null, '전국', null, null, false, null, null, false, false, null, null, 'https://www.nhis.or.kr', '건강보험공단'),
('의료급여', '의료·건강', '소득이 없거나 매우 낮은 가구에 의료비를 국가가 부담하는 공공부조. 1종(입원비 무료), 2종(10% 본인부담).', null, null, '전국', 1, null, false, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('외국인근로자 건강보험 동일 적용', '의료·건강', '합법 취업 외국인근로자 직장건강보험 가입 의무화. 의료비 본인부담 최소화 및 산재보험 동일 적용.', 18, null, '전국', null, '취업', false, null, null, true, false, null, null, 'https://www.nhis.or.kr', '건강보험공단'),

-- 육아·가족
('한부모가족 복지급여', '육아·가족', '한부모가족에게 아동양육비(자녀 1인당 월 21만원), 교육비, 생계비 등 지원. 만 18세 미만 자녀 양육 한부모 대상.', null, null, '전국', 5, null, false, '한부모', null, false, false, null, null, 'https://bokjiro.go.kr', '여성가족부'),
('아동수당', '육아·가족', '만 8세 미만(0~95개월) 아동 양육 가구에 아동 1인당 월 10만원 지급. 소득·재산 무관 전 아동 지급.', null, null, '전국', null, null, false, null, null, false, false, null, 1, 'https://bokjiro.go.kr', '보건복지부'),
('영아수당', '육아·가족', '만 0~23개월 영아 가정에 월 최대 70만원 지원(어린이집 미이용 시). 돌봄 방식에 따라 부모급여, 종일제 아이돌봄 등 선택 가능.', null, null, '전국', null, null, false, null, null, false, false, null, 1, 'https://bokjiro.go.kr', '보건복지부'),
('다자녀 가구 지원 패키지', '육아·가족', '자녀 3명 이상 다자녀 가구에 전기·가스요금 감면, 문화시설 이용 할인, 국민연금 추가 크레딧, KTX 30% 할인 등 통합 지원.', null, null, '전국', null, null, false, '다자녀', null, false, false, null, 3, 'https://bokjiro.go.kr', '보건복지부'),
('가족돌봄청년 지원', '육아·가족', '가족을 돌보는 만 13~34세 청년에게 심리상담, 돌봄 서비스 연계, 생활비 지원 및 자조 모임 운영.', 13, 34, '전국', 7, null, false, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('외국인근로자 자녀 보육료 지원', '육아·가족', '합법 체류 외국인근로자 자녀에게 어린이집 보육료 동일 지원. 만 0~5세 자녀 대상.', null, null, '전국', null, null, false, null, null, true, false, null, 1, 'https://bokjiro.go.kr', '보건복지부'),

-- 장애인지원
('장애인 주택 편의시설 설치 지원', '장애인지원', '장애인 가구의 주거 편의를 위한 경사로, 안전손잡이, 욕실 개조 등 편의시설 설치 비용 최대 380만원 지원.', null, null, '전국', 7, null, true, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('장애인 의료비 지원', '장애인지원', '의료급여 수급 장애인에게 진료비, 검사비, 의약품비 등 본인부담 의료비 지원. 입원 시 식대 포함.', null, null, '전국', 7, null, true, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('중증장애인 재활치료비 지원', '장애인지원', '중증장애인을 위한 물리치료, 작업치료, 언어치료 등 재활치료비 본인부담금 지원. 월 최대 22만원.', null, null, '전국', null, null, true, null, null, false, false, '중증', null, 'https://bokjiro.go.kr', '보건복지부'),
('장애인 취업 지원 서비스', '장애인지원', '장애인 직업 상담, 직업 능력 평가, 직업 훈련, 취업 알선 등 맞춤형 취업 지원 서비스 제공. 취업 성공 시 장려금 지급.', 15, null, '전국', null, null, true, null, null, false, false, null, null, 'https://www.kead.or.kr', '한국장애인고용공단'),
('장애인 대중교통 요금 할인', '장애인지원', '장애인 등록증 소지자 대중교통(지하철·버스) 요금 50% 할인 및 장애인 콜택시 이용 지원.', null, null, '전국', null, null, true, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('장애인 활동 지원', '장애인지원', '장애인의 일상생활과 사회활동을 위한 활동보조, 방문목욕, 방문간호 서비스. 등급에 따라 월 최대 480시간 제공.', null, null, '전국', null, null, true, null, null, false, false, null, null, 'https://www.socialservice.or.kr', '보건복지부'),
('장애인 연금', '장애인지원', '중증장애인의 생활안정을 위해 매월 최대 40만원 지급. 만 18세 이상 중증 등록 장애인 중 소득 하위 70%.', 18, null, '전국', 7, null, true, null, null, false, false, '중증', null, 'https://bokjiro.go.kr', '보건복지부'),

-- 노인복지
('기초연금', '노인복지', '만 65세 이상 소득 하위 70% 어르신에게 매월 최대 33만원 지급. 부부 합산 수령 시 각 20% 감액 적용.', 65, null, '전국', 7, null, false, null, null, false, false, null, null, 'https://www.nps.or.kr', '보건복지부'),
('노인 일자리 사업', '노인복지', '만 65세 이상 어르신에게 공익형(월 27만원), 사회서비스형(월 59.4만원), 시장형 일자리 제공. 건강·활력 증진 목적.', 65, null, '전국', null, null, false, null, null, false, false, null, null, 'https://www.kordi.or.kr', '보건복지부'),
('노인 맞춤형 돌봄 서비스', '노인복지', '일상생활 지원이 필요한 65세 이상 어르신에게 안전 확인, 사회참여, 생활교육, 연계 서비스 제공.', 65, null, '전국', 6, null, false, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('노인 장기요양보험', '노인복지', '신체·인지 기능이 저하된 노인에게 요양원 입소 또는 재가 서비스(방문요양, 주간보호 등) 지원.', 65, null, '전국', null, null, false, null, null, false, false, null, null, 'https://www.longtermcare.or.kr', '건강보험공단'),
('어르신 지하철 무료 이용', '노인복지', '만 65세 이상 어르신 지하철 무료 이용 및 시내버스 요금 할인 혜택. 복지카드 또는 주민등록증 제시.', 65, null, '전국', null, null, false, null, null, false, false, null, null, 'https://www.molit.go.kr', '국토교통부'),

-- 금융지원
('청년도약계좌', '금융지원', '만 19~34세 청년의 자산 형성 지원. 월 최대 70만원 적립 시 정부 기여금(최대 월 2.4만원) 및 비과세 혜택 적용.', 19, 34, '전국', 6, null, false, null, null, false, false, null, null, 'https://ylaccount.kinfa.or.kr', '금융위원회'),
('햇살론 유스', '금융지원', '저소득·저신용 청년(만 19~34세)에게 연 3.5~4.5% 고정금리로 최대 1,200만원 대출. 취업준비생, 사회초년생 대상.', 19, 34, '전국', 4, null, false, null, null, false, false, null, null, 'https://www.kinfa.or.kr', '서민금융진흥원'),
('근로장려금', '금융지원', '근로소득이 있는 저소득 가구에 최대 330만원(단독가구 165만원, 홑벌이 285만원, 맞벌이 330만원) 지급.', 18, null, '전국', 4, '취업', false, null, null, false, false, null, null, 'https://www.nts.go.kr', '국세청'),
('자녀장려금', '금융지원', '저소득 가구 자녀 1인당 최대 100만원 지원. 홑벌이·맞벌이 가구 중 소득 요건 충족 시 신청 가능.', null, null, '전국', 4, null, false, null, null, false, false, null, 1, 'https://www.nts.go.kr', '국세청'),
('소상공인 경영안정자금', '금융지원', '소상공인에게 사업 운영 및 경영 안정을 위한 저금리 정책자금 대출. 연 2~3%대 금리로 최대 7,000만원 지원.', 18, null, '전국', null, '자영업', false, null, null, false, false, null, null, 'https://www.sbiz.or.kr', '소상공인시장진흥공단'),

-- 세금혜택
('다자녀 가구 자동차 취득세 감면', '세금혜택', '18세 미만 자녀 3명 이상 다자녀 가구 자동차 취득세 최대 전액 면제(140만원 이하 전액, 초과분 50% 감면).', null, null, '전국', null, null, false, '다자녀', null, false, false, null, 3, 'https://www.mois.go.kr', '행정안전부'),
('장애인 자동차 관련 세금 면제', '세금혜택', '장애인 본인 또는 장애인과 공동등록 시 자동차 취득세, 자동차세, 개별소비세 전액 면제.', null, null, '전국', null, null, true, null, null, false, false, null, null, 'https://www.mois.go.kr', '행정안전부'),
('외국인근로자 단일세율 선택', '세금혜택', '국내 취업 외국인근로자에게 근로소득세 단일세율(19%) 선택 적용. 일반 누진세보다 유리할 경우 선택 가능.', 18, null, '전국', null, '취업', false, null, null, true, false, null, null, 'https://www.nts.go.kr', '국세청'),
('노인 재산세 감면', '세금혜택', '만 60세 이상 1세대 1주택 장기 보유 노인에게 재산세 최대 50% 감면 혜택.', 60, null, '전국', null, null, false, null, null, false, false, null, null, 'https://www.mois.go.kr', '행정안전부'),

-- 생활지원
('기초생활보장 생계급여', '생활지원', '소득 인정액이 기준 중위소득 32% 이하인 가구에 매월 생계급여 지급. 4인 가구 기준 월 최대 162만원.', null, null, '전국', 1, null, false, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('차상위 복지 서비스', '생활지원', '차상위계층에게 의료·교육·에너지·통신 등 다양한 서비스 제공. 중위소득 50% 이하 비수급 빈곤층 대상.', null, null, '전국', 2, null, false, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('긴급복지지원', '생활지원', '갑작스러운 위기(실직, 이혼, 화재, 중한 질병 등)로 생계가 어려운 가구에 긴급 생계비·의료비·주거비 지원.', null, null, '전국', 6, null, false, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부'),
('저소득층 통신요금 감면', '생활지원', '기초생활수급자·차상위계층 이동전화 월 최대 35,000원, 인터넷 50%, 유선전화 50% 요금 감면.', null, null, '전국', 2, null, false, null, null, false, false, null, null, 'https://www.msit.go.kr', '과학기술정보통신부'),
('북한이탈주민 정착 지원금', '생활지원', '탈북민 최초 정착 시 기본 정착금 및 장려금 지급(1인 기준 약 900만원). 하나원 수료 후 주거·취업 지원 연계.', null, null, '전국', null, null, false, null, null, false, true, null, null, 'https://www.unikorea.go.kr', '통일부'),
('경기도 청소년 교통비 지원', '생활지원', '경기도 거주 만 13~23세 청소년 대중교통비 연 최대 12만원 지원. 교통카드 사용 실적 기반 환급.', 13, 23, '경기', null, null, false, null, null, false, false, null, null, 'https://www.gg.go.kr', '경기도'),
('저소득층 자동차 LPG 연료 지원', '생활지원', '장애인·기초수급자 소유 차량에 LPG 연료 사용 허용 및 유류세 환급. 생계형 차량 유지비 경감.', null, null, '전국', 3, null, false, null, null, false, false, null, null, 'https://bokjiro.go.kr', '보건복지부');
