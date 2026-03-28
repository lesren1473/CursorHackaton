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
