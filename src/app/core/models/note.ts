export interface Notes {
  notes: Note[];
  totalPages: number;
  currentPage: number;
}

export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string;
  createdAt: string;
  __v: number;
}
