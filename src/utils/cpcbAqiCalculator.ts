/**
 * ==============================================================================
 * CPCB NATIONAL AIR QUALITY INDEX (NAQI) SCIENTIFIC CALCULATION ENGINE
 * ==============================================================================
 * Implements the official Central Pollution Control Board (CPCB), Ministry of 
 * Environment, Forest and Climate Change (MoEFCC), Government of India methodology.
 * 
 * SCIENTIFIC RULES ENFORCED:
 * 1. Averaging Periods:
 *    - PM2.5, PM10, NO2, and SO2 MUST use 24-hour rolling averages.
 *    - CO and O3 MUST use 8-hour rolling averages.
 *    - Sub-indices are NEVER computed directly from instantaneous 1-hour readings.
 * 
 * 2. Minimum Data Availability Requirements:
 *    - 24-hour averaged pollutants require at least 16 valid hourly measurements (>= 16/24).
 *    - 8-hour averaged pollutants require at least 6 valid hourly measurements (>= 6/8).
 *    - If a pollutant has insufficient valid hourly data, its sub-index is set to NULL.
 * 
 * 3. Overall AQI Eligibility (Three-Pollutant Rule):
 *    - An overall AQI can ONLY be computed if at least 3 pollutants have valid sub-indices.
 *    - At least one of the valid pollutants MUST be a particulate metric (PM2.5 or PM10).
 *    - Overall AQI is the maximum of all valid sub-indices.
 * 
 * 4. Model Data Transparency:
 *    - Open-Meteo assimilates Copernicus Atmosphere Monitoring Service (CAMS) models.
 *    - Designated strictly as: "Provisional CPCB-based AQI Estimate – CAMS Model Data".
 *    - Not an official regulatory station measurement.
 * ==============================================================================
 */

export interface PollutantBreakpoint {
  bLow: number;
  bHigh: number;
  iLow: number;
  iHigh: number;
}

export type CPCBNAQICategory = 
  | 'Good' 
  | 'Satisfactory' 
  | 'Moderate' 
  | 'Poor' 
  | 'Very Poor' 
  | 'Severe';

export interface PollutantSubIndexResult {
  pollutantKey: string;
  displayName: string;
  unit: string;
  averagingWindowHours: 24 | 8;
  minRequiredHours: number;
  availableHoursCount: number;
  hasSufficientData: boolean;
  averagedConcentration: number | null;
  currentInstantConcentration: number | null;
  subIndex: number | null;
  category: CPCBNAQICategory | null;
  color: string;
  statusNote: string;
}

export interface CPCBCalculationResult {
  isValid: boolean;
  aqi: number | null;
  category: CPCBNAQICategory | null;
  dominantPollutantKey: string | null;
  dominantPollutantName: string | null;
  subIndices: Record<string, PollutantSubIndexResult>;
  validPollutantsCount: number;
  hasParticulateMetric: boolean;
  displayTitle: string;
  statusMessage: string;
  methodologyNote: string;
  dataLimitationNotice: string;
  color: string;
}

