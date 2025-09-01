export interface Event {
  id: number | string;
  title: string;
  date: string;
  time: string;
  location?: string; // human-readable (address, venue)
  category?: string;
  color?: string;
  ownerId?: string; // uid of owner
  description?: string;
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
}
