export function getActiveAppointmentsForLocation(
  locationObjectId: number,
  now?: Date,
): unknown[];

export function getAppointmentById(id: string): unknown | null;

export function addAppointment(payload: unknown): unknown;

export function formatAppointmentRange(appointment: unknown, locale?: string): string;

export function formatDateTimeHr(isoString: string, locale?: string): string;

export function combineDateHourMinuteToIso(
  dateStr: string,
  hourRaw: string,
  minuteRaw: string,
): string;

export function getOrCreateUserProfile(): {
  userId: string;
  displayName: string;
};

export function saveUserDisplayName(displayName: string): void;

export function participantCount(appointment: unknown): number;

export function userHasJoined(appointment: unknown, userId: string): boolean;

export function joinAppointment(
  appointmentId: string,
  userId: string,
  displayName: string,
): unknown;

export function leaveAppointment(
  appointmentId: string,
  userId: string,
): { ok: true } | { ok: false; error: string };

export function getChatMessages(appointmentId: string): {
  id: string;
  author: string;
  text: string;
  at: string;
}[];

export function getUpcomingAppointmentsSoon(
  now?: Date,
  limit?: number,
  maxHoursAhead?: number,
): unknown[];

export function addChatMessage(
  appointmentId: string,
  author: string,
  text: unknown,
): { id: string; author: string; text: string; at: string } | null;

export function ensureDemoAppointments(
  locations: unknown[],
  getSuggestedSportsForCourtType: (objectType: string) => string[],
): void;
