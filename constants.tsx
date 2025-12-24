
import React from 'react';
import { 
  Image, 
  Video, 
  FileText, 
  Music, 
  Archive, 
  Grid, 
  Folder, 
  File,
  Smartphone
} from 'lucide-react';
import { FileCategory } from './types';

export const CATEGORY_ICONS: Record<FileCategory | 'all', React.ReactNode> = {
  all: <Grid className="w-5 h-5" />,
  images: <Image className="w-5 h-5 text-blue-500" />,
  videos: <Video className="w-5 h-5 text-red-500" />,
  documents: <FileText className="w-5 h-5 text-emerald-500" />,
  music: <Music className="w-5 h-5 text-purple-500" />,
  archives: <Archive className="w-5 h-5 text-amber-500" />,
  apps: <Smartphone className="w-5 h-5 text-indigo-500" />,
};

export const COLORS = {
  images: '#3b82f6',
  videos: '#ef4444',
  documents: '#10b981',
  music: '#8b5cf6',
  archives: '#f59e0b',
  apps: '#6366f1',
  other: '#94a3b8'
};
