/**
 * ==============================================================================
 * VAYU SETHU – AI : SAMPLE MOCK TELEMETRY DATA
 * ==============================================================================
 * NOTE FOR ENGINEERS & AUDITORS:
 * This file contains strictly-labelled simulated baseline telemetry for Bengaluru,
 * India. It models real-world geographic, diurnal traffic and meteorological
 * patterns across prominent Bengaluru monitoring stations.
 * 
 * In production, this module will be replaced with live ingestion adapters connecting
 * to CPCB (Central Pollution Control Board), KSPCB, and IoT sensor meshes.
 * ==============================================================================
 */

import type { 
  CityOverviewSummary, 
  StationData, 
  HourlyForecastPoint, 
  HistoricalVsPredictedPoint, 
  HealthAdvice, 
  PollutionFactorContribution 
} from '../types/airQuality';

export const IS_MOCK_DATA = true;
export const DATA_SOURCE_LABEL = "Simulated CPCB/KSPCB Baseline Data (Bengaluru Grid)";

/**
 * Bengaluru City-wide Aggregated Summary
 */
export const BENGALURU_SUMMARY: CityOverviewSummary = {
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  currentAvgAQI: 138,
  category: "Moderate",
  dominantPollutant: "PM2.5",
  activeSensorsCount: 18,
  totalSensorsCount: 20,
  lastSyncTime: "Just now (Auto-refresh: 5m)",
  cleanestZone: {
    name: "Lalbagh Botanical Gardens",
    aqi: 64,
  },
  mostPollutedZone: {
    name: "Silk Board Junction",
    aqi: 194,
  },
  weather: {
    temp: 26.4,
    humidity: 62,
    condition: "Hazy Sunshine",
    wind: "11.2 km/h (ENE)",
    uvIndex: 5,
  },
};

/**
 * Bengaluru Key Sensor Stations (Geospatial coordinates & live metrics)
 */
