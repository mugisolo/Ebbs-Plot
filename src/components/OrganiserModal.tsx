import React, { useState } from 'react';
import {
  X,
  Building,
  Ticket,
  Lock,
  ShieldCheck,
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import {
  ENTEBBE_VENUES,
  ENTEBBE_GEO_FENCE,
  calculateDistanceToEntebbeKm,
  isWithinEntebbeBounds,
} from '../data/entebbeEvents';
import {
  CategoryType,
  EntebbeEvent,
  EntebbeService,
  GeoVerificationStatus,
  ServiceCategoryType,
} from '../types';
import { OrganiserAnalytics } from './OrganiserAnalytics';

interface OrganiserModalProps {
  onClose: () => void;
  onAddEvent: (event: EntebbeEvent) => void;
  onAddService?: (service: EntebbeService) => void;
  totalTicketsSold: number;
  events?: EntebbeEvent[];
  geoStatus: GeoVerificationStatus;
  onUpdateGeoStatus: (status: GeoVerificationStatus) => void;
}

export const OrganiserModal: React.FC<OrganiserModalProps> = ({
  onClose,
  onAddEvent,
  onAddService,
  totalTicketsSold,
  events = [],
  geoStatus,
  onUpdateGeoStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'service' | 'analytics'>('create');
  const [isCheckingGps, setIsCheckingGps] = useState(false);
  const [geoErrorMsg, setGeoErrorMsg] = useState<string | null>(null);
  const [qrScanNotice, setQrScanNotice] = useState<string | null>(null);

  // Event Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Nightlife');
  const [venueKey, setVenueKey] = useState<string>('aeroBeach');
  const [dateStr, setDateStr] = useState('This Saturday, 8:00 PM');
  const [timeStr, setTimeStr] = useState('8:00 PM - 3:00 AM');
  const [priceUGX, setPriceUGX] = useState<number>(30000);
  const [isFree, setIsFree] = useState(false);
  const [organizerName, setOrganizerName] = useState('Entebbe Peninsula Promoters');
  const [emcLicense, setEmcLicense] = useState('EMC-ORG-2026-088');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
  );

  // Service Provider Form states
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] =
    useState<Exclude<ServiceCategoryType, 'All Services'>>('Sound & Stage');
  const [srvParish, setSrvParish] = useState<string>('Kitoro');
  const [srvAddress, setSrvAddress] = useState('Berkeley Road, Kitoro, Entebbe');
  const [srvRateUGX, setSrvRateUGX] = useState<number>(750000);
  const [srvRateUnit, setSrvRateUnit] = useState('per event day');
  const [srvPhone, setSrvPhone] = useState('+256 772 840 190');
  const [srvLicense, setSrvLicense] = useState('EMC-SRV-9042');
  const [srvDescription, setSrvDescription] = useState('');

  // Live Browser Geolocation Check against Entebbe Geo-Fence
  const handleVerifyLiveGps = () => {
    setIsCheckingGps(true);
    setGeoErrorMsg(null);

    if (!navigator.geolocation) {
      setIsCheckingGps(false);
      setGeoErrorMsg('Browser Geolocation API is not available on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsCheckingGps(false);
        const { latitude, longitude } = pos.coords;
        const dist = calculateDistanceToEntebbeKm(latitude, longitude);
        const insideEntebbe = isWithinEntebbeBounds(latitude, longitude);

        onUpdateGeoStatus({
          isVerifiedEntebbe: insideEntebbe,
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          distanceKm: dist,
          detectedArea: insideEntebbe
            ? 'Entebbe Municipal Peninsula (GPS Verified)'
            : `Outside Entebbe Geo-Fence (${dist} km away)`,
          method: 'gps',
          verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        if (!insideEntebbe) {
          setGeoErrorMsg(
            `Geo-Lock Restriction: Your live GPS (${latitude.toFixed(3)}°N, ${longitude.toFixed(
              3
            )}°E) is ${dist} km from Entebbe Town Center. Service providers and event managers must be located within Entebbe (≤12 km radius).`
          );
        }
      },
      (err) => {
        setIsCheckingGps(false);
        setGeoErrorMsg(
          `GPS read notice (${err.message}). Use the Entebbe Peninsula GPS Verifier toggle if testing remotely.`
        );
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  // Simulate Entebbe Resident Organiser vs Non-Entebbe Organiser (for testing Geo-Lock enforcement)
  const handleSimulateLocation = (insideEntebbe: boolean) => {
    setGeoErrorMsg(null);
    if (insideEntebbe) {
      const lat = 0.0512;
      const lng = 32.4637;
      onUpdateGeoStatus({
        isVerifiedEntebbe: true,
        lat,
        lng,
        distanceKm: 0.4,
        detectedArea: 'Kitoro / Central Entebbe Peninsula',
        method: 'simulated-entebbe',
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      const lat = 0.3476;
      const lng = 32.5825;
      const dist = calculateDistanceToEntebbeKm(lat, lng);
      onUpdateGeoStatus({
        isVerifiedEntebbe: false,
        lat,
        lng,
        distanceKm: dist,
        detectedArea: 'Outside Entebbe Municipality (35.4 km North)',
        method: 'simulated-outside',
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setGeoErrorMsg(
        `Geo-Lock Triggered: Provider coordinates (${lat}°N, ${lng}°E — ${dist} km from Entebbe) are outside the Entebbe Municipal boundary. Only Entebbe service providers can manage or publish events.`
      );
    }
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setGeoErrorMsg(null);

    if (!geoStatus.isVerifiedEntebbe) {
      setGeoErrorMsg(
        'Access Denied: Service providers (Event Managers) must be geo-verified within Entebbe to publish events.'
      );
      return;
    }

    if (!title.trim()) return;

    const venue = ENTEBBE_VENUES[venueKey] || ENTEBBE_VENUES.aeroBeach;

    // Validate venue coordinates are strictly inside Entebbe bounds
    if (!isWithinEntebbeBounds(venue.lat, venue.lng)) {
      setGeoErrorMsg('Venue coordinates fall outside the Entebbe Peninsula Geo-Lock.');
      return;
    }

    const newEvent: EntebbeEvent = {
      id: `evt-ebb-${Date.now()}`,
      title,
      category,
      venue,
      dateStr,
      timeStr,
      rawDate: new Date().toISOString(),
      priceUGX: isFree ? 0 : priceUGX,
      isFree,
      featured: false,
      tags: [category.toUpperCase(), venue.area.toUpperCase(), 'ENTEBBE EXCLUSIVE'],
      imageUrl,
      description:
        description || `Experience an unforgettable lakeshore event at ${venue.name}, Entebbe.`,
      organizer: organizerName || 'Verified Entebbe Promoter',
      organizerLicense: emcLicense || 'EMC-ORG-VERIFIED',
      attendeesCount: 1,
      liveStatus: 'UPCOMING',
    };

    onAddEvent(newEvent);
    onClose();
  };

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault();
    setGeoErrorMsg(null);

    if (!geoStatus.isVerifiedEntebbe) {
      setGeoErrorMsg(
        'Access Denied: Only service providers physically operating in Entebbe can list event services.'
      );
      return;
    }

    if (!srvName.trim() || !onAddService) return;

    if (!ENTEBBE_GEO_FENCE.allowedParishes.includes(srvParish)) {
      setGeoErrorMsg('Selected parish is outside the Entebbe Municipal service zone.');
      return;
    }

    const newService: EntebbeService = {
      id: `srv-ebb-${Date.now()}`,
      name: srvName,
      category: srvCategory,
      area: srvParish,
      lat: 0.0545,
      lng: 32.4675,
      address: srvAddress,
      rateUGX: srvRateUGX,
      rateUnit: srvRateUnit,
      rating: 5.0,
      verifiedLicense: srvLicense || 'EMC-SRV-VERIFIED',
      phone: srvPhone,
      description:
        srvDescription ||
        `Verified Entebbe ${srvCategory.toLowerCase()} provider serving the Entebbe Peninsula.`,
      imageUrl:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      highlights: [`${srvParish} Entebbe Base`, 'EMC Licensed Provider', 'Rapid Peninsula Setup'],
    };

    onAddService(newService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#16161f] border border-white/10 shadow-2xl p-6 relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF2D55] to-[#FF5E3A] flex items-center justify-center text-white shadow-lg shadow-[#FF2D55]/30">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#FF2D55] uppercase tracking-wider">
                Kesho Entebbe Organiser Portal
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Entebbe Geo-Locked
              </span>
            </div>
            <h3 className="text-lg font-black text-white">
              Entebbe Event Managers &amp; Service Providers
            </h3>
          </div>
        </div>

        {/* Geo-Lock Enforcement Banner */}
        <div
          className={`p-4 rounded-2xl border mb-5 transition ${
            geoStatus.isVerifiedEntebbe
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-rose-500/15 border-rose-500/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {geoStatus.isVerifiedEntebbe ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      geoStatus.isVerifiedEntebbe ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {geoStatus.isVerifiedEntebbe
                      ? 'Entebbe Provider Geo-Lock: VERIFIED'
                      : 'Entebbe Provider Geo-Lock: RESTRICTED (OUTSIDE ENTEBBE)'}
                  </span>
                  <span className="text-[11px] font-mono text-white/60">
                    ({geoStatus.lat.toFixed(4)}° N, {geoStatus.lng.toFixed(4)}° E ·{' '}
                    {geoStatus.distanceKm} km from Entebbe Center)
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">
                  {geoStatus.isVerifiedEntebbe
                    ? `Active Zone: ${geoStatus.detectedArea}. Guests can view from anywhere, and your Entebbe provider account is authorized to publish events & services.`
                    : `Detected Zone: ${geoStatus.detectedArea}. Guests can browse from anywhere, but Service Providers & Event Managers MUST be located inside Entebbe Municipality (≤12km radius).`}
                </p>
              </div>
            </div>

            {/* GPS Check & Simulator Controls */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleVerifyLiveGps}
                disabled={isCheckingGps}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="Verify using device GPS"
              >
                <Navigation className="w-3 h-3 text-[#FFCC00]" />
                <span>{isCheckingGps ? 'Checking GPS...' : 'Live GPS Check'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLocation(true)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  geoStatus.isVerifiedEntebbe
                    ? 'bg-emerald-500 text-black'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                title="Verify at Kitoro, Entebbe (0.0512° N, 32.4637° E)"
              >
                Entebbe GPS
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLocation(false)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  !geoStatus.isVerifiedEntebbe
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                title="Test Geo-Lock Block outside Entebbe (35km away)"
              >
                Test Outside Lock
              </button>
            </div>
          </div>

          {geoErrorMsg && (
            <div className="mt-2.5 pt-2.5 border-t border-rose-500/30 text-xs text-rose-300 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{geoErrorMsg}</span>
            </div>
          )}
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#0d0d12] border border-white/5 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#FF2D55] text-white shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Create Entebbe Event
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'service'
                ? 'bg-[#FF2D55] text-white shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            List Entebbe Service
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#FF2D55] text-white shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Sales &amp; Gate Analytics
          </button>
        </div>

        {/* If Provider is Outside Entebbe and trying to Create Event or Service, show Geo-Lock Gate */}
        {!geoStatus.isVerifiedEntebbe && activeTab !== 'analytics' ? (
          <div className="p-8 rounded-2xl bg-[#0d0d12] border border-rose-500/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                Service Provider Geo-Fence Active
              </span>
              <h4 className="text-base md:text-lg font-black text-white mt-2">
                Event Managers &amp; Service Providers Must Be in Entebbe
              </h4>
              <p className="text-xs text-white/60 max-w-md mx-auto mt-1 leading-relaxed">
                Kesho is strictly geo-locked to the <strong>Entebbe Peninsula</strong> (Nakiwogo, Kitoro, Bugonga, Botanical Beach, Aero Beach, Waterfront, Katabi). Guests can view events from anywhere in the world, but publishing events or services requires an Entebbe GPS location.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSimulateLocation(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-lg cursor-pointer"
              >
                Verify Entebbe Peninsula GPS (0.0512° N, 32.4637° E)
              </button>
              <button
                type="button"
                onClick={handleVerifyLiveGps}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer"
              >
                Retry Device GPS
              </button>
            </div>
          </div>
        ) : activeTab === 'create' ? (
          <form onSubmit={handleSubmitEvent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Botanical Beach Sunset Jazz & Grill"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Entebbe Promoter / Organiser Name *
                </label>
                <input
                  type="text"
                  required
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="e.g. Entebbe Lakeshore Events Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
                >
                  <option value="Nightlife">Nightlife</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Quiz Night">Quiz Night</option>
                  <option value="Open Mic">Open Mic</option>
                  <option value="Meetups">Meetups</option>
                  <option value="Seminars">Seminars</option>
                  <option value="Food">Food</option>
                  <option value="Arts">Arts</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Verified Venue in Entebbe
                </label>
                <select
                  value={venueKey}
                  onChange={(e) => setVenueKey(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
                >
                  {Object.entries(ENTEBBE_VENUES).map(([key, v]) => (
                    <option key={key} value={key}>
                      {v.name} ({v.area})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Entebbe Municipal License #
                </label>
                <input
                  type="text"
                  value={emcLicense}
                  onChange={(e) => setEmcLicense(e.target.value)}
                  placeholder="EMC-ORG-2026-XXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-emerald-400 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Date Display
                </label>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  placeholder="e.g. Saturday, 8:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Time Window
                </label>
                <input
                  type="text"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  placeholder="e.g. 8:00 PM - 3:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="p-3.5 rounded-2xl bg-[#0d0d12] border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Ticket Price (UGX)</span>
                <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="accent-[#FF2D55] rounded"
                  />
                  <span>Free Admission</span>
                </label>
              </div>
              {!isFree && (
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={priceUGX}
                  onChange={(e) => setPriceUGX(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1f1f2e] border border-white/10 text-white font-mono text-sm font-bold"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">
                Description &amp; Lakeshore Lineup
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight DJs, headliners, boat pier boarding times, or beach cabana reservations in Entebbe..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white font-bold text-xs md:text-sm shadow-xl shadow-[#FF2D55]/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Publish Geo-Verified Entebbe Event
            </button>
          </form>
        ) : activeTab === 'service' ? (
          <form onSubmit={handleSubmitService} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Entebbe Service / Vendor Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="e.g. Bugonga Beach Sound & Lighting"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Service Category
                </label>
                <select
                  value={srvCategory}
                  onChange={(e) =>
                    setSrvCategory(
                      e.target.value as Exclude<ServiceCategoryType, 'All Services'>
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
                >
                  <option value="Sound & Stage">Sound &amp; Stage</option>
                  <option value="Boat & Marine">Boat &amp; Marine</option>
                  <option value="Lakeside Catering">Lakeside Catering</option>
                  <option value="Security & Gate">Security &amp; Gate</option>
                  <option value="Media & Drone">Media &amp; Drone</option>
                  <option value="Beach Decor">Beach Decor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Entebbe Parish / Zone (Geo-Locked)
                </label>
                <select
                  value={srvParish}
                  onChange={(e) => setSrvParish(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
                >
                  {ENTEBBE_GEO_FENCE.allowedParishes.map((parish) => (
                    <option key={parish} value={parish}>
                      {parish} (Entebbe)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Street Address in Entebbe
                </label>
                <input
                  type="text"
                  required
                  value={srvAddress}
                  onChange={(e) => setSrvAddress(e.target.value)}
                  placeholder="Plot & Road in Entebbe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  EMC Trading Permit #
                </label>
                <input
                  type="text"
                  value={srvLicense}
                  onChange={(e) => setSrvLicense(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-emerald-400 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Starting Rate (UGX)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  value={srvRateUGX}
                  onChange={(e) => setSrvRateUGX(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Rate Unit
                </label>
                <input
                  type="text"
                  value={srvRateUnit}
                  onChange={(e) => setSrvRateUnit(e.target.value)}
                  placeholder="e.g. per event day"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1 block">
                  Entebbe Contact Phone
                </label>
                <input
                  type="text"
                  value={srvPhone}
                  onChange={(e) => setSrvPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 mb-1 block">
                Equipment &amp; Service Specifications
              </label>
              <textarea
                rows={2}
                value={srvDescription}
                onChange={(e) => setSrvDescription(e.target.value)}
                placeholder="Describe sound wattage, boat capacity, catering menu, or security team size in Entebbe..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFCC00] to-[#FF9500] text-black font-black text-xs md:text-sm shadow-xl shadow-[#FFCC00]/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              List Verified Entebbe Event Service
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Recharts Data Visualizations */}
            <OrganiserAnalytics
              events={events}
              totalTicketsSold={totalTicketsSold}
            />

            {/* Gate Scanner Simulator */}
            <div className="p-4 md:p-5 rounded-2xl bg-[#0d0d12] border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#FF2D55]" />
                Entebbe Gate Attendant QR Validator
              </h4>
              <p className="text-xs text-white/60 mb-3">
                Simulate scanning an attendee&apos;s digital ticket pass at an Entebbe venue entrance.
              </p>

              {qrScanNotice && (
                <div className="mb-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{qrScanNotice}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setQrScanNotice(
                    'Pass Verified! Token: KESHO-PASS-EBB-OK. Entebbe venue gate admittance granted.'
                  );
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
              >
                Scan Test Entebbe QR Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
