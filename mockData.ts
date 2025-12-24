
import { FileItem } from './types';

export const INITIAL_FILES: FileItem[] = [
  { id: '1', name: 'Work Documents', type: 'folder', size: 0, modifiedAt: '2023-10-24T10:00:00Z', parentId: null, color: 'bg-blue-100' },
  { id: '2', name: 'Summer Vacation', type: 'folder', size: 0, modifiedAt: '2023-08-15T14:30:00Z', parentId: null, color: 'bg-emerald-100' },
  { id: '3', name: 'project_brief.pdf', type: 'file', category: 'documents', extension: 'pdf', size: 2400000, modifiedAt: '2023-11-01T09:15:00Z', parentId: '1' },
  { id: '4', name: 'invoice_october.docx', type: 'file', category: 'documents', extension: 'docx', size: 450000, modifiedAt: '2023-10-31T16:45:00Z', parentId: '1' },
  { id: '5', name: 'sunset_beach.jpg', type: 'file', category: 'images', extension: 'jpg', size: 5600000, modifiedAt: '2023-08-20T19:00:00Z', parentId: '2' },
  { id: '6', name: 'family_photo.png', type: 'file', category: 'images', extension: 'png', size: 8200000, modifiedAt: '2023-08-21T11:20:00Z', parentId: '2' },
  { id: '7', name: 'vlog_day1.mp4', type: 'file', category: 'videos', extension: 'mp4', size: 145000000, modifiedAt: '2023-08-22T22:10:00Z', parentId: '2' },
  { id: '8', name: 'favorite_song.mp3', type: 'file', category: 'music', extension: 'mp3', size: 4800000, modifiedAt: '2023-11-02T08:00:00Z', parentId: null },
  { id: '9', name: 'System Logs', type: 'folder', size: 0, modifiedAt: '2023-11-03T12:00:00Z', parentId: null, color: 'bg-slate-100' },
  { id: '10', name: 'backup_2023.zip', type: 'file', category: 'archives', extension: 'zip', size: 890000000, modifiedAt: '2023-01-01T00:00:00Z', parentId: '9' },
  { id: '11', name: 'Notes', type: 'folder', size: 0, modifiedAt: '2023-11-04T10:00:00Z', parentId: null, color: 'bg-amber-100' },
  { id: '12', name: 'idea_dump.txt', type: 'file', category: 'documents', extension: 'txt', size: 1200, modifiedAt: '2023-11-04T10:05:00Z', parentId: '11', content: 'Explore the possibilities of AI integration in file explorers. Focus on vector embeddings for semantic search and auto-tagging.' },
];
