/**
 * Country Metadata & Flag assets for CricDraft 11
 */

export interface CountryInfo {
  name: string;
  flag: string;
  shortCode: string;
  primaryColor: string;
}

export const COUNTRIES_DATA: Record<string, CountryInfo> = {
  India: {
    name: 'India',
    flag: '🇮🇳',
    shortCode: 'IND',
    primaryColor: '#1d4ed8',
  },
  Australia: {
    name: 'Australia',
    flag: '🇦🇺',
    shortCode: 'AUS',
    primaryColor: '#f59e0b',
  },
  England: {
    name: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    shortCode: 'ENG',
    primaryColor: '#dc2626',
  },
  'South Africa': {
    name: 'South Africa',
    flag: '🇿🇦',
    shortCode: 'RSA',
    primaryColor: '#059669',
  },
  'New Zealand': {
    name: 'New Zealand',
    flag: '🇳🇿',
    shortCode: 'NZ',
    primaryColor: '#18181b',
  },
  Pakistan: {
    name: 'Pakistan',
    flag: '🇵🇰',
    shortCode: 'PAK',
    primaryColor: '#047857',
  },
  'Sri Lanka': {
    name: 'Sri Lanka',
    flag: '🇱🇰',
    shortCode: 'SL',
    primaryColor: '#2563eb',
  },
  'West Indies': {
    name: 'West Indies',
    flag: '🌴',
    shortCode: 'WI',
    primaryColor: '#991b1b',
  },
  Bangladesh: {
    name: 'Bangladesh',
    flag: '🇧🇩',
    shortCode: 'BAN',
    primaryColor: '#065f46',
  },
  Netherlands: {
    name: 'Netherlands',
    flag: '🇳🇱',
    shortCode: 'NED',
    primaryColor: '#ea580c',
  },
};

export function getCountryInfo(name: string): CountryInfo {
  return COUNTRIES_DATA[name] || {
    name,
    flag: '🏏',
    shortCode: name.slice(0, 3).toUpperCase(),
    primaryColor: '#334155',
  };
}
