/**
 * ==============================================================================
 * CPCB NAQI CALCULATION ENGINE - SCIENTIFIC UNIT TESTS
 * ==============================================================================
 * Validates:
 * 1. Official CPCB breakpoint boundary values for all criteria pollutants.
 * 2. 24-hour averaging for PM2.5, PM10, NO2, and SO2.
 * 3. 8-hour averaging for CO and O3.
 * 4. 16-hour minimum valid data requirement for 24h averaged pollutants.
 * 5. 6-hour minimum valid data requirement for 8h averaged pollutants.
 * 6. Minimum three-pollutant eligibility rule (including at least one particulate).
 * 7. Correct title: "Provisional CPCB-based AQI Estimate – CAMS Model Data".
 * ==============================================================================
 */

import { 
  calculateSubIndexFromAveragedConcentration, 
  computeRollingAverage, 
  calculateScientificCPCBAQI 
} from './cpcbAqiCalculator.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
}

export function runCPCBScienceTests() {
  console.log('\n--- SUITE 1: Official CPCB Breakpoint Interpolations & Boundary Cases ---');
  
  // PM2.5 Breakpoints (0-30 -> 0-50, 31-60 -> 51-100, 61-90 -> 101-200, 91-120 -> 201-300, 121-250 -> 301-400, 251-500 -> 401-500)
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 0) === 0, 'PM2.5 @ 0 µg/m³ = AQI 0 (Good)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 15) === 25, 'PM2.5 @ 15 µg/m³ = AQI 25 (Good)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 30) === 50, 'PM2.5 @ 30 µg/m³ = AQI 50 (Good Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 31) === 51, 'PM2.5 @ 31 µg/m³ = AQI 51 (Satisfactory Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 60) === 100, 'PM2.5 @ 60 µg/m³ = AQI 100 (Satisfactory Upper Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 61) === 101, 'PM2.5 @ 61 µg/m³ = AQI 101 (Moderate Lower Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 90) === 200, 'PM2.5 @ 90 µg/m³ = AQI 200 (Moderate Upper Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 120) === 300, 'PM2.5 @ 120 µg/m³ = AQI 300 (Poor Upper Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 250) === 400, 'PM2.5 @ 250 µg/m³ = AQI 400 (Very Poor Upper Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 375) === 450, 'PM2.5 @ 375 µg/m³ = AQI 450 (Severe)');
  assert(calculateSubIndexFromAveragedConcentration('pm2_5', 600) === 500, 'PM2.5 @ 600 µg/m³ capped at 500');

  // PM10 Breakpoints (0-50 -> 0-50, 51-100 -> 51-100, 101-250 -> 101-200)
  assert(calculateSubIndexFromAveragedConcentration('pm10', 50) === 50, 'PM10 @ 50 µg/m³ = AQI 50 (Good Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm10', 100) === 100, 'PM10 @ 100 µg/m³ = AQI 100 (Satisfactory Boundary)');
  assert(calculateSubIndexFromAveragedConcentration('pm10', 175) === 150, 'PM10 @ 175 µg/m³ = AQI 150 (Moderate)');

  // Carbon Monoxide (mg/m³)
  assert(calculateSubIndexFromAveragedConcentration('carbon_monoxide', 1.0) === 50, 'CO @ 1.0 mg/m³ = AQI 50');
  assert(calculateSubIndexFromAveragedConcentration('carbon_monoxide', 2.0) === 100, 'CO @ 2.0 mg/m³ = AQI 100');

  // Ozone (µg/m³)
  assert(calculateSubIndexFromAveragedConcentration('ozone', 50) === 50, 'Ozone @ 50 µg/m³ = AQI 50');
  assert(calculateSubIndexFromAveragedConcentration('ozone', 100) === 100, 'Ozone @ 100 µg/m³ = AQI 100');

  console.log('\n--- SUITE 2: Rolling Average Windows & Minimum Data Availability (16h & 6h Rule) ---');

  // 24-hour window with 15 valid hours (fails 16-hour requirement)
  const series15Valid: (number | null)[] = [
    ...Array(15).fill(25),
    ...Array(9).fill(null),
  ];
  const avg15 = computeRollingAverage(series15Valid, 24, 16);
  assert(!avg15.hasSufficientData, '15 valid hours out of 24 correctly fails CPCB 16h requirement');
  assert(avg15.average === null, 'Average is null when data completeness is <16 hours');

  // 24-hour window with exactly 16 valid hours (passes 16-hour requirement)
  const series16Valid: (number | null)[] = [
    ...Array(16).fill(30),
    ...Array(8).fill(null),
  ];
  const avg16 = computeRollingAverage(series16Valid, 24, 16);
  assert(avg16.hasSufficientData, '16 valid hours out of 24 correctly passes CPCB 16h requirement');
  assert(avg16.average === 30, 'Average of 16 valid hours computed correctly');

  // 8-hour window for CO/Ozone (requires >= 6 valid hours)
  const series5Valid8h: (number | null)[] = [
    ...Array(5).fill(40),
    ...Array(3).fill(null),
  ];
  const avg5_8h = computeRollingAverage(series5Valid8h, 8, 6);
  assert(!avg5_8h.hasSufficientData, '5 valid hours out of 8 fails CPCB 6h requirement for 8h rolling average');

  const series6Valid8h: (number | null)[] = [
    ...Array(6).fill(40),
    ...Array(2).fill(null),
  ];
  const avg6_8h = computeRollingAverage(series6Valid8h, 8, 6);
  assert(avg6_8h.hasSufficientData, '6 valid hours out of 8 passes CPCB 6h requirement for 8h rolling average');
  assert(avg6_8h.average === 40, 'Average of 6 valid hours computed correctly');

  console.log('\n--- SUITE 3: Minimum Three-Pollutant Rule & Particulate Requirement ---');

  // Case A: Missing Particulate Pollutant (Only NO2, SO2, CO available)
  const resultMissingParticulate = calculateScientificCPCBAQI({
    nitrogen_dioxide: { hourlyHistory: Array(24).fill(30) },
    sulphur_dioxide: { hourlyHistory: Array(24).fill(20) },
    carbon_monoxide: { hourlyHistory: Array(8).fill(500), isCoInMicrograms: true },
  });
  assert(!resultMissingParticulate.isValid, 'Missing particulate metric (PM2.5 or PM10) marks AQI as invalid');
  assert(resultMissingParticulate.statusMessage.includes('PM2.5 or PM10'), 'Status message specifies missing particulate metric');

  // Case B: Only 2 Pollutants (PM2.5 and NO2 available)
  const resultOnly2Pollutants = calculateScientificCPCBAQI({
    pm2_5: { hourlyHistory: Array(24).fill(25) },
    nitrogen_dioxide: { hourlyHistory: Array(24).fill(30) },
  });
  assert(!resultOnly2Pollutants.isValid, 'Fewer than 3 pollutants marks AQI as invalid');
  assert(resultOnly2Pollutants.statusMessage.includes('at least 3 criteria pollutants'), 'Status message specifies 3 pollutant rule');

  // Case C: Valid 3 Pollutants (PM2.5, NO2, O3)
  const resultValid3 = calculateScientificCPCBAQI({
    pm2_5: { hourlyHistory: Array(24).fill(25) },       // Sub-index: ~42 (Good)
    nitrogen_dioxide: { hourlyHistory: Array(24).fill(60) }, // Sub-index: ~75 (Satisfactory)
    ozone: { hourlyHistory: Array(8).fill(80) },           // Sub-index: ~80 (Satisfactory)
  });
  assert(resultValid3.isValid, '3 valid pollutants including PM2.5 produces valid AQI');
  assert(resultValid3.dominantPollutantKey === 'ozone', 'Dominant pollutant correctly identified as Ozone (highest sub-index ~80)');
  assert(resultValid3.category === 'Satisfactory', 'Category correctly resolved to Satisfactory');
  assert(resultValid3.displayTitle === 'Provisional CPCB-based AQI Estimate – CAMS Model Data', 'Display title exactly matches required label');

  console.log('\nAll scientific CPCB unit tests passed successfully!\n');
}

declare const process: { argv?: string[] } | undefined;

// Self-run when executed directly via Node
if (typeof process !== 'undefined' && process?.argv && process.argv[1]?.includes('cpcbAqiCalculator.test')) {
  runCPCBScienceTests();
}
