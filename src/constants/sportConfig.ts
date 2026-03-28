import type { Sport } from '../types';

export const sportColors: Record<
  Sport,
  { badge: string; pin: string }
> = {
  futsal: { badge: 'bg-blue-50 text-blue-800', pin: '#1e6fb5' },
  košarka: { badge: 'bg-amber-50 text-amber-800', pin: '#b07010' },
  tenis: { badge: 'bg-green-50 text-green-800', pin: '#2f6b10' },
  trčanje: { badge: 'bg-purple-50 text-purple-900', pin: '#4a3aaa' },
  odbojka: { badge: 'bg-rose-50 text-rose-800', pin: '#c0392b' },
  badminton: { badge: 'bg-teal-50 text-teal-800', pin: '#0f766e' },
};

/** Light hero background za stranicu detalja */
export const sportHeroBg: Record<Sport, string> = {
  futsal: 'bg-gradient-to-b from-blue-100 via-blue-50 to-white',
  košarka: 'bg-gradient-to-b from-amber-100 via-amber-50 to-white',
  tenis: 'bg-gradient-to-b from-green-100 via-green-50 to-white',
  trčanje: 'bg-gradient-to-b from-purple-100 via-violet-50 to-white',
  odbojka: 'bg-gradient-to-b from-rose-100 via-rose-50 to-white',
  badminton: 'bg-gradient-to-b from-teal-100 via-teal-50 to-white',
};

export const sportLabels: Record<Sport, string> = {
  futsal: 'Futsal',
  košarka: 'Košarka',
  tenis: 'Tenis',
  trčanje: 'Trčanje',
  odbojka: 'Odbojka',
  badminton: 'Badminton',
};

export const sportIcons: Record<Sport, string> = {
  futsal: '⚽',
  košarka: '🏀',
  tenis: '🎾',
  trčanje: '🏃',
  odbojka: '🏐',
  badminton: '🏸',
};

export const allSports: Sport[] = [
  'futsal',
  'košarka',
  'tenis',
  'trčanje',
  'odbojka',
  'badminton',
];
