// Haversine 공식으로 두 좌표 간 거리 계산 (km)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// 거리를 사람이 읽기 좋은 형태로 변환
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

// 가장 가까운 지하철역 찾기
export function findNearestStation(
  lat: number,
  lng: number,
  stations: { station_name: string; latitude: number | null; longitude: number | null }[]
) {
  let nearest = { name: '', distance: Infinity };

  for (const station of stations) {
    if (!station.latitude || !station.longitude) continue;
    const dist = calculateDistance(lat, lng, station.latitude, station.longitude);
    if (dist < nearest.distance) {
      nearest = { name: station.station_name, distance: dist };
    }
  }

  return nearest;
}