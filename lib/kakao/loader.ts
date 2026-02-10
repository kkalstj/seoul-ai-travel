// Kakao Maps SDK 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export function loadKakaoMap(): Promise<void> {
  // 이미 로드됨
  if (isLoaded && window.kakao && window.kakao.maps) {
    return Promise.resolve();
  }

  // 로딩 중이면 기존 Promise 반환
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!apiKey) {
      reject(new Error('NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되지 않았습니다.'));
      return;
    }

    // 이미 스크립트가 존재하는지 확인
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com"]'
    );
    if (existingScript) {
      if (window.kakao && window.kakao.maps) {
        isLoaded = true;
        isLoading = false;
        resolve();
      } else {
        existingScript.addEventListener('load', () => {
          window.kakao.maps.load(() => {
            isLoaded = true;
            isLoading = false;
            resolve();
          });
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        isLoaded = true;
        isLoading = false;
        resolve();
      });
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Kakao Maps SDK 로드에 실패했습니다.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}