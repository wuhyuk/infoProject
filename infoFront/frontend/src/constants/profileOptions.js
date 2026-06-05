export const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

export const DISABILITY_GRADES = ['경증', '중증'];

export const EMPLOYMENT_OPTIONS = [
  { value: '',     label: '선택 안함' },
  { value: '취업', label: '취업 (직장인/재직자)' },
  { value: '실업', label: '실업 (미취업/구직중)' },
  { value: '학생', label: '학생' },
  { value: '자영업', label: '자영업' },
];

export const FAMILY_OPTIONS = [
  { value: '',      label: '선택 안함' },
  { value: '1인가구', label: '1인 가구' },
  { value: '다자녀',  label: '다자녀 가구 (3자녀 이상)' },
  { value: '한부모',  label: '한부모 가족' },
];

export const MARITAL_OPTIONS = [
  { value: '',   label: '선택 안함' },
  { value: '미혼', label: '미혼' },
  { value: '기혼', label: '기혼' },
  { value: '이혼', label: '이혼' },
  { value: '사별', label: '사별' },
  { value: '별거', label: '별거' },
];

export const CURRENT_YEAR = new Date().getFullYear();

export const BIRTH_YEARS = Array.from({ length: 80 }, (_, i) => CURRENT_YEAR - 10 - i);
