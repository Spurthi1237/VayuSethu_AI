import type { CPCBCalculationResult } from '../utils/cpcbAqiCalculator';

export interface OpenMeteoCurrentUnits {
  time: string;
  interval: string;
  pm2_5: string;
  pm10: string;
  nitrogen_dioxide: string;
  sulphur_dioxide: string;
  ozone: string;
  carbon_monoxide: string;
  us_aqi: string;
  european_aqi: string;
}

export interface OpenMeteoCurrentData {
  time: string;
  interval: number;
  pm2_5: number | null;
  pm10: number | null;
  nitrogen_dioxide: number | null;
  sulphur_dioxide: number | null;
  ozone: number | null;
  carbon_monoxide: number | null;
  us_aqi: number | null;
  european_aqi: number | null;
}

export interface OpenMeteoHourlyUnits {
  time: string;
  pm2_5: string;
  pm10: string;
  nitrogen_dioxide: string;
  sulphur_dioxide: string;
  ozone: string;
  carbon_monoxide: string;
  us_aqi: string;
  european_aqi: string;
}

export interface OpenMeteoHourlyData {
  time: string[];
  pm2_5: (number | null)[];
  pm10: (number | null)[];
  nitrogen_dioxide: (number | null)[];
  sulphur_dioxide: (number | null)[];
  ozone: (number | null)[];
  carbon_monoxide: (number | null)[];
  us_aqi: (number | null)[];
  european_aqi: (number | null)[];
}

export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: OpenMeteoCurrentUnits;
  current: OpenMeteoCurrentData;
  hourly_units: OpenMeteoHourlyUnits;
  hourly: OpenMeteoHourlyData;
}

export interface HourlyForecastItem {
  time: string;
  isoTime: string;
  hourLabel: string;
  isPastOrCurrent: boolean;
  pm2_5: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number; // in mg/m³
  us_aqi: number;
  european_aqi: number;
  hourly_cpcb_subindex_proxy: number | null; // Clearly labelled proxy
}

export interface LiveAirQualityState {
  current: OpenMeteoCurrentData;
  currentUnits: OpenMeteoCurrentUnits;
  hourlyNext24h: HourlyForecastItem[];
  precedingHourlyMap: Record<string, (number | null)[]>; // up to 24 preceding hours for each pollutant
  retrievedAt: Date;
  coordinates: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  cpcbScientificResult: CPCBCalculationResult;
  isFallback?: boolean;
  fallbackReason?: string;
}
