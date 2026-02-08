import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Address } from '@/types';
import { Icon } from '@/components/ui';
import { iconPaths } from '@/components/ui/iconPaths';
import { brandImages } from '@/config/brandImages';

// Fix for default markers in React Leaflet with Vite/Webpack
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface DynamicMapProps {
  address?: Address;
  height?: string;
}

const MapSizeInvalidator: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    const rafId = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
};

const DynamicMap: React.FC<DynamicMapProps> = ({ address, height = "400px" }) => {
  if (!address || !address.lat || !address.lng) {
    return (
      <div className={`relative w-full rounded-[2rem] overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200`} style={{ height }}>
        {/* Fallback Static Map visual */}
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-multiply"
          style={{ backgroundImage: `url(${brandImages.maps.worldFallback.src}), url(${brandImages.maps.worldFallback.fallbackSrc})` }}
        ></div>
        <div className="relative z-10 bg-white/90 backdrop-blur-md px-8 py-6 rounded-2xl shadow-xl border border-slate-100 text-center">
           <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 mx-auto mb-2 flex items-center justify-center">
             <Icon path={iconPaths.pin} className="w-5 h-5" />
           </div>
           <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Location Map</p>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Coordinates unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] overflow-hidden shadow-inner border border-slate-200 z-0 relative group" style={{ height, width: "100%" }}>
      <MapContainer
        center={[address.lat, address.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSizeInvalidator />
        <Marker position={[address.lat, address.lng]}>
          <Popup className="font-sans">
            <div className="text-center p-2">
              <p className="font-bold text-slate-900 text-sm mb-1">{address.street}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{address.city}, {address.state}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay gradient for aesthetics */}
      <div className="absolute inset-0 pointer-events-none border-[6px] border-white/50 rounded-[2rem] z-[1000]"></div>
    </div>
  );
};

export default DynamicMap;
