export type Sport =
  | 'futsal'
  | 'košarka'
  | 'tenis'
  | 'trčanje'
  | 'odbojka'
  | 'badminton';

export type SkillLevel = 'svi' | 'početnici' | 'srednja' | 'napredni';

export type TimeFilter = 'danas' | 'sutra' | 'ovaj tjedan';

/** Advanced home filters — when to show events */
export type WhenFilter = 'sve' | TimeFilter;

/** Max distance from user (km); null = bilo gdje */
export type DistancePreset = null | 3 | 5 | 10;

/** Rough group size by total spots */
export type CapacityFilter = 'bilo_koji' | 'mali' | 'srednji' | 'veliki';

export interface Organizer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  textColor: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  /** npr. bg-blue-100 */
  authorAvatarColor: string;
  /** npr. text-blue-800 */
  authorTextColor: string;
  text: string;
  timestamp: string;
  isSystem: boolean;
}

export interface Event {
  id: string;
  title: string;
  sport: Sport;
  location: string;
  distanceKm: number;
  date: string;
  startTime: string;
  spotsTotal: number;
  spotsTaken: number;
  skillLevel: SkillLevel;
  pricePerPerson: number;
  organizer: Organizer;
  participants: Organizer[];
  isUrgent: boolean;
  description: string;
  messages: ChatMessage[];
}
