import type { AQICategory } from '../types/airQuality';

export interface AQIMeta {
  category: AQICategory;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  description: string;
  advisory: string;
}

export function getAQIMeta(aqi: number): AQIMeta {
  if (aqi <= 50) {
    return {
      category: 'Good',
      color: '#183D32', // Forest Green
      bgColor: 'bg-forest/10',
      borderColor: 'border-forest/30',
      textColor: 'text-forest',
      badgeBg: 'bg-forest/10 text-forest border-forest/30',
      description: 'Clean atmospheric baseline',
      advisory: 'Air quality is within pristine guidelines. Ambient particulate levels pose negligible health risk.',
    };
  } else if (aqi <= 100) {
    return {
      category: 'Satisfactory',
      color: '#5B8260', // Muted Sage
      bgColor: 'bg-sage-soft',
      borderColor: 'border-sage/40',
      textColor: 'text-[#446649]',
      badgeBg: 'bg-sage-soft text-[#36523A] border-sage/40',
      description: 'Minor respiratory sensitivity',
      advisory: 'Acceptable ambient conditions. Highly sensitive individuals may experience minor breathing discomfort.',
    };
  } else if (aqi <= 200) {
    return {
      category: 'Moderate',
      color: '#C2873E', // Muted Ochre
      bgColor: 'bg-[#F9F4EB]',
      borderColor: 'border-[#E2C79F]',
      textColor: 'text-[#8F5E1F]',
      badgeBg: 'bg-[#F9F4EB] text-[#8F5E1F] border-[#E2C79F]',
      description: 'Noticeable particulate elevation',
      advisory: 'Particulate load elevated due to vehicular corridors. Vulnerable populations should moderate extended outdoor exposure.',
    };
  } else if (aqi <= 300) {
    return {
      category: 'Poor',
      color: '#B24E38', // Terracotta Rust
      bgColor: 'bg-[#FAECE8]',
      borderColor: 'border-[#E6B1A5]',
      textColor: 'text-[#963723]',
      badgeBg: 'bg-[#FAECE8] text-[#963723] border-[#E6B1A5]',
      description: 'Persistent breathing discomfort',
      advisory: 'Significant atmospheric loading. Healthy adults may experience fatigue; cardiopulmonary patients should remain sheltered.',
    };
  } else if (aqi <= 400) {
    return {
      category: 'Very Poor',
      color: '#7A3E5D', // Deep Plum
      bgColor: 'bg-[#F6ECF2]',
      borderColor: 'border-[#D9AEC4]',
      textColor: 'text-[#642B49]',
      badgeBg: 'bg-[#F6ECF2] text-[#642B49] border-[#D9AEC4]',
      description: 'Acute respiratory impact',
      advisory: 'Severe pollution episode. High risk of physiological distress upon prolonged ambient exposure.',
    };
  } else {
    return {
      category: 'Severe',
      color: '#8A2222', // Deep Crimson
      bgColor: 'bg-[#FBEAEA]',
      borderColor: 'border-[#E8A5A5]',
      textColor: 'text-[#731515]',
      badgeBg: 'bg-[#FBEAEA] text-[#731515] border-[#E8A5A5]',
      description: 'Hazardous atmospheric condition',
      advisory: 'Emergency health caution. Serious cardiopulmonary risk across entire population. Avoid outdoor exposure.',
    };
  }
}

export function formatAQIValue(val: number): string {
  return Math.round(val).toString();
}
