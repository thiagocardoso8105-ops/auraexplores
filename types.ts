
export type FileCategory = 'images' | 'videos' | 'documents' | 'music' | 'archives' | 'apps';
export type Language = 'en' | 'pt';
export type Theme = 'light' | 'dark';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  category?: FileCategory;
  extension?: string;
  size: number; // in bytes
  modifiedAt: string;
  parentId: string | null;
  content?: string; // For text files simulation
  color?: string; // For folders
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
