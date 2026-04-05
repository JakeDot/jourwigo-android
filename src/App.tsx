import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  Package, 
  User, 
  Settings, 
  Navigation, 
  Compass, 
  Info,
  Menu,
  Bell,
  Search,
  Plus,
  LocateFixed
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---
type Tab = 'map' | 'inventory' | 'profile' | 'settings';

interface Location {
  lat: number;
  lng: number;
  accuracy: number | null;
}

// --- Components ---

const StatusBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-8 px-4 flex items-center justify-between text-[12px] font-medium text-android-on-surface/80 bg-android-surface sticky top-0 z-50">
      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <div className="flex items-center gap-2">
        <Bell size={14} />
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-android-primary" />
          <span>LTE</span>
        </div>
      </div>
    </div>
  );
};

const BottomNav = ({ activeTab, onTabChange }: { activeTab: Tab, onTabChange: (tab: Tab) => void }) => {
  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'map', icon: MapIcon, label: 'Map' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="h-20 bg-android-surface-variant/30 border-t border-android-outline/10 flex items-center justify-around px-2 pb-safe sticky bottom-0 z-50">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center gap-1 w-16 group relative"
          >
            <div className={cn(
              "p-1.5 rounded-full transition-all duration-300",
              isActive ? "bg-android-primary-container text-android-on-primary-container" : "text-android-on-surface-variant hover:bg-android-on-surface-variant/10"
            )}>
              <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[11px] font-medium transition-colors",
              isActive ? "text-android-on-surface" : "text-android-on-surface-variant"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

const MapView = ({ location }: { location: Location | null }) => {
  return (
    <div className="relative flex-1 bg-[#e5e7eb] overflow-hidden flex flex-col items-center justify-center">
      {/* Mock Map Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} />
      </div>

      <AnimatePresence mode="wait">
        {location ? (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-8 h-8 bg-android-primary rounded-full border-4 border-white android-shadow animate-pulse" />
            <div className="absolute -inset-4 bg-android-primary/20 rounded-full animate-ping" />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-android-on-surface-variant">
            <Compass size={48} className="animate-spin-slow" />
            <p className="text-sm font-medium">Waiting for GPS...</p>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-4">
        <button className="w-14 h-14 rounded-2xl bg-android-surface-variant text-android-on-surface-variant flex items-center justify-center android-shadow hover:bg-android-surface-variant/80 transition-colors">
          <LocateFixed size={24} />
        </button>
        <button className="w-14 h-14 rounded-2xl bg-android-primary text-android-on-primary flex items-center justify-center android-shadow-lg hover:brightness-110 transition-all">
          <Plus size={28} />
        </button>
      </div>

      {/* Info Card */}
      <div className="absolute top-6 left-6 right-6">
        <div className="bg-android-surface/90 backdrop-blur-md p-4 rounded-3xl android-shadow border border-android-outline/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-android-secondary-container flex items-center justify-center text-android-on-secondary-container">
              <Navigation size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-android-on-surface">Forest Adventure</h3>
              <p className="text-xs text-android-on-surface-variant">Distance: 120m • Zone: Entrance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryView = () => (
  <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
    <h2 className="text-2xl font-bold mb-6 text-android-on-surface">Inventory</h2>
    <div className="grid grid-cols-2 gap-4">
      {[
        { name: 'Rusty Key', icon: '🔑', desc: 'Found near the old oak.' },
        { name: 'Compass', icon: '🧭', desc: 'Always points North.' },
        { name: 'Map Fragment', icon: '📜', desc: 'Part of a larger map.' },
        { name: 'Flashlight', icon: '🔦', desc: 'Needs batteries.' },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-android-surface-variant/50 p-4 rounded-3xl border border-android-outline/10 flex flex-col gap-2"
        >
          <span className="text-3xl">{item.icon}</span>
          <h4 className="font-bold text-sm">{item.name}</h4>
          <p className="text-[10px] text-android-on-surface-variant leading-tight">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const ProfileView = () => (
  <div className="flex-1 p-6 flex flex-col items-center text-center">
    <div className="w-24 h-24 rounded-full bg-android-primary-container flex items-center justify-center text-android-on-primary-container mb-4">
      <User size={48} />
    </div>
    <h2 className="text-2xl font-bold text-android-on-surface">Explorer Jakob</h2>
    <p className="text-android-on-surface-variant mb-8">Level 12 Wherigo Master</p>
    
    <div className="w-full space-y-4">
      <div className="bg-android-surface-variant/30 p-4 rounded-3xl flex justify-between items-center">
        <span className="text-sm font-medium">Caches Found</span>
        <span className="font-bold">142</span>
      </div>
      <div className="bg-android-surface-variant/30 p-4 rounded-3xl flex justify-between items-center">
        <span className="text-sm font-medium">Distance Walked</span>
        <span className="font-bold">42.5 km</span>
      </div>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
    <h2 className="text-2xl font-bold mb-6 text-android-on-surface">Settings</h2>
    <div className="space-y-2">
      {[
        { label: 'Dark Mode', icon: Bell },
        { label: 'GPS High Accuracy', icon: LocateFixed },
        { label: 'Offline Maps', icon: MapIcon },
        { label: 'Notifications', icon: Bell },
        { label: 'Install App (Wrapper)', icon: Plus, onClick: () => {
          alert("To use this as an Android app: \n1. Tap the three dots in Chrome\n2. Select 'Install app' or 'Add to Home screen'");
        }},
        { label: 'About Jourwigo', icon: Info },
      ].map((item, i) => (
        <button 
          key={i} 
          onClick={item.onClick}
          className="w-full p-4 flex items-center gap-4 hover:bg-android-on-surface-variant/5 rounded-2xl transition-colors text-left"
        >
          <item.icon size={20} className="text-android-primary" />
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-android-surface shadow-2xl overflow-hidden relative">
      <StatusBar />
      
      <header className="h-16 px-4 flex items-center justify-between bg-android-surface z-40">
        <button className="p-2 rounded-full hover:bg-android-on-surface-variant/10">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-android-primary">Jourwigo</h1>
        <button className="p-2 rounded-full hover:bg-android-on-surface-variant/10">
          <Search size={24} />
        </button>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {activeTab === 'map' && <MapView location={location} />}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Android Navigation Bar (Visual Only) */}
      <div className="h-12 bg-android-surface flex items-center justify-around px-12 opacity-40 pointer-events-none">
        <div className="w-4 h-4 border-2 border-android-on-surface rounded-sm rotate-45" />
        <div className="w-5 h-5 border-2 border-android-on-surface rounded-full" />
        <div className="w-4 h-4 border-2 border-android-on-surface rounded-sm" />
      </div>
    </div>
  );
}
