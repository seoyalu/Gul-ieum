# 굴이음 Gul-ieum

굴 양식장의 수심별 환경을 확인하고 수하연 조절 후보를 검토하는 발표용 웹 앱입니다.
HTML, CSS, JavaScript로 구현했으며 `dist/`에 배포 파일이 있습니다.

## Vercel 배포

1. Vercel에서 **Add New → Project**를 선택합니다.
2. GitHub의 `seoyalu/Gul-ieum` 저장소를 가져옵니다.
3. **Root Directory**는 저장소 루트로 유지합니다.
4. **Deploy**를 누릅니다.

루트의 `vercel.json`이 Framework를 Other로 지정하고, 설치·빌드 없이 `dist` 폴더를 배포하도록 설정합니다.
별도 환경 변수는 필요하지 않습니다. Git 연동 후 `main`에 푸시하면 Vercel에서 다시 배포합니다.

## 로컬 실행 및 점검

`dist/index.html`을 브라우저에서 열면 실행할 수 있습니다.
Node.js가 설치되어 있다면 `node check.cjs`로 주요 기능을 점검할 수 있습니다.

## 프로토타입 범위

센서값과 추천은 가상 시연 데이터입니다. 실제 센서·AI 서버는 연결되어 있지 않습니다.
작업 기록은 각 브라우저의 localStorage에 저장됩니다.