export const BENGALURU_STATIONS: StationData[] = [
  {
    id: "BLR-SB-01",
    name: "Silk Board Junction",
    zone: "South-East Corridor",
    landmark: "Central Silk Board Metro Interchange",
    coordinates: [12.9176, 77.6238],
    aqi: 194,
    category: "Poor",
    pm25: 112.4,
    pm10: 178.6,
    no2: 58.2,
    so2: 14.8,
    co: 2.4,
    o3: 31.0,
    temperature: 27.8,
    humidity: 58,
    windSpeed: 8.5,
    windDirection: "ENE",
    pressure: 1012,
    lastUpdated: "4 mins ago",
    trend: "rising",
    change24h: +18,
  },
  {
    id: "BLR-WF-02",
    name: "Whitefield ITPL",
    zone: "East Tech Hub",
    landmark: "International Tech Park Bengaluru",
    coordinates: [12.9863, 77.7337],
    aqi: 168,
    category: "Poor",
    pm25: 88.5,
    pm10: 164.2,
    no2: 44.1,
    so2: 11.3,
    co: 1.8,
    o3: 38.5,
    temperature: 28.1,
    humidity: 55,
    windSpeed: 10.2,
    windDirection: "NE",
    pressure: 1013,
    lastUpdated: "7 mins ago",
    trend: "rising",
    change24h: +9,
  },
  {
    id: "BLR-PN-03",
    name: "Peenya Industrial Area",
    zone: "North-West Industrial",
    landmark: "Phase 1 Near 4th Cross",
    coordinates: [13.0285, 77.5197],
    aqi: 182,
    category: "Poor",
    pm25: 96.0,
    pm10: 195.4,
    no2: 64.8,
    so2: 24.5,
    co: 2.1,
    o3: 28.0,
    temperature: 29.0,
    humidity: 52,
    windSpeed: 7.9,
    windDirection: "NNE",
    pressure: 1011,
    lastUpdated: "2 mins ago",
    trend: "stable",
    change24h: +4,
  },
  {
    id: "BLR-IN-04",
    name: "Indiranagar 100ft Rd",
    zone: "East Central",
    landmark: "12th Main Road Junction",
    coordinates: [12.9784, 77.6408],
    aqi: 122,
    category: "Moderate",
    pm25: 54.2,
    pm10: 108.0,
    no2: 39.5,
    so2: 9.8,
    co: 1.2,
    o3: 42.1,
    temperature: 26.2,
    humidity: 63,
    windSpeed: 12.0,
    windDirection: "ENE",
    pressure: 1013,
    lastUpdated: "5 mins ago",
    trend: "falling",
    change24h: -12,
  },
  {
    id: "BLR-EC-05",
    name: "Electronic City Phase 1",
    zone: "South Tech Corridor",
    landmark: "Hosur Road Toll Gate",
    coordinates: [12.8452, 77.6602],
    aqi: 145,
    category: "Moderate",
    pm25: 68.3,
    pm10: 132.5,
    no2: 48.0,
    so2: 12.1,
    co: 1.6,
    o3: 34.0,
    temperature: 27.5,
    humidity: 60,
    windSpeed: 11.5,
    windDirection: "E",
    pressure: 1012,
    lastUpdated: "9 mins ago",
    trend: "rising",
    change24h: +11,
  },
  {
    id: "BLR-HB-06",
    name: "Hebbal Flyover Junction",
    zone: "North Airport Corridor",
    landmark: "Outer Ring Road - Bellary Road Interchange",
    coordinates: [13.0358, 77.5970],
    aqi: 156,
    category: "Poor",
    pm25: 78.4,
    pm10: 148.9,
    no2: 52.3,
    so2: 13.6,
    co: 1.9,
    o3: 36.2,
    temperature: 26.8,
    humidity: 61,
    windSpeed: 14.1,
    windDirection: "NNE",
    pressure: 1013,
    lastUpdated: "1 min ago",
    trend: "stable",
    change24h: -3,
  },
  {
    id: "BLR-LB-07",
    name: "Lalbagh Botanical Gardens",
    zone: "South Green Zone",
    landmark: "Glass House West Gate",
    coordinates: [12.9507, 77.5848],
    aqi: 64,
    category: "Satisfactory",
    pm25: 22.1,
    pm10: 48.3,
    no2: 18.5,
    so2: 5.2,
    co: 0.6,
    o3: 48.0,
    temperature: 24.8,
    humidity: 71,
    windSpeed: 9.0,
    windDirection: "E",
    pressure: 1014,
    lastUpdated: "8 mins ago",
    trend: "falling",
    change24h: -15,
  },
  {
    id: "BLR-BTM-08",
    name: "BTM Layout 2nd Stage",
    zone: "South Residential",
    landmark: "Udupi Garden Junction",
    coordinates: [12.9166, 77.6101],
    aqi: 135,
    category: "Moderate",
    pm25: 61.2,
    pm10: 119.5,
    no2: 41.0,
    so2: 10.4,
    co: 1.4,
    o3: 39.8,
    temperature: 26.9,
    humidity: 62,
    windSpeed: 9.8,
    windDirection: "ENE",
    pressure: 1013,
    lastUpdated: "6 mins ago",
    trend: "falling",
    change24h: -7,
  },
  {
    id: "BLR-JY-09",
    name: "Jayanagar 4th Block",
    zone: "South Heritage Zone",
    landmark: "Jayanagar Shopping Complex",
    coordinates: [12.9299, 77.5824],
    aqi: 88,
    category: "Satisfactory",
    pm25: 35.8,
    pm10: 74.0,
    no2: 26.4,
    so2: 7.1,
    co: 0.9,
    o3: 44.5,
    temperature: 25.6,
    humidity: 66,
    windSpeed: 10.5,
    windDirection: "E",
    pressure: 1014,
    lastUpdated: "3 mins ago",
    trend: "stable",
    change24h: -2,
  }
];

/**
 * 24-Hour Hourly Forecast Data
 */
export const HOURLY_24H_FORECAST: HourlyForecastPoint[] = [
  { time: "00:00", hour: 0, aqi: 110, pm25: 49, pm10: 95, temp: 22, isPeak: false },
  { time: "02:00", hour: 2, aqi: 105, pm25: 45, pm10: 89, temp: 21, isPeak: false },
  { time: "04:00", hour: 4, aqi: 118, pm25: 52, pm10: 102, temp: 20, isPeak: false },
  { time: "06:00", hour: 6, aqi: 142, pm25: 68, pm10: 125, temp: 21, isPeak: false },
  { time: "08:00", hour: 8, aqi: 185, pm25: 104, pm10: 168, temp: 24, isPeak: true },
  { time: "10:00", hour: 10, aqi: 172, pm25: 92, pm10: 154, temp: 27, isPeak: true },
  { time: "12:00", hour: 12, aqi: 135, pm25: 63, pm10: 118, temp: 29, isPeak: false },
  { time: "14:00", hour: 14, aqi: 124, pm25: 56, pm10: 106, temp: 30, isPeak: false },
  { time: "16:00", hour: 16, aqi: 139, pm25: 65, pm10: 120, temp: 28, isPeak: false },
  { time: "18:00", hour: 18, aqi: 192, pm25: 110, pm10: 176, temp: 26, isPeak: true },
  { time: "20:00", hour: 20, aqi: 178, pm25: 98, pm10: 162, temp: 25, isPeak: true },
  { time: "22:00", hour: 22, aqi: 146, pm25: 72, pm10: 134, temp: 23, isPeak: false },
];

