import React, { useState, useEffect } from 'react';
import { Menu, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Tab, Location } from './types';
import { AISettings, DEFAULT_AI_SETTINGS } from './services/aiService';
import { ThemeProvider } from './contexts/ThemeContext';

import { StatusBar, BottomNav } from './components/Navigation';
import { MapView } from './views/MapView';
import { InventoryView } from './views/InventoryView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { AIView } from './views/AIView';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [location, setLocation] = useState<Location | null>({
    lat: 0,
    lng: 0,
    altitude: 0,
    accuracy: 1000000
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('ai_settings');
    return saved ? JSON.parse(saved) : DEFAULT_AI_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  useEffect(() => {
    if (isOfflineMode) return;

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isOfflineMode]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-android-surface shadow-2xl overflow-hidden relative">
      <StatusBar />
      
      <header className="h-16 px-4 flex items-center justify-between bg-android-surface z-40 border-b border-android-outline/10">
        <button className="p-2 rounded-full hover:bg-android-on-surface-variant/10">
          <Menu size={24} className="text-android-on-surface" />
        </button>
        <h1 className="text-lg font-bold text-android-primary">Jourwigo</h1>
        <button className="p-2 rounded-full hover:bg-android-on-surface-variant/10">
          <Search size={24} className="text-android-on-surface" />
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
            {activeTab === 'map' && <MapView location={location} isOfflineMode={isOfflineMode} onToggleOffline={() => setIsOfflineMode(!isOfflineMode)} />}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'ai' && <AIView settings={aiSettings} />}
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'settings' && <SettingsView aiSettings={aiSettings} setAiSettings={setAiSettings} />}
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
