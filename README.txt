[춘천시청소년문화축제 Supabase 연동 설치 순서]

1. Supabase Dashboard > SQL Editor > New query
   - setup.sql 전체 내용을 붙여넣고 Run 실행

2. Supabase Dashboard > Authentication > Users
   - 운영자(스태프) 계정 생성
   - 관리자 계정 생성
   - 각 사용자의 UUID 복사

3. SQL Editor에서 역할 지정
   insert into public.user_roles (user_id, role)
   values ('스태프 UUID', 'staff');

   insert into public.user_roles (user_id, role)
   values ('관리자 UUID', 'admin');

4. 웹호스팅에 아래 파일 업로드(기존 파일 덮어쓰기)
   - index.html
   - register.html
   - storage.js
   - checkin.html
   - admin.html
   - login.html (신규)

5. 테스트 순서
   A. 일반 스마트폰: register.html 접속 > 등록 > QR 발급 확인
   B. 운영자 스마트폰: login.html > staff 로그인 > checkin.html에서 QR 스캔
   C. 관리자: login.html > admin 로그인 > admin.html에서 통계 확인
   D. CSV 다운로드 확인

6. 주의
   - storage.js의 sb_publishable_ 키는 브라우저 공개용 키입니다.
   - sb_secret_ 또는 service_role 키는 절대 HTML/JS에 넣지 마세요.
   - setup.sql은 웹호스팅에 올릴 필요가 없습니다. Supabase SQL Editor에서만 사용합니다.
