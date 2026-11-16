export type AQICategory = 
  | 'Good' 
  | 'Satisfactory' 
  | 'Moderate' 
  | 'Poor' 
  | 'Very Poor' 
  | 'Severe';

export interface StationData {
  id: string;
  name: string;
  zone: string;
  landmark: string;
  coordinates: [number, number]; // [lat, lng]
  aqi: number;
  category: AQICategory;
  pm25: number;      // µg/m³
  pm10: number;      // µg/m³
  no2: number;       // µg/m³
  so2: number;       // µg/m³
  co: number;        // mg/m³
  o3: number;        // µg/m³
  temperature: number; // °C
  humidity: number;    // %
  windSpeed: number;   // km/h
  windDirection: string;
  pressure: number;    // hPa
  lastUpdated: string;
  trend: 'rising' | 'falling' | 'stable';
  change24h: number;   // delta
}

export interface HourlyForecastPoint {
  time: string;
  hour: number;
  aqi: number;
  pm25: number;
  pm10: number;
  temp: number;
  isPeak: boolean;
}

export interface HistoricalVsPredictedPoint {
  timestamp: string;
  label: string;
  historicalAQI: number | null;
  predictedAQI: number;
  lowerBound: number;
  upperBound: number;
  confidenceScore: number; // percentage, e.g. 94%
}

export interface HealthAdvice {
  id: string;
  group: 'General Public' | 'Children & Seniors' | 'Sensitive Respiratory' | 'Outdoor Athletes';
  riskLevel: 'Low Risk' | 'Moderate Caution' | 'High Caution' | 'Severe Advisory';
  icon: string;
  headline: string;
  guidelines: string[];
  maskRecommendation: 'Not required' | 'Recommended in traffic' | 'N95 / FFP2 Strongly Advised' | 'Not required (exercise indoors)';
  outdoorActivityRating: 'Excellent' | 'Fair' | 'Limit Prolonged Strenuous Activity' | 'Avoid';
}

export interface PollutionFactorContribution {
  source: string;
  sharePercent: number;
  primaryEmissions: string;
  peakPeriod: string;
  color: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface CityOverviewSummary {
  city: string;
  state: string;
  country: string;
  currentAvgAQI: number;
  category: AQICategory;
  dominantPollutant: string;
  activeSensorsCount: number;
  totalSensorsCount: number;
  lastSyncTime: string;
  cleanestZone: { name: string; aqi: number };
  mostPollutedZone: { name: string; aqi: number };
  weather: {
    temp: number;
    humidity: number;
    condition: string;
    wind: string;
    uvIndex: number;
  };
}