/**
 * Historical vs AI Predicted Trend (Past 12 hours actual vs model forecast, next 12 hours projection)
 */
export const HISTORICAL_VS_PREDICTED: HistoricalVsPredictedPoint[] = [
  { timestamp: "T-12h", label: "09:00 AM", historicalAQI: 164, predictedAQI: 160, lowerBound: 148, upperBound: 172, confidenceScore: 95 },
  { timestamp: "T-10h", label: "11:00 AM", historicalAQI: 148, predictedAQI: 151, lowerBound: 139, upperBound: 163, confidenceScore: 94 },
  { timestamp: "T-8h",  label: "01:00 PM", historicalAQI: 129, predictedAQI: 132, lowerBound: 120, upperBound: 144, confidenceScore: 96 },
  { timestamp: "T-6h",  label: "03:00 PM", historicalAQI: 122, predictedAQI: 125, lowerBound: 113, upperBound: 137, confidenceScore: 95 },
  { timestamp: "T-4h",  label: "05:00 PM", historicalAQI: 165, predictedAQI: 168, lowerBound: 154, upperBound: 182, confidenceScore: 93 },
  { timestamp: "T-2h",  label: "07:00 PM", historicalAQI: 188, predictedAQI: 185, lowerBound: 171, upperBound: 199, confidenceScore: 92 },
  { timestamp: "Now",   label: "09:00 PM", historicalAQI: 176, predictedAQI: 176, lowerBound: 162, upperBound: 190, confidenceScore: 96 },
  { timestamp: "T+2h",  label: "11:00 PM (Pred)", historicalAQI: null, predictedAQI: 152, lowerBound: 138, upperBound: 166, confidenceScore: 91 },
  { timestamp: "T+4h",  label: "01:00 AM (Pred)", historicalAQI: null, predictedAQI: 130, lowerBound: 114, upperBound: 146, confidenceScore: 89 },
  { timestamp: "T+6h",  label: "03:00 AM (Pred)", historicalAQI: null, predictedAQI: 118, lowerBound: 101, upperBound: 135, confidenceScore: 87 },
  { timestamp: "T+8h",  label: "05:00 AM (Pred)", historicalAQI: null, predictedAQI: 138, lowerBound: 120, upperBound: 156, confidenceScore: 85 },
  { timestamp: "T+10h", label: "07:00 AM (Pred)", historicalAQI: null, predictedAQI: 174, lowerBound: 155, upperBound: 193, confidenceScore: 84 },
  { timestamp: "T+12h", label: "09:00 AM (Pred)", historicalAQI: null, predictedAQI: 186, lowerBound: 164, upperBound: 208, confidenceScore: 82 },
];

/**
 * Health Advisory Profiles & Targeted Precautions
 */
