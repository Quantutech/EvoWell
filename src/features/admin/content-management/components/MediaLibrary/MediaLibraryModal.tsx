import React, { useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: string;
  type: string;
  tags: string[];
  uploadedAt: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [items, setItems] = useState<MediaItem[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', name: 'clinical-setting.jpg', size: '1.2MB', type: 'image/jpeg', tags: ['clinical', 'office'], uploadedAt: new Date().toISOString() },
    { id: '2', url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400', name: 'patient-care.jpg', size: '0.8MB', type: 'image/jpeg', tags: ['patient', 'nursing'], uploadedAt: new Date().toISOString() },
    { id: '3', url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400', name: 'hospital-facility.jpg', size: '2.1MB', type: 'image/jpeg', tags: ['hospital', 'facility'], uploadedAt: new Date().toISOString() },
    { id: '4', url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400', name: 'doctor-patient.jpg', size: '1.5MB', type: 'image/jpeg', tags: ['doctor', 'patient'], uploadedAt: new Date().toISOString() },
    { id: '5', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400', name: 'medical-team.jpg', size: '1.8MB', type: 'image/jpeg', tags: ['team', 'staff'], uploadedAt: new Date().toISOString() },
    { id: '6', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', name: 'consultation-room.jpg', size: '1.4MB', type: 'image/jpeg', tags: ['consultation', 'room'], uploadedAt: new Date().toISOString() },
  ]);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get all unique tags from items
  const allTags = Array.from(new Set(items.flatMap(item => item.tags)));

  // Filter items based on search and tag
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = activeTag === 'all' || item.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const handleUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        // Add new mock item
        const newItem: MediaItem = {
          id: (items.length + 1).toString(),
          url: `https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&random=${Date.now()}`,
          name: `uploaded-${Date.now()}.jpg`,
          size: '1.5MB',
          type: 'image/jpeg',
          tags: ['uploaded'],
          uploadedAt: new Date().toISOString(),
        };
        setItems(prev => [newItem, ...prev]);
      }
    }, 200);
  };

  const handleSelect = () => {
    if (selectedItem) {
      const item = items.find(i => i.id === selectedItem);
      if (item) {
        onSelect(item);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Media Library</h2>
            <p className="text-sm text-slate-500 mt-1">Select an image for your content</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpload}
              className="bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search media by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTag === 'all'
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    activeTag === tag
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mx-6 my-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Uploading...</span>
              <span className="text-xs font-black text-brand-600">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="text-4xl mb-4">🖼️</div>
              <p className="text-lg">No media found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`group relative bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    selectedItem === item.id
                      ? 'border-brand-500 ring-2 ring-brand-200'
                      : 'border-slate-100'
                  }`}
                  onClick={() => setSelectedItem(item.id)}
                >
                  <div className="aspect-square overflow-hidden bg-slate-50">
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-slate-900 truncate mb-1">{item.name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-black uppercase">{item.size}</span>
                      <div className="flex gap-1">
                        {item.tags.slice(0, 1).map(t => (
                          <span key={t} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[8px] font-bold">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Selection Indicator */}
                  {selectedItem === item.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      className="p-2 bg-white rounded-xl text-slate-900 hover:bg-brand-500 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item);
                        onClose();
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {filteredItems.length} items • {selectedItem ? '1 selected' : 'None selected'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedItem}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium ${
                selectedItem
                  ? 'bg-brand-500 text-white hover:bg-brand-600'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};