
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FileItem, FileCategory, Language } from '../types';
import { COLORS } from '../constants';
import { translations } from '../translations';

interface StorageStatsProps {
  files: FileItem[];
  lang: Language;
}

const StorageStats: React.FC<StorageStatsProps> = ({ files, lang }) => {
  const t = translations[lang];

  const stats = useMemo(() => {
    const categories: Record<FileCategory | 'other', number> = {
      images: 0, videos: 0, documents: 0, music: 0, archives: 0, apps: 0, other: 0,
    };

    files.forEach(f => {
      if (f.type === 'file') {
        const cat = f.category || 'other';
        categories[cat] += f.size;
      }
    });

    const totalUsed = Object.values(categories).reduce((acc, curr) => acc + curr, 0);
    const chartData = Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: t.cats[name as keyof typeof t.cats] || name,
        value,
        color: COLORS[name as FileCategory | 'other'] || COLORS.other
      }));

    return { totalUsed, chartData };
  }, [files, lang]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const TOTAL_CAPACITY = 10 * 1024 * 1024 * 1024;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col transition-colors">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{t.storageOverview}</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => formatSize(value)} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatSize(stats.totalUsed)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.usedOf} {formatSize(TOTAL_CAPACITY)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((stats.totalUsed / TOTAL_CAPACITY) * 100, 100)}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {stats.chartData.map(item => (
            <div key={item.name} className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorageStats;
