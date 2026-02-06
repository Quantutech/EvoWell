
import React, { useState } from 'react';
import { useNavigation } from '../../App';
import SimpleChart from '../SimpleChart';

const HeroSection: React.FC = () => {
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (location) params.set('state', location);
    navigate(`#/search?${params.toString()}`);
  };

  const heroChartData = [
    { date: '2024-01-01', views: 20, inquiries: 2 },
    { date: '2024-01-02', views: 45, inquiries: 5 },
    { date: '2024-01-03', views: 30, inquiries: 3 },
    { date: '2024-01-04', views: 60, inquiries: 8 },
    { date: '2024-01-05', views: 80, inquiries: 12 },
    { date: '2024-01-06', views: 110, inquiries: 15 },
  ];

  return (
    <section className="relative pt-20 pb-32 overflow-hidden bg-[#F8FAFC]">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <div className="pt-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm">
            The Sovereign Practice OS
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
            The next evolution<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">in clinical care.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium mb-12 max-w-lg leading-relaxed">
            For Patients: A trusted network of verified experts.<br/>
            For Providers: A complete operating system to grow your practice on your terms.
          </p>

          <div className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-2 max-w-xl mb-10 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
              <div className="relative border-b md:border-b-0 md:border-r border-slate-100">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Condition, Specialty, or Name..." 
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0 outline-none" 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
              </div>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Zip Code or 'Remote'" 
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0 outline-none" 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
              </div>
            </div>
            <button onClick={handleSearchSubmit} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-slate-800 transition-all shadow-lg w-full md:w-auto">
              Find Care
            </button>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
             <span>Founding Partners</span>
             <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-500 flex items-center justify-center text-[8px] text-white">50+</div>
             </div>
             <span>Clinicians</span>
          </div>
        </div>

        <div className="relative lg:h-[600px] flex items-center justify-center reveal">
           <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-20 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Weekly Growth</p>
                    <h3 className="text-3xl font-black text-slate-900">$8,450</h3>
                 </div>
                 <div className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">+24%</div>
              </div>
              
              <div className="h-40 mb-8">
                 <SimpleChart data={heroChartData} dataKey="views" color="#257a46" height={160} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">New Patients</p>
                    <p className="text-xl font-black text-slate-900">12</p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Retention</p>
                    <p className="text-xl font-black text-slate-900">98%</p>
                 </div>
              </div>
           </div>

           <div className="absolute top-20 right-0 bg-white p-4 rounded-2xl shadow-xl z-30 animate-bounce-slow">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">📅</div>
                 <div>
                    <p className="text-xs font-bold text-slate-900">New Booking</p>
                    <p className="text-[10px] text-slate-500">Just now • Sarah M.</p>
                 </div>
              </div>
           </div>

           <div className="absolute bottom-20 left-0 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl z-30 animate-bounce-slow" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center font-black">5.0</div>
                 <div>
                    <p className="text-xs font-bold">Stellar Review</p>
                    <div className="flex text-amber-400 text-[10px]">★★★★★</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
