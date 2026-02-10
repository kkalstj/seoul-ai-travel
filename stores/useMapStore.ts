import { create } from 'zustand';
import { SEOUL_CENTER, DEFAULT_ZOOM } from '@/lib/utils/constants';

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  selectedPlaceId: string | null;
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
  selectPlace: (id: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: SEOUL_CENTER,
  zoom: DEFAULT_ZOOM,
  selectedPlaceId: null,
  setCenter: (lat, lng) => set({ center: { lat, lng } }),
  setZoom: (zoom) => set({ zoom }),
  selectPlace: (id) => set({ selectedPlaceId: id }),
}));