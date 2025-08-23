
export interface Item {
  id: number;
  name?: string; // Backend field for item name/title
  title?: string; // Frontend compatibility
  description: string;
  category: string;
  status?: 'LOST' | 'FOUND';
  location: string;
  dateReported?: string;
  contactInfo?: string;
  userId?: number;
  userName?: string; // Frontend field
  postedByName?: string; // Backend field for user who posted
  postedById?: number; // Backend field for user ID
  imageUrl?: string;
  reward?: number; // Backend uses number, not string
  createAt?: string; // Backend creation timestamp
  updatedAt?: string; // Backend update timestamp
}

export interface CreateItemRequest {
  name: string; // Backend expects 'name' field
  title?: string; // Frontend compatibility
  description: string;
  category: string;
  status?: 'LOST' | 'FOUND';
  location: string;
  contactInfo?: string;
  userName?: string; // For frontend forms
  imageUrl?: string;
  reward?: string; // Form input as string, backend converts to number
}
