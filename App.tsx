
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Grid2X2, 
  List, 
  ChevronRight, 
  Folder as FolderIcon, 
  File as FileIcon,
  Trash2,
  Sun,
  Moon,
  Globe,
  LayoutGrid,
  Sparkles,
  HardDrive,
  FolderOpen,
  Download,
  Smartphone,
  X,
  FileText,
  Play
} from 'lucide-react';
import { FileItem, FileCategory, Language, Theme } from './types';
import { INITIAL_FILES } from './mockData';
import { CATEGORY_ICONS } from './constants';
import { translations } from './translations';
import StorageStats from './components/StorageStats';
import AIChat from './components/AIChat';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState<Language>('pt');
  const [theme, setTheme] = useState<Theme>('light');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'files' | 'storage' | 'categories'>('files');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // File Viewer State
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Connect to Real File System
  const connectToDevice = async () => {
    try {
      // @ts-ignore - showDirectoryPicker is experimental but works in PWAs on Chrome/Android
      const dirHandle = await window.showDirectoryPicker();
      const loadedFiles: FileItem[] = [];

      async function readDirectory(handle: any, parentId: string | null = null) {
        for await (const entry of handle.values()) {
          const id = Math.random().toString(36).substr(2, 9);
          if (entry.kind === 'directory') {
            loadedFiles.push({
              id,
              name: entry.name,
              type: 'folder',
              size: 0,
              modifiedAt: new Date().toISOString(),
              parentId,
              handle: entry,
              color: 'bg-blue-100'
            });
            // Optional: Limit recursion depth for performance
          } else {
            const file = await entry.getFile();
            const ext = entry.name.split('.').pop()?.toLowerCase();
            let category: FileCategory = 'documents';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext!)) category = 'images';
            else if (['mp4', 'webm', 'mov'].includes(ext!)) category = 'videos';
            else if (['mp3', 'wav', 'ogg'].includes(ext!)) category = 'music';
            else if (['zip', 'rar', '7z'].includes(ext!)) category = 'archives';

            loadedFiles.push({
              id,
              name: entry.name,
              type: 'file',
              category,
              extension: ext,
              size: file.size,
              modifiedAt: new Date(file.lastModified).toISOString(),
              parentId,
              handle: entry,
              realFile: file
            });
          }
        }
      }

      await readDirectory(dirHandle);
      setFiles(loadedFiles);
      setCurrentFolderId(null);
    } catch (err) {
      console.error("Access denied or cancelled", err);
    }
  };

  const handleFileClick = async (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentFolderId(file.id);
      return;
    }

    // Process file for viewing
    let actualFile = file.realFile;
    if (!actualFile && file.handle) {
      // @ts-ignore
      actualFile = await file.handle.getFile();
    }

    if (actualFile) {
      setSelectedFile(file);
      const url = URL.createObjectURL(actualFile);
      setFileBlobUrl(url);

      // If text file, read content
      if (file.category === 'documents' || ['txt', 'md', 'json', 'js', 'html', 'css', 'log'].includes(file.extension!)) {
        const text = await actualFile.text();
        setTextContent(text.slice(0, 5000)); // Limit for performance
      } else {
        setTextContent(null);
      }
    }
  };

  const closeFileViewer = () => {
    if (fileBlobUrl) URL.revokeObjectURL(fileBlobUrl);
    setSelectedFile(null);
    setFileBlobUrl(null);
    setTextContent(null);
  };

  const filteredFiles = useMemo(() => {
    let result = files;
    if (searchQuery) return result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeCategory !== 'all') return result.filter(f => f.category === activeCategory);
    return result.filter(f => f.parentId === currentFolderId);
  }, [files, currentFolderId, searchQuery, activeCategory]);

  const breadcrumbs = useMemo(() => {
    const path = [];
    let currId = currentFolderId;
    while (currId) {
      const folder = files.find(f => f.id === currId);
      if (folder) {
        path.unshift(folder);
        currId = folder.parentId;
      } else break;
    }
    return path;
  }, [files, currentFolderId]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '--';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">A</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">{t.appName}</h1>
          </div>
          <nav className="space-y-1">
            <button onClick={() => { setCurrentFolderId(null); setActiveCategory('all'); }} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              <LayoutGrid className="w-5 h-5" />
              <span>{t.dashboard}</span>
            </button>
            <div className="pt-4 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-3">{t.categories}</div>
            {(Object.keys(CATEGORY_ICONS) as (FileCategory | 'all')[]).filter(k => k !== 'all').map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${activeCategory === cat ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                {CATEGORY_ICONS[cat]}
                <span className="capitalize">{t.cats[cat as keyof typeof t.cats]}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 lg:pb-0">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 px-4 lg:px-6 py-3 lg:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-3 flex-1 max-w-2xl">
            <div className="lg:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">A</div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={t.searchPlaceholder} className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-3">
            <button onClick={() => setLang(l => l === 'pt' ? 'en' : 'pt')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><Globe className="w-4 h-4" /></button>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">{theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Welcome & Connect Action */}
          {(mobileTab === 'files' || window.innerWidth >= 1024) && activeCategory === 'all' && !searchQuery && !currentFolderId && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl mb-6">
                <div className="relative z-10">
                  <h2 className="text-xl lg:text-2xl font-bold mb-2">{t.welcome}</h2>
                  <p className="text-blue-100 text-sm mb-6 max-w-md">{t.welcomeSub}</p>
                  <button onClick={connectToDevice} className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <span>{t.connectDevice}</span>
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                  <FolderIcon className="w-40 h-40" />
                </div>
              </div>
            </div>
          )}

          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto no-scrollbar py-1">
            <button onClick={() => { setCurrentFolderId(null); setActiveCategory('all'); }} className="text-slate-500 hover:text-blue-600 whitespace-nowrap">{t.root}</button>
            {breadcrumbs.map(b => (
              <React.Fragment key={b.id}>
                <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                <button onClick={() => setCurrentFolderId(b.id)} className="text-slate-500 hover:text-blue-600 whitespace-nowrap truncate max-w-[120px]">{b.name}</button>
              </React.Fragment>
            ))}
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
            {filteredFiles.map(file => (
              <div key={file.id} className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer active:scale-95" onClick={() => handleFileClick(file)}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 ${file.type === 'folder' ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-slate-50 dark:bg-slate-900/30'}`}>
                    {file.type === 'folder' ? <FolderIcon className="w-8 h-8 text-blue-500" /> : CATEGORY_ICONS[file.category || 'all']}
                  </div>
                  <span className="text-xs lg:text-sm font-medium truncate w-full px-1">{file.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{file.type === 'folder' ? 'Pasta' : formatSize(file.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-2 flex items-center justify-between z-50">
          <button onClick={() => setMobileTab('files')} className={`flex flex-col items-center space-y-1 ${mobileTab === 'files' ? 'text-blue-600' : 'text-slate-400'}`}><FolderOpen className="w-6 h-6" /><span className="text-[10px]">Arquivos</span></button>
          <div className="relative -top-6">
            <button onClick={() => setIsAiOpen(true)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-900"><Sparkles className="w-6 h-6" /></button>
          </div>
          <button onClick={() => setMobileTab('storage')} className={`flex flex-col items-center space-y-1 ${mobileTab === 'storage' ? 'text-blue-600' : 'text-slate-400'}`}><HardDrive className="w-6 h-6" /><span className="text-[10px]">Espaço</span></button>
        </nav>

        {/* File Viewer Modal */}
        {selectedFile && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200">
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center space-x-3">
                <FileIcon className="w-5 h-5 text-blue-400" />
                <span className="font-medium truncate max-w-[250px]">{selectedFile.name}</span>
              </div>
              <button onClick={closeFileViewer} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="w-full h-full max-w-4xl p-4 flex items-center justify-center overflow-auto">
              {selectedFile.category === 'images' && fileBlobUrl && (
                <img src={fileBlobUrl} alt={selectedFile.name} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
              )}
              {selectedFile.category === 'videos' && fileBlobUrl && (
                <video src={fileBlobUrl} controls autoPlay className="max-h-full max-w-full rounded-lg shadow-2xl" />
              )}
              {textContent && (
                <div className="bg-white dark:bg-slate-900 w-full p-6 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto text-sm font-mono text-slate-800 dark:text-slate-200">
                  <pre className="whitespace-pre-wrap">{textContent}</pre>
                </div>
              )}
              {!fileBlobUrl && !textContent && (
                <div className="flex flex-col items-center text-white space-y-4">
                  <div className="p-8 bg-white/10 rounded-full"><FileText className="w-16 h-16" /></div>
                  <p className="text-lg">{t.noFiles}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isAiOpen && (
          <div className="fixed inset-0 lg:inset-auto lg:bottom-6 lg:right-6 w-full h-full lg:w-96 lg:h-[550px] z-[60]">
            <AIChat files={files} lang={lang} onClose={() => setIsAiOpen(false)} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
