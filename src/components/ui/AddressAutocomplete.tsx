import React, { useCallback } from 'react';
import { AddressAutofill } from '@mapbox/search-js-react';
import { Address } from '@/types';
import { APP_CONFIG } from '@/config/app';

interface AddressAutocompleteProps {
  value?: Address;
  onChange: (address: Address) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  label = "Street Address",
  placeholder = "Start typing your address...",
  className = ""
}) => {
  const MAPBOX_TOKEN = APP_CONFIG.mapboxToken || (import.meta as any).env.VITE_MAPBOX_TOKEN || "";

  const handleRetrieve = useCallback((res: any) => {
    const feature = res.features[0];
    if (!feature) return;

    // Mapbox Search JS AddressAutofill provides a specific structure
    const props = feature.properties;
    
    // Extract address components from context or properties
    const street = props.address_line1 || props.name || "";
    const city = props.place || props.context?.place?.name || "";
    const state = props.region || props.context?.region?.name || "";
    const zip = props.postcode || props.context?.postcode?.name || "";
    const country = props.country || props.context?.country?.name || "USA";
    
    const [lng, lat] = feature.geometry.coordinates;

    console.log('Mapbox Address Retrieved:', { street, city, state, zip, lat, lng });

    onChange({
      street,
      city,
      state,
      zip,
      lat,
      lng,
      country
    });
  }, [onChange]);

  if (!MAPBOX_TOKEN) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <input 
                type="text"
                value={value?.street || ""}
                onChange={(e) => onChange({ ...value!, street: e.target.value, city: value?.city || "", state: value?.state || "", zip: value?.zip || "", country: value?.country || "USA" })}
                placeholder={placeholder}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
            />
            <p className="text-[9px] text-amber-500 font-bold uppercase tracking-tight">Mapbox token missing. Manual entry enabled.</p>
        </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <AddressAutofill 
        accessToken={MAPBOX_TOKEN}
        onRetrieve={handleRetrieve}
      >
        <input
          name="address"
          placeholder={placeholder}
          type="text"
          autoComplete="address-line1"
          value={value?.street || ""}
          onChange={(e) => onChange({ 
              ...value!, 
              street: e.target.value,
              city: value?.city || "",
              state: value?.state || "",
              zip: value?.zip || "",
              country: value?.country || "USA"
          })}
          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none"
        />
      </AddressAutofill>
    </div>
  );
};

export default AddressAutocomplete;
