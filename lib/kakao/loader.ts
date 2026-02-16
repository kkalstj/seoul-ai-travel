export function loadKakaoMap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Server-side rendering'));
      return;
    }

    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      resolve();
      return;
    }

    // 이미 스크립트 태그가 있는 경우
    if (document.querySelector('script[src*="dapi.kakao.com"]')) {
      const check = setInterval(() => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          resolve();
        });
      } else {
        reject(new Error('Kakao Maps SDK 로드 실패'));
      }
    };

    script.onerror = () => {
      reject(new Error('Kakao Maps SDK 스크립트 로드 실패'));
    };

    document.head.appendChild(script);
  });
}
