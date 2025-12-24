
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Menu, 
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
  Download
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

  const t = translations[lang];

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const filteredFiles = useMemo(() => {
    let result = files;
    if (searchQuery) {
      return result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeCategory !== 'all') {
      return result.filter(f => f.category === activeCategory);
    }
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
      } else { break; }
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

  const deleteFile = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const toggleLang = () => setLang(prev => prev === 'pt' ? 'en' : 'pt');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const resetView = () => {
    setCurrentFolderId(null);
    setActiveCategory('all');
    setSearchQuery('');
    setMobileTab('files');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar - Desktop Only */}
      <aside className={`hidden lg:flex bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">A</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">{t.appName}</h1>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={resetView}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${activeCategory === 'all' && !currentFolderId && !searchQuery ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>{t.dashboard}</span>
            </button>
            <div className="pt-4 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3">{t.categories}</div>
            {(Object.keys(CATEGORY_ICONS) as (FileCategory | 'all')[]).filter(k => k !== 'all').map(cat => (
              <button 
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${activeCategory === cat ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {CATEGORY_ICONS[cat]}
                <span className="capitalize">{t.cats[cat as keyof typeof t.cats]}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-50 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{t.cloudStorage}</p>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div className="bg-blue-600 h-full w-[65%]" />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">6.5 GB {t.usedOf} 10 GB</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 lg:pb-0">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 px-4 lg:px-6 py-3 lg:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-3 flex-1 max-w-2xl">
            <div className="lg:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">A</div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-sm dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3 ml-3">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 lg:px-4 lg:py-2 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-all"
                title="Instalar Aplicativo"
              >
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline text-xs">Instalar App</span>
              </button>
            )}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button onClick={toggleLang} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all">
                <Globe className="w-4 h-4" />
              </button>
              <button onClick={toggleTheme} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
            <button className="flex items-center space-x-2 bg-blue-600 text-white p-2 lg:px-4 lg:py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              <Plus className="w-5 h-5 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">{t.upload}</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
          {/* Dashboard Summary - Only in Files tab or Desktop */}
          {(mobileTab === 'files' || window.innerWidth >= 1024) && activeCategory === 'all' && !searchQuery && !currentFolderId && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
              <div className="lg:col-span-2">
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20 mb-6 border border-white/10">
                    <div className="relative z-10">
                      <h2 className="text-xl lg:text-2xl font-bold mb-2">{t.welcome}</h2>
                      <p className="text-blue-100 text-sm lg:text-base mb-6 max-w-md opacity-90">{t.welcomeSub}</p>
                      <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors">
                        {t.viewTips}
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                      <FolderIcon className="w-40 h-40 lg:w-56 lg:h-56" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-3 lg:gap-4">
                    {['images', 'videos', 'documents', 'music'].map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => { setActiveCategory(cat as FileCategory); setMobileTab('files'); }}
                        className="bg-white dark:bg-slate-800 p-3 lg:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col items-center text-center group"
                      >
                        <div className="mb-2 transform group-hover:scale-110 transition-transform">
                          {CATEGORY_ICONS[cat as FileCategory]}
                        </div>
                        <span className="text-[10px] lg:text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize truncate w-full">{t.cats[cat as keyof typeof t.cats]}</span>
                      </button>
                    ))}
                 </div>
              </div>
              <div className="hidden lg:block">
                <StorageStats files={files} lang={lang} />
              </div>
            </div>
          )}

          {/* Mobile Specific Tabs Content */}
          <div className="lg:hidden">
            {mobileTab === 'storage' && (
              <div className="animate-in fade-in duration-300 h-[400px]">
                <StorageStats files={files} lang={lang} />
              </div>
            )}
            {mobileTab === 'categories' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
                {(Object.keys(CATEGORY_ICONS) as (FileCategory | 'all')[]).filter(k => k !== 'all').map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setMobileTab('files'); }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center shadow-sm"
                  >
                    <div className="mb-4 scale-125">{CATEGORY_ICONS[cat]}</div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 capitalize">{t.cats[cat as keyof typeof t.cats]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Files Browser - Shown if on Files tab or Categories filter is active */}
          {(mobileTab === 'files' || window.innerWidth >= 1024) && (
            <div className="mt-2 lg:mt-0">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center space-x-2 text-xs lg:text-sm overflow-x-auto no-scrollbar whitespace-nowrap py-1">
                  <button onClick={resetView} className="text-slate-500 dark:text-slate-400 hover:text-blue-600">{t.root}</button>
                  {breadcrumbs.map((b) => (
                    <React.Fragment key={b.id}>
                      <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-slate-300" />
                      <button onClick={() => setCurrentFolderId(b.id)} className="text-slate-500 dark:text-slate-400 hover:text-blue-600">{b.name}</button>
                    </React.Fragment>
                  ))}
                  {searchQuery && (
                    <><ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-slate-300" /><span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-[100px]">"{searchQuery}"</span></>
                  )}
                </div>

                <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                  <button onClick={() => setViewMode('grid')} className={`p-1 lg:p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1 lg:p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-3xl mb-4 text-slate-400"><Search className="w-8 h-8" /></div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t.noFiles}</h3>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                  {filteredFiles.map(file => (
                    <div 
                      key={file.id} 
                      className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 hover:shadow-xl transition-all cursor-pointer active:scale-95 touch-manipulation"
                      onClick={() => file.type === 'folder' ? setCurrentFolderId(file.id) : null}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${file.type === 'folder' ? (file.color || 'bg-blue-50 dark:bg-blue-900/10') : 'bg-slate-50 dark:bg-slate-900/30'}`}>
                          {file.type === 'folder' ? <FolderIcon className={`w-7 h-7 lg:w-8 lg:h-8 ${file.color ? 'text-slate-600' : 'text-blue-500'}`} /> : CATEGORY_ICONS[file.category || 'all']}
                        </div>
                        <span className="text-xs lg:text-sm font-medium text-slate-800 dark:text-slate-200 truncate w-full px-1">{file.name}</span>
                        <span className="text-[10px] text-slate-400 mt-1">{file.type === 'folder' ? 'Pasta' : formatSize(file.size)}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} className="absolute top-2 right-2 p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 lg:opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 text-[10px] lg:text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">{t.name}</th>
                        <th className="hidden sm:table-cell px-4 py-3">{t.size}</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                      {filteredFiles.map(file => (
                        <tr key={file.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer active:bg-slate-100" onClick={() => file.type === 'folder' ? setCurrentFolderId(file.id) : null}>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              {file.type === 'folder' ? <FolderIcon className="w-5 h-5 text-blue-500" /> : <FileIcon className="w-5 h-5 text-slate-400" />}
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px] sm:max-w-none">{file.name}</span>
                                <span className="sm:hidden text-[10px] text-slate-400">{formatSize(file.size)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 text-slate-500">{formatSize(file.size)}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} className="p-1.5 text-slate-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-2 flex items-center justify-between z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setMobileTab('files')}
            className={`flex flex-col items-center space-y-1 ${mobileTab === 'files' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
          >
            <FolderOpen className="w-6 h-6" />
            <span className="text-[10px] font-medium">{t.dashboard}</span>
          </button>
          <button 
            onClick={() => setMobileTab('categories')}
            className={`flex flex-col items-center space-y-1 ${mobileTab === 'categories' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-medium">{t.categories}</span>
          </button>
          <div className="relative -top-6">
            <button 
              onClick={() => setIsAiOpen(true)}
              className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-900 active:scale-90 transition-transform"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
          <button 
            onClick={() => setMobileTab('storage')}
            className={`flex flex-col items-center space-y-1 ${mobileTab === 'storage' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
          >
            <HardDrive className="w-6 h-6" />
            <span className="text-[10px] font-medium">Espaço</span>
          </button>
          <button 
            onClick={toggleTheme}
            className="flex flex-col items-center space-y-1 text-slate-400"
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            <span className="text-[10px] font-medium">Tema</span>
          </button>
        </nav>

        {/* Floating AI Trigger Button - Desktop Only */}
        {!isAiOpen && (
          <button 
            onClick={() => setIsAiOpen(true)}
            className="hidden lg:flex fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl items-center justify-center hover:scale-110 active:scale-95 transition-all z-30 group"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
          </button>
        )}

        {/* AI Assistant Panel */}
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