// Official CPCB Breakpoints Table
export const CPCB_BREAKPOINTS_TABLE: Record<string, PollutantBreakpoint[]> = {
  // PM2.5 (24-hr standard, µg/m³)
  pm2_5: [
    { bLow: 0,   bHigh: 30,  iLow: 0,   iHigh: 50 },
    { bLow: 31,  bHigh: 60,  iLow: 51,  iHigh: 100 },
    { bLow: 61,  bHigh: 90,  iLow: 101, iHigh: 200 },
    { bLow: 91,  bHigh: 120, iLow: 201, iHigh: 300 },
    { bLow: 121, bHigh: 250, iLow: 301, iHigh: 400 },
    { bLow: 251, bHigh: 500, iLow: 401, iHigh: 500 },
  ],
  // PM10 (24-hr standard, µg/m³)
  pm10: [
    { bLow: 0,   bHigh: 50,  iLow: 0,   iHigh: 50 },
    { bLow: 51,  bHigh: 100, iLow: 51,  iHigh: 100 },
    { bLow: 101, bHigh: 250, iLow: 101, iHigh: 200 },
    { bLow: 251, bHigh: 350, iLow: 201, iHigh: 300 },
    { bLow: 351, bHigh: 430, iLow: 301, iHigh: 400 },
    { bLow: 431, bHigh: 600, iLow: 401, iHigh: 500 },
  ],
  // NO2 (24-hr standard, µg/m³)
  nitrogen_dioxide: [
    { bLow: 0,   bHigh: 40,  iLow: 0,   iHigh: 50 },
    { bLow: 41,  bHigh: 80,  iLow: 51,  iHigh: 100 },
    { bLow: 81,  bHigh: 180, iLow: 101, iHigh: 200 },
    { bLow: 181, bHigh: 280, iLow: 201, iHigh: 300 },
    { bLow: 281, bHigh: 400, iLow: 301, iHigh: 400 },
    { bLow: 401, bHigh: 800, iLow: 401, iHigh: 500 },
  ],
  // SO2 (24-hr standard, µg/m³)
  sulphur_dioxide: [
    { bLow: 0,    bHigh: 40,   iLow: 0,   iHigh: 50 },
    { bLow: 41,   bHigh: 80,   iLow: 51,  iHigh: 100 },
    { bLow: 81,   bHigh: 380,  iLow: 101, iHigh: 200 },
    { bLow: 381,  bHigh: 800,  iLow: 201, iHigh: 300 },
    { bLow: 801,  bHigh: 1600, iLow: 301, iHigh: 400 },
    { bLow: 1601, bHigh: 2400, iLow: 401, iHigh: 500 },
  ],
  // CO (8-hr standard, mg/m³)
  carbon_monoxide: [
    { bLow: 0,    bHigh: 1.0,  iLow: 0,   iHigh: 50 },
    { bLow: 1.1,  bHigh: 2.0,  iLow: 51,  iHigh: 100 },
    { bLow: 2.1,  bHigh: 10.0, iLow: 101, iHigh: 200 },
    { bLow: 10.1, bHigh: 17.0, iLow: 201, iHigh: 300 },
    { bLow: 17.1, bHigh: 34.0, iLow: 301, iHigh: 400 },
    { bLow: 34.1, bHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  // Ozone (8-hr standard, µg/m³)
  ozone: [
    { bLow: 0,   bHigh: 50,   iLow: 0,   iHigh: 50 },
    { bLow: 51,  bHigh: 100,  iLow: 51,  iHigh: 100 },
    { bLow: 101, bHigh: 168,  iLow: 101, iHigh: 200 },
    { bLow: 169, bHigh: 208,  iLow: 201, iHigh: 300 },
    { bLow: 209, bHigh: 748,  iLow: 301, iHigh: 400 },
    { bLow: 749, bHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

export const CPCB_POLLUTANT_CONFIG: Record<string, {
  name: string;
  unit: string;
  averagingWindowHours: 24 | 8;
  minRequiredHours: number;
}> = {
  pm2_5: {
    name: 'PM2.5 (Fine Particulates)',
    unit: 'µg/m³',
    averagingWindowHours: 24,
    minRequiredHours: 16,
  },
  pm10: {
    name: 'PM10 (Coarse Particulates)',
    unit: 'µg/m³',
    averagingWindowHours: 24,
    minRequiredHours: 16,
  },
  nitrogen_dioxide: {
    name: 'Nitrogen Dioxide (NO₂)',
    unit: 'µg/m³',
    averagingWindowHours: 24,
    minRequiredHours: 16,
  },
  sulphur_dioxide: {
    name: 'Sulphur Dioxide (SO₂)',
    unit: 'µg/m³',
    averagingWindowHours: 24,
    minRequiredHours: 16,
  },
  carbon_monoxide: {
    name: 'Carbon Monoxide (CO)',
    unit: 'mg/m³',
    averagingWindowHours: 8,
    minRequiredHours: 6,
  },
  ozone: {
    name: 'Ozone (O₃)',
    unit: 'µg/m³',
    averagingWindowHours: 8,
    minRequiredHours: 6,
  },
};

/**
 * Categorize AQI value into official CPCB NAQI bands
 */
export function getCPCBNAQICategory(aqi: number): { category: CPCBNAQICategory; color: string } {
  if (aqi <= 50) return { category: 'Good', color: '#183D32' };
  if (aqi <= 100) return { category: 'Satisfactory', color: '#5B8260' };
  if (aqi <= 200) return { category: 'Moderate', color: '#C2873E' };
  if (aqi <= 300) return { category: 'Poor', color: '#B24E38' };
  if (aqi <= 400) return { category: 'Very Poor', color: '#7A3E5D' };
  return { category: 'Severe', color: '#8A2222' };
}

/**
 * Calculates a single pollutant's sub-index from a verified time-averaged concentration
 * using official CPCB linear interpolation formula:
 *   I_p = I_low + [ (I_high - I_low) / (B_high - B_low) ] * (C_p - B_low)
 */
export function calculateSubIndexFromAveragedConcentration(
  pollutantKey: string,
  concentration: number | null
): number | null {
  if (concentration === null || isNaN(concentration) || concentration < 0) {
    return null;
  }

  const breakpoints = CPCB_BREAKPOINTS_TABLE[pollutantKey];
  if (!breakpoints) return null;

  for (const bp of breakpoints) {
    if (concentration >= bp.bLow && concentration <= bp.bHigh) {
      const subIndex = bp.iLow + ((bp.iHigh - bp.iLow) / (bp.bHigh - bp.bLow)) * (concentration - bp.bLow);
      return Math.round(subIndex);
    }
  }

  // Cap at 500 if exceeds highest standard breakpoint
  if (concentration > breakpoints[breakpoints.length - 1].bHigh) {
    return 500;
  }

  return null;
}

/**
 * Computes rolling average from an array of hourly readings
 * Enforces minimum required valid hours (e.g. 16 for 24h, 6 for 8h)
 */
export function computeRollingAverage(
  hourlySeries: (number | null | undefined)[],
  targetWindowHours: 24 | 8,
  minRequiredHours: number
): {
  average: number | null;
  availableHoursCount: number;
  hasSufficientData: boolean;
} {
  if (!hourlySeries || hourlySeries.length === 0) {
    return { average: null, availableHoursCount: 0, hasSufficientData: false };
  }

  // Take the most recent `targetWindowHours`
  const windowSlice = hourlySeries.slice(-targetWindowHours);
  const validValues = windowSlice.filter(
    (v): v is number => v !== null && v !== undefined && !isNaN(v) && v >= 0
  );

  const availableHoursCount = validValues.length;
  const hasSufficientData = availableHoursCount >= minRequiredHours;

  if (!hasSufficientData) {
    return {
      average: null,
      availableHoursCount,
      hasSufficientData: false,
    };
  }

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const rawAverage = sum / availableHoursCount;
  const average = Math.round(rawAverage * 100) / 100;

  return {
    average,
    availableHoursCount,
    hasSufficientData: true,
  };
}

export interface PollutantSeriesMap {
  [pollutantKey: string]: {
    hourlyHistory: (number | null)[]; // chronological hourly history up to current hour
    currentInstant?: number | null;
    isCoInMicrograms?: boolean;
  };
}

/**
 * Main Scientific CPCB Calculation Entry Point
 * 
 * Takes hourly time-series history for all pollutants,
 * computes 24h averages for PM2.5, PM10, NO2, SO2 (requiring >= 16 valid hours),
 * computes 8h averages for CO and O3 (requiring >= 6 valid hours),
 * calculates sub-indices, validates the three-pollutant rule, and returns the result.
 */
export function calculateScientificCPCBAQI(
  seriesMap: PollutantSeriesMap
): CPCBCalculationResult {
  const subIndices: Record<string, PollutantSubIndexResult> = {};
  let validPollutantsCount = 0;
  let hasParticulateMetric = false;
  let maxSubIndex = -1;
  let dominantPollutantKey: string | null = null;

  for (const [key, config] of Object.entries(CPCB_POLLUTANT_CONFIG)) {
    const inputSeries = seriesMap[key];
    const rawHourly = inputSeries?.hourlyHistory || [];
    const currentInstant = inputSeries?.currentInstant ?? (rawHourly.length > 0 ? rawHourly[rawHourly.length - 1] : null);

    // Normalize CO from µg/m³ to mg/m³ if needed
    let normalizedHourly = rawHourly;
    let normalizedInstant = currentInstant;
    if (key === 'carbon_monoxide' && (inputSeries?.isCoInMicrograms ?? true)) {
      normalizedHourly = rawHourly.map((v) => (v !== null && v !== undefined ? +(v / 1000).toFixed(3) : null));
      normalizedInstant = currentInstant !== null && currentInstant !== undefined ? +(currentInstant / 1000).toFixed(3) : null;
    }

    const { average, availableHoursCount, hasSufficientData } = computeRollingAverage(
      normalizedHourly,
      config.averagingWindowHours,
      config.minRequiredHours
    );

    let subIndex: number | null = null;
    let category: CPCBNAQICategory | null = null;
    let color = '#78947A';
    let statusNote = '';

    if (!hasSufficientData) {
      statusNote = `Insufficient data: ${availableHoursCount}/${config.minRequiredHours} hrs available (requires ≥${config.minRequiredHours} hrs for ${config.averagingWindowHours}h average)`;
    } else {
      subIndex = calculateSubIndexFromAveragedConcentration(key, average);
      if (subIndex !== null) {
        const catMeta = getCPCBNAQICategory(subIndex);
        category = catMeta.category;
        color = catMeta.color;
        statusNote = `${config.averagingWindowHours}h rolling avg: ${average} ${config.unit} (${availableHoursCount} valid hours)`;

        validPollutantsCount++;
        if (key === 'pm2_5' || key === 'pm10') {
          hasParticulateMetric = true;
        }

        if (subIndex > maxSubIndex) {
          maxSubIndex = subIndex;
          dominantPollutantKey = key;
        }
      } else {
        statusNote = 'Concentration could not be interpolated against CPCB breakpoints';
      }
    }

    subIndices[key] = {
      pollutantKey: key,
      displayName: config.name,
      unit: config.unit,
      averagingWindowHours: config.averagingWindowHours,
      minRequiredHours: config.minRequiredHours,
      availableHoursCount,
      hasSufficientData,
      averagedConcentration: average,
      currentInstantConcentration: normalizedInstant,
      subIndex,
      category,
      color,
      statusNote,
    };
  }

  // Official CPCB Multi-Pollutant Eligibility:
  // Requires at least 3 pollutants with valid sub-indices, of which at least one is PM2.5 or PM10.
  const isValid = validPollutantsCount >= 3 && hasParticulateMetric && maxSubIndex >= 0;

  if (!isValid) {
    let failureReason = 'Insufficient data for CPCB AQI';
    if (!hasParticulateMetric) {
      failureReason = 'Insufficient data for CPCB AQI: Valid 24h rolling average required for PM2.5 or PM10 (minimum 16 valid hours required)';
    } else if (validPollutantsCount < 3) {
      failureReason = `Insufficient data for CPCB AQI: Requires at least 3 criteria pollutants meeting data sufficiency (currently ${validPollutantsCount} valid)`;
    }

    return {
      isValid: false,
      aqi: null,
      category: null,
      dominantPollutantKey: null,
      dominantPollutantName: null,
      subIndices,
      validPollutantsCount,
      hasParticulateMetric,
      displayTitle: 'Provisional CPCB-based AQI Estimate – CAMS Model Data',
      statusMessage: failureReason,
      methodologyNote: 
        'CPCB rules mandate at least 3 pollutants with sufficient time-averaged data (24h for PM2.5/PM10/NO2/SO2 with ≥16h valid, 8h for CO/O3 with ≥6h valid), including PM2.5 or PM10.',
      dataLimitationNotice:
        'Calculated using CPCB mathematical sub-index algorithms on Open-Meteo / Copernicus CAMS atmospheric model simulations. Not an official regulatory CPCB station measurement.',
      color: '#78947A',
    };
  }

  const { category, color } = getCPCBNAQICategory(maxSubIndex);
  const dominantName = dominantPollutantKey ? CPCB_POLLUTANT_CONFIG[dominantPollutantKey]?.name : null;

  return {
    isValid: true,
    aqi: maxSubIndex,
    category,
    dominantPollutantKey,
    dominantPollutantName: dominantName,
    subIndices,
    validPollutantsCount,
    hasParticulateMetric,
    displayTitle: 'Provisional CPCB-based AQI Estimate – CAMS Model Data',
    statusMessage: `AQI: ${maxSubIndex} • ${category}`,
    methodologyNote: 
      `Evaluated from ${validPollutantsCount} qualifying criteria pollutants using CPCB rolling averages (24h for PM2.5/PM10/NO₂/SO₂; 8h for CO/O₃) with CPCB ≥16h/≥6h completeness criteria.`,
    dataLimitationNotice:
      'Provisional CPCB-based estimate derived from Open-Meteo / Copernicus CAMS hourly regional atmospheric chemistry simulations. Official regulatory CPCB reporting mandates 24-hour continuous physical monitoring station measurements (gravimetric/BAM).',
    color,
  };
}
