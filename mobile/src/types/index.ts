export type UserRole = 'professor' | 'aluno';

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface UserItem {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsers {
  data: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostItem {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    role?: UserRole;
  };
}
