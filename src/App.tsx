import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_EVENTS,
  INITIAL_ENTEBBE_SERVICES,
  calculateDistanceToEntebbeKm,
  isWithinEntebbeBounds,
} from './data/entebbeEvents';
import {
  CategoryType,
  EntebbeEvent,
  EntebbeService,
  GeoVerificationStatus,
  UserProfile,
  UserTicket,
  WalletTransaction,
} from './types';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  db,
} from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createGoogleTaskForEvent } from './services/googleTasks';
import { Lock, Globe, ShieldCheck, Navigation } from 'lucide-react';

// Components
import { TopBar } from './components/TopBar';
import { LiveMarquee } from './components/LiveMarquee';
import { HeroBanner } from './components/HeroBanner';
import { CategoryChips } from './components/CategoryChips';
import { NetflixCarousel } from './components/NetflixCarousel';
import { EntebbeServicesSection } from './components/EntebbeServicesSection';
import { ProximityFeed } from './components/ProximityFeed';
import { BottomNav, TabType } from './components/BottomNav';
import { SearchScreen } from './components/SearchScreen';
import { SavedScreen } from './components/SavedScreen';
import { ProfileWalletScreen } from './components/ProfileWalletScreen';

// Modals
import { TicketPurchaseModal } from './components/TicketPurchaseModal';
import { TopUpModal } from './components/TopUpModal';
import { EntebbeMapModal } from './components/EntebbeMapModal';
import { KeshoChatbotModal } from './components/KeshoChatbotModal';
import { MusicVibeModal } from './components/MusicVibeModal';
import { DigitalTicketPassModal } from './components/DigitalTicketPassModal';
import { OrganiserModal } from './components/OrganiserModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { QRScannerModal } from './components/QRScannerModal';