export const HEALTH_ADVISORIES: HealthAdvice[] = [
  {
    id: "HA-01",
    group: "General Public",
    riskLevel: "Moderate Caution",
    icon: "Users",
    headline: "Acceptable for healthy individuals with mild caution during peak traffic",
    guidelines: [
      "Open windows for cross-ventilation primarily between 1:00 PM and 4:00 PM when dispersion is highest.",
      "Consider using metro or closed transit during rush hours (8:30 AM–10:30 AM, 6:00 PM–8:30 PM).",
      "Stay hydrated to help clear airway mucociliary clearance."
    ],
    maskRecommendation: "Recommended in traffic",
    outdoorActivityRating: "Fair",
  },
  {
    id: "HA-02",
    group: "Sensitive Respiratory",
    riskLevel: "High Caution",
    icon: "HeartPulse",
    headline: "Asthma, COPD, and cardiovascular patients should limit exposure",
    guidelines: [
      "Keep prescribed quick-relief inhalers and emergency medication accessible.",
      "Operate HEPA-filtered indoor air purifiers in bedrooms and study areas.",
      "Avoid transit stops located directly underneath high-density flyovers."
    ],
    maskRecommendation: "N95 / FFP2 Strongly Advised",
    outdoorActivityRating: "Limit Prolonged Strenuous Activity",
  },
  {
    id: "HA-03",
    group: "Children & Seniors",
    riskLevel: "High Caution",
    icon: "Baby",
    headline: "Developing lungs and elderly immune systems require sheltered spaces",
    guidelines: [
      "Restrict morning playtime or park walks before 7:30 AM during morning ground-inversion.",
      "Ensure schools avoid high-intensity outdoor physical drills between 8:00 AM and 10:00 AM.",
      "Maintain indoor humidity between 40% and 55% to soothe mucous membranes."
    ],
    maskRecommendation: "N95 / FFP2 Strongly Advised",
    outdoorActivityRating: "Limit Prolonged Strenuous Activity",
  },
  {
    id: "HA-04",
    group: "Outdoor Athletes",
    riskLevel: "Moderate Caution",
    icon: "Activity",
    headline: "Reschedule intense cardio sessions to early afternoon or indoor facilities",
    guidelines: [
      "Deep aerobic respiration during exercise increases alveolar particulate absorption by 3.5x.",
      "Prefer tree-dense canopy loops like Cubbon Park or indoor gym facilities with filtration.",
      "Avoid jogging along Outer Ring Road, Bellary Road, and Hosur Road corridors."
    ],
    maskRecommendation: "Not required (exercise indoors)",
    outdoorActivityRating: "Limit Prolonged Strenuous Activity",
  }
];

/**
 * Bengaluru Pollution Breakdown & Contributing Drivers
 */
export const POLLUTION_FACTORS: PollutionFactorContribution[] = [
  {
    source: "Vehicular Emissions",
    sharePercent: 42,
    primaryEmissions: "PM2.5, NO2, CO, Black Carbon",
    peakPeriod: "08:30–11:00 & 17:30–21:30",
    color: "#B24E38", // Terracotta Rust
    description: "High stop-and-go congestion along Outer Ring Road, Silk Board, and Hosur Road bottlenecks producing elevated ultrafine diesel soot.",
    trend: "up",
  },
  {
    source: "Road & Construction Dust",
    sharePercent: 26,
    primaryEmissions: "PM10, Coarse Silica, Mineral Particulates",
    peakPeriod: "11:00–17:00 (dry & breezy hours)",
    color: "#B9A47A", // Muted Gold
    description: "Ongoing Namma Metro phase expansions, road re-carpeting, and commercial construction without containment barriers.",
    trend: "neutral",
  },
  {
    source: "Industrial Activity",
    sharePercent: 16,
    primaryEmissions: "SO2, VOCs, Heavy Metals, PM2.5",
    peakPeriod: "Continuous (elevated 22:00–05:00)",
    color: "#183D32", // Forest Green
    description: "Peenya, Bommasandra, and Rajajinagar small-to-medium manufacturing units, electroplating, and chemical processing.",
    trend: "down",
  },
  {
    source: "Biomass & Waste Burning",
    sharePercent: 10,
    primaryEmissions: "Black Carbon, CO, Dioxins",
    peakPeriod: "05:00–07:30 & 21:00–23:30",
    color: "#78947A", // Muted Sage
    description: "Unauthorized leaf litter and roadside municipal solid waste burning in peri-urban fringes.",
    trend: "neutral",
  },
  {
    source: "Secondary Aerosols & Meteorology",
    sharePercent: 6,
    primaryEmissions: "Nitrates, Sulfates, Photochemical Smog",
    peakPeriod: "Early mornings (Winter Inversion Layer)",
    color: "#545E57", // Charcoal Muted
    description: "Low boundary layer trapping surface pollutants during calm, cool early hours over the Bengaluru plateau.",
    trend: "up",
  }
];

/**
 * 7-Day Day-by-Day Historical Trend for City
 */
export const WEEKLY_TREND = [
  { day: "Mon", aqi: 128, pm25: 58, pm10: 114 },
  { day: "Tue", aqi: 142, pm25: 69, pm10: 128 },
  { day: "Wed", aqi: 155, pm25: 78, pm10: 142 },
  { day: "Thu", aqi: 162, pm25: 82, pm10: 150 },
  { day: "Fri", aqi: 170, pm25: 89, pm10: 161 },
  { day: "Sat", aqi: 144, pm25: 67, pm10: 130 },
  { day: "Sun", aqi: 112, pm25: 48, pm10: 98 },
];
