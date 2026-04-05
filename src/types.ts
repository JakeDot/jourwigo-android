export type Tab = 'map' | 'inventory' | 'ai' | 'profile' | 'settings';

export interface Location {
  lat: number;
  lng: number;
  accuracy: number | null;
  altitude: number | null;
}

export type Theme = 'default' | 'high-contrast';
