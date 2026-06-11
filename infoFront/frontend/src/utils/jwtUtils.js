export function isTokenValid(token) {
  if (!token) return false;
  try {
    // JWT는 base64url 인코딩 사용 (+→-, /→_): atob()은 표준 base64만 처리하므로 변환 + 패딩 추가
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
