export interface Notes {
  notes: Note[];
  totalPages: number;
  currentPage: number;
}

export interface Note {
  _id: string;
  user: string;
  title: string;
  tags?: string[];
  folder?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  isPublic?: boolean;
  reminderDate?: string;
  versions?: { title: string, content: string, summary?: string, updatedAt: string }[];
  createdAt: string;
  __v: number;
}
