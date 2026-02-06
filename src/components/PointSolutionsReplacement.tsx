import React from 'react';

const PointSolutionsReplacement: React.FC = () => {
  const columns = [
    {
      title: "CRM",
      logos: [
        { 
          name: "HubSpot", 
          url: "https://cdn.simpleicons.org/hubspot/FF5A5F",
          fallback: "HubSpot"
        },
        { 
          name: "Pipedrive", 
          url: "https://cdn.worldvectorlogo.com/logos/pipedrive.svg",
          fallback: "Pipedrive"
        }
      ]
    },
    {
      title: "Billing",
      logos: [
        { 
          name: "Stripe", 
          url: "https://cdn.simpleicons.org/stripe/008CDD",
          fallback: "Stripe"
        },
        { 
          name: "PayPal", 
          url: "https://cdn.simpleicons.org/paypal/003087",
          fallback: "PayPal"
        }
      ]
    },
    {
      title: "Email",
      logos: [
        { 
          name: "Mailchimp", 
          url: "https://cdn.simpleicons.org/mailchimp/FFE01B",
          fallback: "Mailchimp"
        },
        { 
          name: "ConvertKit", 
          url: "https://cdn.simpleicons.org/kit/FF5A5F",
          fallback: "ConvertKit"
        }
      ]
    },
    {
      title: "Help Desk",
      logos: [
        { 
          name: "Intercom", 
          url: "https://cdn.simpleicons.org/intercom/1F8DED",
          fallback: "Intercom"
        },
        { 
          name: "Zendesk", 
          url: "https://cdn.simpleicons.org/zendesk/03363D",
          fallback: "Zendesk"
        }
      ]
    },
    {
      title: "Authentication",
      logos: [
        { 
          name: "Firebase", 
          url: "https://cdn.simpleicons.org/firebase/FFCA28",
          fallback: "Firebase"
        },
        { 
          name: "Auth0", 
          url: "https://cdn.simpleicons.org/auth0/EB5424",
          fallback: "Auth0"
        }
      ]
    }
  ];

  // Function to handle image loading with text fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    img.style.display = 'none';
    const textSpan = img.nextElementSibling as HTMLElement;
    if (textSpan) {
      textSpan.style.display = 'block';
    }
  };

  return (
    <section className="py-24 bg-white overflow-hidden border-y border-slate-100/50">
      <div className="max-w-7xl mx-auto px-6 text-center reveal">
        <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] mb-4">What does EvoWell do?</p>
        <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-16 tracking-tight leading-tight">
          One platform. <br/><span className="text-slate-400">To replace them all.</span>
        </h2>

        <div className="border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden bg-white max-w-6xl mx-auto ring-1 ring-slate-100">
          {/* Header Row (Desktop) */}
          <div className="hidden md:grid grid-cols-5 border-b border-slate-100 bg-[#fdfdfd]">
            {columns.map((col, i) => (
              <div key={i} className={`py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 ${i < 4 ? 'border-r border-slate-100' : ''}`}>
                {col.title}
              </div>
            ))}
          </div>

          {/* Logo Rows */}
          <div className="grid grid-cols-1 md:grid-cols-5">
             {columns.map((col, i) => (
                <div key={i} className={`flex flex-col ${i < 4 ? 'md:border-r border-slate-100' : ''}`}>
                   {/* Mobile Header */}
                   <div className="md:hidden py-4 bg-slate-50 border-y border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 md:mt-0 first:mt-0">
                      {col.title}
                   </div>
                   {col.logos.map((logo, j) => (
                      <div key={j} className="h-32 flex items-center justify-center p-8 hover:bg-slate-50/30 transition-colors border-b border-slate-50 md:border-none last:border-none last:md:border-none md:odd:border-b md:border-slate-100/50 relative group">
                         <img 
                           src={logo.url} 
                           alt={logo.name} 
                           className="max-h-8 max-w-[140px] object-contain transition-all duration-300 transform group-hover:scale-110 drop-shadow-sm grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100" 
                           onError={handleImageError}
                           loading="lazy"
                           crossOrigin="anonymous"
                         />
                         <span className="text-sm font-black text-slate-400 hidden">
                           {logo.fallback}
                         </span>
                      </div>
                   ))}
                </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PointSolutionsReplacement;