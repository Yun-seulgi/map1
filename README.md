# 매장 방문 관리 앱 — 배포 안내

## 구성
- `store-visit-manager.html` — 프론트엔드 (지도/리스트/필터/엑셀 업로드 등 모든 UI)
- `server.js` — 정적 파일 서빙 + `/api/geocode` 프록시 (주소 → 위경도 변환)
- `package.json`, `.env.example` — 서버 설정

프론트엔드는 주소를 위경도로 바꿀 때 **직접 지오코딩 API를 호출하지 않고, 반드시 우리 서버의
`/api/geocode?address=...` 엔드포인트만 호출**합니다. 실제 지오코딩 API 키는 서버(`server.js`)의
환경변수에만 있고 브라우저로는 절대 전달되지 않습니다.

## 실행 방법
1. Node.js 18 이상 설치
2. 이 폴더에서:
   ```
   npm install
   cp .env.example .env
   ```
3. `.env` 파일을 열어 `GOOGLE_MAPS_API_KEY`에 실제 구글 지오코딩 API 키를 입력
   (발급: https://console.cloud.google.com/google/maps-apis/credentials — "Geocoding API" 활성화 필요)
4. 서버 실행:
   ```
   npm start
   ```
5. 브라우저에서 `http://localhost:3000` 접속 (또는 실제 서버 도메인)

## 다른 지오코딩 서비스로 바꾸고 싶다면
`server.js` 안에 구글 방식(`geocodeWithGoogle`) 코드와 카카오 로컬 API 예시
(`geocodeWithKakao`, 주석 처리됨)가 함께 들어있습니다. 카카오를 쓰려면:
1. `.env`에 `KAKAO_REST_API_KEY` 추가
2. `server.js`에서 `geocodeWithKakao` 함수의 주석을 풀고
3. `/api/geocode` 라우트 안의 `geocodeWithGoogle(address)` 호출을 `geocodeWithKakao(address)`로 교체

네이버 지오코딩 API 등 다른 서비스도 같은 패턴(주소를 받아 `{lat, lng}`를 반환)으로 추가하면 됩니다.

## 실제 서버(도메인)에 올릴 때
- 이 Node 서버를 그대로 실행할 수 있는 곳이면 어디든 됩니다 (자체 서버 + PM2/systemd, 또는 Render·Railway·Fly.io 같은 호스팅)
- Nginx 등 리버스 프록시를 앞에 둔다면, `/`와 `/api/geocode` 요청을 모두 이 Node 서버(예: 포트 3000)로 넘겨주기만 하면 됩니다
- HTTPS 도메인에서 서비스한다면 지도 타일(OpenStreetMap)이나 구글 지오코딩 API 호출도 문제없이 동작합니다

## 참고
- 현재 앱은 브라우저 메모리에만 데이터를 저장합니다 (새로고침하면 초기화). 여러 사람이 함께 쓰거나
  데이터를 계속 유지하려면 별도 데이터베이스 연동이 필요합니다 — 필요하시면 이 부분도 도와드릴 수 있어요.