export default function App() {
  // Navigation & Tab state
  const [currentTab, setCurrentTab] = useState<TabType>('discover');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');

  // Entebbe Events & Services state
  const [events, setEvents] = useState<EntebbeEvent[]>(INITIAL_EVENTS);
  const [services, setServices] = useState<EntebbeService[]>(INITIAL_ENTEBBE_SERVICES);
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(
    new Set(['event-entebbe-quiz', 'event-lakeside-jazz'])
  );

  // Entebbe Service Provider Geo-Lock State
  const [geoStatus, setGeoStatus] = useState<GeoVerificationStatus>({
    isVerifiedEntebbe: true,
    lat: 0.0512,
    lng: 32.4637,
    distanceKm: 0.4,
    detectedArea: 'Kitoro · Entebbe Municipal Peninsula',
    method: 'simulated-entebbe',
    verifiedAt: 'Verified',
  });

  // User & Wallet State
  const [user, setUser] = useState<UserProfile | null>({
    id: 'user-remmy-entebbe',
    displayName: 'Remmy Byakutaaga',
    email: 'remmy.entebbe@kesho.com',
    role: 'attendee',
    walletBalance: 150000,
    createdAt: new Date().toISOString(),
    entebbeOrganiserVerified: true,
    organiserParish: 'Kitoro, Entebbe',
  });
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  // Tickets & Transactions
  const [tickets, setTickets] = useState<UserTicket[]>([
    {
      id: 'TKT-EBB-9412',
      userId: 'user-remmy-entebbe',
      eventId: 'event-entebbe-quiz',
      eventTitle: 'The Great Entebbe Pub Quiz & Trivia Night',
      venueName: 'Riders Lounge & Victoria Rooftop',
      area: 'Kitoro',
      eventDate: 'Tonight, 8:00 PM',
      ticketType: 'Regular',
      priceUGX: 20000,
      qrCode: 'KESHO-PASS:event-entebbe-quiz:Regular:1730560000',
      status: 'valid',
      createdAt: 'Today',
    },
  ]);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: 'TX-8821',
      userId: 'user-remmy-entebbe',
      type: 'topup',
      amountUGX: 100000,
      method: 'MTN Mobile Money',
      status: 'completed',
      description: 'MTN MoMo Deposit (*165#) · Entebbe',
      createdAt: 'Yesterday, 4:15 PM',
    },
    {
      id: 'TX-8822',
      userId: 'user-remmy-entebbe',
      type: 'purchase',
      amountUGX: 20000,
      method: 'Kesho Wallet',
      status: 'completed',
      description: 'The Great Entebbe Pub Quiz Ticket',
      createdAt: 'Today, 2:30 PM',
    },
    {
      id: 'TX-8823',
      userId: 'user-remmy-entebbe',
      type: 'cashback',
      amountUGX: 5000,
      method: 'Kesho Loyalty',
      status: 'completed',
      description: 'Entebbe Lakeshore Weekend Perk',
      createdAt: 'Today, 2:31 PM',
    },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 'notif-1',
      title: 'Kitoro Trivia Night Starting Soon!',
      message: 'The Great Entebbe Pub Quiz kicks off in 2 hours at Riders Lounge Victoria Rooftop, Kitoro. Gates open at 7:30 PM.',
      time: '15m ago',
      unread: true,
      type: 'urgent',
    },
    {
      id: 'notif-2',
      title: 'Lake Victoria Jazz Safari Announced',
      message: 'Waterfront Beach sunset saxophone session tickets now live for this Friday at Goretti’s Beach Bar, Entebbe.',
      time: '2h ago',
      unread: true,
      type: 'promo',
    },
    {
      id: 'notif-3',
      title: 'Entebbe Digital Pass Ready',
      message: 'Your gate pass #TKT-EBB-9412 is ready for door scanning in Kitoro, Entebbe.',
      time: '5h ago',
      unread: false,
      type: 'ticket',
    },
  ]);

  // Modals state
  const [activeModalEvent, setActiveModalEvent] = useState<EntebbeEvent | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [musicInitialGenre, setMusicInitialGenre] = useState<string>('Afro-Jazz Night');
  const [isOrganiserOpen, setIsOrganiserOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedTicketPass, setSelectedTicketPass] = useState<UserTicket | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (firebaseUser, token) => {
        setGoogleAccessToken(token);
        setUser((prev) => ({
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Remmy Byakutaaga',
          email: firebaseUser.email || 'remmy.entebbe@kesho.com',
          photoURL: firebaseUser.photoURL || undefined,
          role: prev?.role || 'attendee',
          walletBalance: prev?.walletBalance ?? 150000,
          createdAt: prev?.createdAt || new Date().toISOString(),
          entebbeOrganiserVerified: prev?.entebbeOrganiserVerified ?? true,
          organiserParish: prev?.organiserParish || 'Kitoro, Entebbe',
        }));
      },
      () => {
        // user signed out or guest
      }
    );

    return () => unsubscribe();
  }, []);

  // Google Sign-in handler
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleAccessToken(result.accessToken);
        showToast(`Signed in as ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      showToast(`Sign in error: ${err.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setGoogleAccessToken(null);
    showToast('Signed out of Kesho Entebbe');
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const promotedHero = useMemo(() => {
    return events.find((e) => e.featured) || events[0];
  }, [events]);

  const trendingEvents = useMemo(() => {
    return filteredEvents.slice(0, 8);
  }, [filteredEvents]);

  const savedEventsList = useMemo(() => {
    return events.filter((e) => savedEventIds.has(e.id));
  }, [events, savedEventIds]);

  // Toggle Save Event
  const handleToggleSave = async (event: EntebbeEvent) => {
    const isCurrentlySaved = savedEventIds.has(event.id);
    const newSet = new Set(savedEventIds);

    if (isCurrentlySaved) {
      newSet.delete(event.id);
      showToast(`Removed "${event.title}" from saved`);
    } else {
      newSet.add(event.id);
      showToast(`Saved "${event.title}" to your Entebbe shortlist`);
    }

    setSavedEventIds(newSet);

    // Persist to Firestore if user is authenticated
    if (user?.id && user.id !== 'guest') {
      try {
        const savedDocRef = doc(db, 'savedEvents', `${user.id}_${event.id}`);
        if (isCurrentlySaved) {
          await deleteDoc(savedDocRef);
        } else {
          await setDoc(savedDocRef, {
            id: `${user.id}_${event.id}`,
            userId: user.id,
            eventId: event.id,
            eventTitle: event.title,
            venueName: event.venue.name,
            priceUGX: event.priceUGX,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Firestore savedEvent update sync:', err);
      }
    }
  };

  // Complete Ticket Purchase
  const handlePurchaseSuccess = async (
    newTicket: UserTicket,
    totalPaid: number,
    syncGoogleTasks: boolean
  ) => {
    const updatedBalance = Math.max(0, (user?.walletBalance ?? 150000) - totalPaid);
    setUser((prev) => (prev ? { ...prev, walletBalance: updatedBalance } : null));

    setTickets((prev) => [newTicket, ...prev]);

    const newTx: WalletTransaction = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      userId: user?.id || 'guest',
      type: 'purchase',
      amountUGX: totalPaid,
      method: 'Kesho Wallet',
      status: 'completed',
      description: `${newTicket.ticketType} Ticket: ${newTicket.eventTitle}`,
      createdAt: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);

    setActiveModalEvent(null);

    let taskSyncMessage = '';
    if (syncGoogleTasks) {
      const matchedEvt = events.find((e) => e.id === newTicket.eventId);
      if (matchedEvt) {
        const currentToken = googleAccessToken || (await getAccessToken());
        if (currentToken) {
          const taskResult = await createGoogleTaskForEvent(
            currentToken,
            matchedEvt,
            newTicket.id
          );
          if (taskResult.success) {
            taskSyncMessage = ' & added to Google Tasks!';
          } else {
            console.warn('Task sync failed:', taskResult.error);
          }
        }
      }
    }

    if (user?.id && user.id !== 'guest') {
      try {
        await setDoc(doc(db, 'tickets', newTicket.id), newTicket);
        await setDoc(doc(db, 'transactions', newTx.id), newTx);
        await setDoc(
          doc(db, 'users', user.id),
          {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            walletBalance: updatedBalance,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore persistence notice:', err);
      }
    }

    showToast(`🎟️ Entebbe Pass claimed: ${newTicket.id}${taskSyncMessage}`);
    setSelectedTicketPass(newTicket);
  };

  // Complete Wallet Top Up
  const handleTopUpSuccess = async (amount: number, method: string) => {
    const updatedBalance = (user?.walletBalance ?? 150000) + amount;
    setUser((prev) => (prev ? { ...prev, walletBalance: updatedBalance } : null));

    const newTx: WalletTransaction = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      userId: user?.id || 'guest',
      type: 'topup',
      amountUGX: amount,
      method,
      status: 'completed',
      description: `Deposit via ${method}`,
      createdAt: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);

    setIsTopUpOpen(false);
    showToast(`✅ UGX ${amount.toLocaleString()} credited to Kesho Wallet!`);

    if (user?.id && user.id !== 'guest') {
      try {
        await setDoc(doc(db, 'transactions', newTx.id), newTx);
        await setDoc(
          doc(db, 'users', user.id),
          {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            walletBalance: updatedBalance,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore topup persistence notice:', err);
      }
    }
  };

  // Add new Entebbe event from Organiser Modal (Geo-Locked to Entebbe)
  const handleAddNewEvent = (newEvent: EntebbeEvent) => {
    if (!geoStatus.isVerifiedEntebbe) {
      showToast('⛔ Geo-Lock Alert: Only Entebbe-verified event managers can publish events.');
      return;
    }
    setEvents((prev) => [newEvent, ...prev]);
    showToast(`🚀 "${newEvent.title}" published live in the Entebbe feed!`);
  };

  // Add new Entebbe service from Organiser Modal (Geo-Locked to Entebbe)
  const handleAddNewService = (newService: EntebbeService) => {
    if (!geoStatus.isVerifiedEntebbe) {
      showToast('⛔ Geo-Lock Alert: Only Entebbe-verified service providers can list services.');
      return;
    }
    setServices((prev) => [newService, ...prev]);
    showToast(`🛠️ "${newService.name}" added to the Entebbe Verified Vendor Directory!`);
  };

  // Reserve an Entebbe Event Service
  const handleBookService = (service: EntebbeService) => {
    showToast(
      `📞 Booking inquiry dispatched to ${service.name} (${service.area}, Entebbe · ${service.phone})`
    );
  };

  // Switch between Guest/Attendee (Global) and Organiser/Service Provider (Entebbe Geo-Locked)
  const handleToggleOrganiserMode = (mode: 'attendee' | 'organiser') => {
    if (mode === 'organiser' && !geoStatus.isVerifiedEntebbe) {
      showToast(
        '⛔ Geo-Lock Restriction: Service providers & event managers must be in Entebbe. Opening Geo-Verifier...'
      );
      setIsOrganiserOpen(true);
      return;
    }

    setUser((prev) => (prev ? { ...prev, role: mode } : null));
    showToast(
      mode === 'organiser'
        ? '✅ Entebbe Organiser Mode Active (Verified in Entebbe Peninsula)'
        : '🌍 Switched to Guest / Attendee Mode (Global View Enabled)'
    );
  };

  // Claim VIP Invitation from QR Scanner
  const handleClaimInvitation = async (newTicket: UserTicket, bonusUGX: number = 0) => {
    setTickets((prev) => [newTicket, ...prev]);

    let updatedBalance = user?.walletBalance ?? 150000;
    if (bonusUGX > 0) {
      updatedBalance += bonusUGX;
      setUser((prev) => (prev ? { ...prev, walletBalance: updatedBalance } : null));

      const newTx: WalletTransaction = {
        id: `TX-INV-${Date.now().toString().slice(-4)}`,
        userId: user?.id || 'guest',
        type: 'cashback',
        amountUGX: bonusUGX,
        method: 'VIP QR Code Promo',
        status: 'completed',
        description: `Promo Beverage Credit: ${newTicket.eventTitle}`,
        createdAt: 'Just now',
      };
      setTransactions((prev) => [newTx, ...prev]);

      if (user?.id && user.id !== 'guest') {
        try {
          await setDoc(doc(db, 'transactions', newTx.id), newTx);
        } catch (err) {
          console.warn('Firestore tx notice:', err);
        }
      }
    }

    if (user?.id && user.id !== 'guest') {
      try {
        await setDoc(doc(db, 'tickets', newTicket.id), newTicket);
        await setDoc(
          doc(db, 'users', user.id),
          { walletBalance: updatedBalance, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore ticket notice:', err);
      }
    }

    showToast(`🎉 VIP Pass Claimed: ${newTicket.eventTitle}! Pass added to your wallet.`);
    setSelectedTicketPass(newTicket);
  };

  // Venue Gate Check-in from QR Scanner
  const handleVenueCheckIn = async (
    venueName: string,
    perkDescription: string,
    rewardUGX: number = 10000
  ) => {
    const updatedBalance = (user?.walletBalance ?? 150000) + rewardUGX;
    setUser((prev) => (prev ? { ...prev, walletBalance: updatedBalance } : null));

    const newTx: WalletTransaction = {
      id: `TX-CHK-${Date.now().toString().slice(-4)}`,
      userId: user?.id || 'guest',
      type: 'cashback',
      amountUGX: rewardUGX,
      method: 'Entebbe Venue Gate QR Check-in',
      status: 'completed',
      description: `Welcome Perk: ${venueName}`,
      createdAt: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (user?.id && user.id !== 'guest') {
      try {
        await setDoc(doc(db, 'transactions', newTx.id), newTx);
        await setDoc(
          doc(db, 'users', user.id),
          { walletBalance: updatedBalance, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore check-in notice:', err);
      }
    }

    showToast(
      `📍 Checked in at ${venueName}! UGX ${rewardUGX.toLocaleString()} welcome cashback credited.`
    );
  };

  // Handle joining waitlist for sold-out events
  const handleJoinWaitlist = (event: EntebbeEvent, tier: string, quantity: number) => {
    const queuePos = (event.waitlistCount || 28) + 1;
    const newNotif = {
      id: `notif-waitlist-${Date.now()}`,
      title: `Waitlist Priority: ${event.title}`,
      message: `You are #${queuePos} in queue for ${quantity}x ${tier} pass(es) at ${event.venue.name}, Entebbe. You will be alerted the second tickets open up!`,
      time: 'Just now',
      unread: true,
      type: 'waitlist' as const,
      eventId: event.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`🔔 Joined Priority Waitlist (#${queuePos}) for "${event.title}"`);
  };

  // Simulate ticket release notification
  const handleSimulateTicketRelease = (event: EntebbeEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, isSoldOut: false } : e))
    );
    if (activeModalEvent && activeModalEvent.id === event.id) {
      setActiveModalEvent({ ...activeModalEvent, isSoldOut: false });
    }

    const alertNotif = {
      id: `notif-drop-${Date.now()}`,
      title: `🎉 Tickets Released: ${event.title}!`,
      message: `2 returned tickets have just become available for ${event.title} at ${event.venue.name}, Entebbe. Claim yours now before they sell out again!`,
      time: 'Just now',
      unread: true,
      type: 'ticket' as const,
      eventId: event.id,
    };
    setNotifications((prev) => [alertNotif, ...prev]);

    showToast(`⚡ Alert: 2 tickets just opened up for ${event.title} in Entebbe! Available now.`);
  };

  const unreadNotifsCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col justify-between selection:bg-[#FF2D55] selection:text-white relative">
      {/* PWA Offline Indicator */}
      <OfflineIndicator />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white text-xs md:text-sm font-bold shadow-2xl animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Top Bar */}
      <TopBar
        user={user}
        onOpenSearch={() => setCurrentTab('search')}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenMusic={() => {
          setMusicInitialGenre('Afro-Jazz Night');
          setIsMusicOpen(true);
        }}
        unreadNotificationsCount={unreadNotifsCount}
      />

      {/* Urgent Live Marquee Ticker */}
      <LiveMarquee
        events={events}
        onSelectEvent={(evt) => setActiveModalEvent(evt)}
      />

      {/* Entebbe Geo-Lock Status Bar */}
      <div className="w-full bg-[#16161f]/90 border-b border-white/5 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <Lock className="w-3 h-3" /> Entebbe Peninsula Geo-Lock Active
            </span>
            <span className="text-white/70 flex items-center gap-1 text-[11px]">
              <Globe className="w-3 h-3 text-[#FFCC00]" />
              Guests: View &amp; Ticket from Anywhere · Event Managers &amp; Vendors: Entebbe Only (0.0512° N, 32.4637° E)
            </span>
          </div>

          <button
            onClick={() => setIsOrganiserOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FFCC00] hover:underline cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {geoStatus.isVerifiedEntebbe
                ? `Provider GPS: ${geoStatus.detectedArea}`
                : 'Provider GPS: Outside Entebbe (Locked)'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {currentTab === 'discover' && (
          <div className="w-full px-4 py-4 pb-28 animate-fadeIn text-left">
            {/* Promoted Hero Banner (Featured Paid Slot) */}
            <HeroBanner
              event={promotedHero}
              onGetTickets={(evt) => setActiveModalEvent(evt)}
              onToggleSave={handleToggleSave}
              isSaved={savedEventIds.has(promotedHero.id)}
              onPlayVibe={(evt) => {
                setMusicInitialGenre(evt.category);
                setIsMusicOpen(true);
              }}
            />

            {/* Category Filter Pills */}
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* Netflix Horizontal Carousel: Happening this week */}
            <NetflixCarousel
              title="Happening this week in Entebbe"
              subtitle="Curated lakeshore picks for beach raves, jazz sundowners, and trivia across the Entebbe Peninsula"
              events={trendingEvents}
              onGetTickets={(evt) => setActiveModalEvent(evt)}
              onToggleSave={handleToggleSave}
              savedEventIds={savedEventIds}
              onSelectEvent={(evt) => setActiveModalEvent(evt)}
            />

            {/* Netflix Horizontal Carousel: Featured & Trending */}
            <NetflixCarousel
              title="Featured Lakeshore &amp; Beach Slots"
              subtitle="Top-rated venues in Kitoro, Bugonga, Waterfront, Botanical Beach, and Aero Beach"
              events={events.filter((e) => e.priceUGX >= 30000 || e.featured)}
              onGetTickets={(evt) => setActiveModalEvent(evt)}
              onToggleSave={handleToggleSave}
              savedEventIds={savedEventIds}
              onSelectEvent={(evt) => setActiveModalEvent(evt)}
            />

            {/* Entebbe Geo-Locked Event Services & Vendors Directory */}
            <EntebbeServicesSection
              services={services}
              onBookService={handleBookService}
              onOpenOrganiserPortal={() => setIsOrganiserOpen(true)}
            />

            {/* Vertical Proximity Feed */}
            <ProximityFeed
              events={filteredEvents}
              onGetTickets={(evt) => setActiveModalEvent(evt)}
              onToggleSave={handleToggleSave}
              savedEventIds={savedEventIds}
              onSelectEvent={(evt) => setActiveModalEvent(evt)}
              onOpenMap={() => setIsMapOpen(true)}
            />
          </div>
        )}

        {currentTab === 'search' && (
          <SearchScreen
            events={events}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentTab('discover');
            }}
            onGetTickets={(evt) => setActiveModalEvent(evt)}
            onSelectEvent={(evt) => setActiveModalEvent(evt)}
          />
        )}

        {currentTab === 'saved' && (
          <SavedScreen
            savedEvents={savedEventsList}
            onGetTickets={(evt) => setActiveModalEvent(evt)}
            onRemoveSaved={handleToggleSave}
            onSelectEvent={(evt) => setActiveModalEvent(evt)}
            onGoToDiscover={() => setCurrentTab('discover')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileWalletScreen
            user={user}
            tickets={tickets}
            transactions={transactions}
            onOpenTopUp={() => setIsTopUpOpen(true)}
            onOpenWithdraw={() => {
              showToast('Withdrawal request initialized to your registered MTN/Airtel number.');
            }}
            onOpenQRScanner={() => setIsQRScannerOpen(true)}
            onViewTicketPass={(tkt) => setSelectedTicketPass(tkt)}
            onToggleOrganiserMode={handleToggleOrganiserMode}
            onOpenOrganiserDashboard={() => setIsOrganiserOpen(true)}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
            isSigningIn={isSigningIn}
          />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={(t) => setCurrentTab(t)}
        savedCount={savedEventIds.size}
        walletBalance={user?.walletBalance ?? 150000}
      />

      {/* Interactive Modals */}
      {/* 1. Ticket Checkout & Purchase Modal */}
      {activeModalEvent && (
        <TicketPurchaseModal
          event={activeModalEvent}
          user={user}
          onClose={() => setActiveModalEvent(null)}
          onSuccess={handlePurchaseSuccess}
          onOpenTopUp={() => setIsTopUpOpen(true)}
          onJoinWaitlist={handleJoinWaitlist}
          onSimulateTicketRelease={handleSimulateTicketRelease}
        />
      )}

      {/* 2. Kesho Wallet Top-Up Modal (MTN MoMo / Airtel Money / Card) */}
      {isTopUpOpen && (
        <TopUpModal
          onClose={() => setIsTopUpOpen(false)}
          onSuccess={handleTopUpSuccess}
        />
      )}

      {/* 3. Interactive Entebbe Peninsula Map Modal */}
      {isMapOpen && (
        <EntebbeMapModal
          events={events}
          onClose={() => setIsMapOpen(false)}
          onSelectEvent={(evt) => {
            setIsMapOpen(false);
            setActiveModalEvent(evt);
          }}
          onGetTickets={(evt) => {
            setIsMapOpen(false);
            setActiveModalEvent(evt);
          }}
        />
      )}

      {/* 4. Kesho Entebbe Concierge AI Chatbot Modal */}
      {isChatOpen && (
        <KeshoChatbotModal onClose={() => setIsChatOpen(false)} />
      )}

      {/* 5. Music Vibe & Lyria Beats Generator Modal */}
      {isMusicOpen && (
        <MusicVibeModal
          onClose={() => setIsMusicOpen(false)}
          initialGenre={musicInitialGenre}
        />
      )}

      {/* 6. Digital Ticket Pass Fullscreen Modal */}
      {selectedTicketPass && (
        <DigitalTicketPassModal
          ticket={selectedTicketPass}
          onClose={() => setSelectedTicketPass(null)}
        />
      )}

      {/* 7. Entebbe Organiser Portal Modal (Geo-Locked for Service Providers) */}
      {isOrganiserOpen && (
        <OrganiserModal
          onClose={() => setIsOrganiserOpen(false)}
          onAddEvent={handleAddNewEvent}
          onAddService={handleAddNewService}
          totalTicketsSold={tickets.length}
          events={events}
          geoStatus={geoStatus}
          onUpdateGeoStatus={setGeoStatus}
        />
      )}

      {/* 8. Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
          showToast('All Entebbe notifications marked as read');
        }}
      />

      {/* 9. Camera QR Code Scanner Modal */}
      {isQRScannerOpen && (
        <QRScannerModal
          events={events}
          onClose={() => setIsQRScannerOpen(false)}
          onClaimInvitation={handleClaimInvitation}
          onVenueCheckIn={handleVenueCheckIn}
        />
      )}
    </div>
  );
}
