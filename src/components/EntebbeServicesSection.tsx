import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  Star,
  Phone,
  Lock,
  Sparkles,
  CheckCircle2,
  Building2,
  Compass,
} from 'lucide-react';
import { EntebbeService, ServiceCategoryType } from '../types';
import { calculateDistanceToEntebbeKm } from '../data/entebbeEvents';

interface EntebbeServicesSectionProps {
  services: EntebbeService[];
  onBookService: (service: EntebbeService) => void;
  onOpenOrganiserPortal: () => void;
}

const SERVICE_CATEGORIES: ServiceCategoryType[] = [
  'All Services',
  'Sound & Stage',
  'Boat & Marine',
  'Lakeside Catering',
  'Security & Gate',
  'Media & Drone',
  'Beach Decor',
];

export const EntebbeServicesSection: React.FC<EntebbeServicesSectionProps> = ({
  services,
  onBookService,
  onOpenOrganiserPortal,
}) => {
  const [selectedCat, setSelectedCat] = useState<ServiceCategoryType>('All Services');

  const filteredServices =
    selectedCat === 'All Services'
      ? services
      : services.filter((s) => s.category === selectedCat);

  return (
    <section className="w-full mb-10 px-4 text-left">
      {/* Header with Geo-Lock Notice */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> Entebbe Geo-Locked Directory
            </span>
            <span className="text-[11px] text-white/50 font-mono">
              0.0512° N, 32.4637° E · ≤12km Peninsula Zone
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
            Verified Entebbe Event Services &amp; Vendors
            <span className="w-2 h-2 rounded-full bg-[#FFCC00]" />
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Guests worldwide can browse &amp; reserve packages. Only verified Entebbe-based service providers can list here.
          </p>
        </div>

        <button
          onClick={onOpenOrganiserPortal}
          className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55]/20 to-[#FFCC00]/20 hover:from-[#FF2D55]/30 hover:to-[#FFCC00]/30 border border-[#FF2D55]/40 text-white text-xs font-bold transition cursor-pointer shrink-0"
        >
          <Building2 className="w-3.5 h-3.5 text-[#FFCC00]" />
          <span>List Entebbe Service / Event (Geo-Verified)</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {SERVICE_CATEGORIES.map((cat) => {
          const active = selectedCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                active
                  ? 'bg-[#FFCC00] text-black shadow-md shadow-[#FFCC00]/20'
                  : 'bg-[#16161f] text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((srv) => {
          const distKm = calculateDistanceToEntebbeKm(srv.lat, srv.lng);
          return (
            <div
              key={srv.id}
              className="rounded-2xl bg-[#16161f] border border-white/10 hover:border-[#FFCC00]/50 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
            >
              <div>
                {/* Image & Geo Badge */}
                <div className="relative h-36 w-full overflow-hidden bg-[#0d0d12]">
                  <img
                    src={srv.imageUrl}
                    alt={srv.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161f] via-black/30 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {srv.verifiedLicense}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[#FFCC00] text-[11px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#FFCC00]" />
                    <span>{srv.rating.toFixed(1)}</span>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF2D55] text-white">
                      {srv.category}
                    </span>
                    <span className="text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded">
                      {distKm}km from Entebbe Ctr
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h4 className="text-sm font-bold text-white leading-snug mb-1">
                    {srv.name}
                  </h4>

                  <div className="flex items-center gap-1.5 text-[11px] text-white/60 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF2D55] shrink-0" />
                    <span className="truncate">
                      {srv.address} ({srv.area})
                    </span>
                  </div>

                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-3">
                    {srv.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {srv.highlights.map((h) => (
                      <span
                        key={h}
                        className="px-2 py-0.5 rounded-md bg-[#1f1f2e] border border-white/5 text-[10px] text-white/80 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 pb-4 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-white/40 block">Starting Rate</span>
                  <span className="font-mono text-xs font-black text-[#FFCC00]">
                    UGX {srv.rateUGX.toLocaleString()}{' '}
                    <span className="text-[10px] font-normal text-white/50">{srv.rateUnit}</span>
                  </span>
                </div>

                <button
                  onClick={() => onBookService(srv)}
                  className="px-3.5 py-2 rounded-xl bg-[#1f1f2e] hover:bg-[#FF2D55] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3" />
                  <span>Reserve Service</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
