
import React from 'react';
import { Specialty, InsuranceCompany, BlogCategory } from '../../../../types';

interface AdminConfigTabProps {
  specialties: Specialty[];
  insurance: InsuranceCompany[];
  categories: BlogCategory[];
  newSpecialty: string;
  setNewSpecialty: (s: string) => void;
  onAddSpecialty: () => void;
  onDeleteSpecialty: (id: string) => void;
  newInsurance: string;
  setNewInsurance: (s: string) => void;
  onAddInsurance: () => void;
  onDeleteInsurance: (id: string) => void;
  newCategory: string;
  setNewCategory: (s: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: string) => void;
}

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

const AdminConfigTab: React.FC<AdminConfigTabProps> = (props) => {
  return (
     <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
        <ConfigColumn 
          title="Specialties" 
          items={props.specialties} 
          newItem={props.newSpecialty} 
          setNewItem={props.setNewSpecialty} 
          onAdd={props.onAddSpecialty} 
          onDelete={props.onDeleteSpecialty}
          placeholder="Add new..." 
        />
        <ConfigColumn 
          title="Insurance" 
          items={props.insurance} 
          newItem={props.newInsurance} 
          setNewItem={props.setNewInsurance} 
          onAdd={props.onAddInsurance} 
          onDelete={props.onDeleteInsurance}
          placeholder="Add provider..." 
        />
        <ConfigColumn 
          title="Blog Categories" 
          items={props.categories} 
          newItem={props.newCategory} 
          setNewItem={props.setNewCategory} 
          onAdd={props.onAddCategory} 
          onDelete={props.onDeleteCategory}
          placeholder="Add category..." 
        />
     </div>
  );
};

export default AdminConfigTab;
