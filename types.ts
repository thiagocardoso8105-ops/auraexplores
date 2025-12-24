
export type FileCategory = 'images' | 'videos' | 'documents' | 'music' | 'archives' | 'apps';
export type Language = 'en' | 'pt';
export type Theme = 'light' | 'dark';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  category?: FileCategory;
  extension?: string;
  size: number;
  modifiedAt: string;
  parentId: string | null;
  content?: string;
  color?: string;
  handle?: FileSystemHandle; // Reference to the real system file/folder
  realFile?: File; // For direct access
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
