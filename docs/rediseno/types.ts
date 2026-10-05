export type WeekDay = {
  iso: string;          // "2026-10-04"
  weekday: string;      // "dom"
  day: number;          // 4
  appointments: number;
  isToday: boolean;
};

export type RecentVisit = {
  id: string;
  clientName: string;
  visitCount: number;   // 1..10
  date: string;         // ISO
};

export type HomeStats = {
  clients: number;
  weekVisits: number;
  expiring: number;
};
