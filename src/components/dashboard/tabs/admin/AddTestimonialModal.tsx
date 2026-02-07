import React, { useState } from 'react';
import { api } from '@/services/api';
import { Select } from '@/components/ui';

interface AddTestimonialModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddTestimonialModal: React.FC<AddTestimonialModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    author: '',
    role: '',
    text: '',
    imageUrl: '',
    page: 'home' as 'home' | 'partners'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setError('Please upload an author photo');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await api.createTestimonial(formData);
      onSuccess();
      onClose();
      alert('Testimonial added successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add testimonial';
      console.error(err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageOptions = [
    { label: 'Home Page', value: 'home' },
    { label: 'Partners Page', value: 'partners' }
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl flex flex-col zoom-in-95">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-900">Add Testimonial</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author Name</label>
            <input 
              required 
              value={formData.author}
              onChange={e => setFormData({...formData, author: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" 
              placeholder="Sarah Johnson"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author Role</label>
            <input 
              required 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" 
              placeholder="HR Director, TechCorp"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Testimonial Text</label>
            <textarea 
              required 
              rows={4}
              value={formData.text}
              onChange={e => setFormData({...formData, text: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" 
              placeholder="What did they say about EvoWell?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author Photo</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" alt="Preview" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!imagePreview}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Page</label>
            <Select 
              options={pageOptions}
              value={formData.page}
              onChange={val => setFormData({...formData, page: val as 'home' | 'partners'})}
              className="w-full"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestimonialModal;
