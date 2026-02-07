import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const ConfigColumn = ({ title, items, newItem, setNewItem, onAdd, onDelete, placeholder }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
     <h3 className="text-xl font-black text-slate-900 mb-6">{title}</h3>
     <div className="flex gap-2 mb-6">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          className="flex-grow bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 outline-none"
          placeholder={placeholder}
        />
        <button onClick={onAdd} className="bg-brand-500 text-white px-4 rounded-xl font-bold">+</button>
     </div>
     <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {items.map((item: any) => (
           <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl group hover:bg-slate-100">
              <span className="text-xs font-bold text-slate-700">{item.name}</span>
              <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">×</button>
           </div>
        ))}
     </div>
  </div>
);

const AdminConfigTab: React.FC = () => {
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newGender, setNewGender] = useState('');

  const { data: specialties = [], refetch: refetchSpecialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => api.getAllSpecialties()
  });

  const { data: insurance = [], refetch: refetchInsurance } = useQuery({
    queryKey: ['insurance'],
    queryFn: () => api.getAllInsurance()
  });

  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getAllBlogCategories()
  });

  const { data: languages = [], refetch: refetchLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: () => api.getAllLanguages()
  });

  const { data: genders = [], refetch: refetchGenders } = useQuery({
    queryKey: ['genders'],
    queryFn: () => api.getAllGenders()
  });

  const handleAdd = async (type: 'specialty' | 'insurance' | 'category' | 'language' | 'gender') => {
    if (type === 'specialty' && newSpecialty) {
      await api.createSpecialty(newSpecialty);
      setNewSpecialty('');
      refetchSpecialties();
    } else if (type === 'insurance' && newInsurance) {
      await api.createInsurance(newInsurance);
      setNewInsurance('');
      refetchInsurance();
    } else if (type === 'category' && newCategory) {
      await api.createBlogCategory(newCategory);
      setNewCategory('');
      refetchCategories();
    } else if (type === 'language' && newLanguage) {
      await api.createLanguage(newLanguage);
      setNewLanguage('');
      refetchLanguages();
    } else if (type === 'gender' && newGender) {
      await api.createGender(newGender);
      setNewGender('');
      refetchGenders();
    }
  };

  const handleDelete = async (type: 'specialty' | 'insurance' | 'category' | 'language' | 'gender', id: string) => {
    if (type === 'specialty') { await api.deleteSpecialty(id); refetchSpecialties(); }
    else if (type === 'insurance') { await api.deleteInsurance(id); refetchInsurance(); }
    else if (type === 'category') { await api.deleteBlogCategory(id); refetchCategories(); }
    else if (type === 'language') { await api.deleteLanguage(id); refetchLanguages(); }
    else if (type === 'gender') { await api.deleteGender(id); refetchGenders(); }
  };

  return (
     <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
        <ConfigColumn
          title="Specialties"
          items={specialties}
          newItem={newSpecialty}
          setNewItem={setNewSpecialty}
          onAdd={() => handleAdd('specialty')}
          onDelete={(id: string) => handleDelete('specialty', id)}
          placeholder="Add new..."
        />
        <ConfigColumn
          title="Insurance"
          items={insurance}
          newItem={newInsurance}
          setNewItem={setNewInsurance}
          onAdd={() => handleAdd('insurance')}
          onDelete={(id: string) => handleDelete('insurance', id)}
          placeholder="Add provider..."
        />
        <ConfigColumn
          title="Blog Categories"
          items={categories}
          newItem={newCategory}
          setNewItem={setNewCategory}
          onAdd={() => handleAdd('category')}
          onDelete={(id: string) => handleDelete('category', id)}
          placeholder="Add category..."
        />
        <ConfigColumn
          title="Languages"
          items={languages.map((l: string) => ({ id: l, name: l }))}
          newItem={newLanguage}
          setNewItem={setNewLanguage}
          onAdd={() => handleAdd('language')}
          onDelete={(id: string) => handleDelete('language', id)}
          placeholder="Add language..."
        />
        <ConfigColumn
          title="Genders"
          items={genders.map((g: string) => ({ id: g, name: g }))}
          newItem={newGender}
          setNewItem={setNewGender}
          onAdd={() => handleAdd('gender')}
          onDelete={(id: string) => handleDelete('gender', id)}
          placeholder="Add gender..."
        />
     </div>
  );
};

export default AdminConfigTab;
