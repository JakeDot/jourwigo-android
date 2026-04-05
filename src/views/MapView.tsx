import React from 'react';
import { Compass, LocateFixed, Plus, Navigation, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Location } from '../types';
import { cn } from '../lib/utils';

export const MapView = ({ location, isOfflineMode, onToggleOffline }: { location: Location | null, isOfflineMode: boolean, onToggleOffline: () => void }) => {
  return (
    <div className="relative flex-1 bg-[#e5e7eb] dark:bg-[#1a1a1a] overflow-hidden flex flex-col items-center justify-center">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
      >
        <TransformComponent wrapperClass="!w-full !h-full absolute inset-0" contentClass="w-[200vw] h-[200vh] flex items-center justify-center relative">
          {/* Mock Map Background */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="w-full h-full bg-grid-pattern" />
          </div>

          <AnimatePresence mode="wait">
            {location ? (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10"
              >
                <div className="w-8 h-8 bg-android-primary rounded-full border-4 border-android-surface android-shadow animate-pulse" />
                <div className="absolute -inset-4 bg-android-primary/20 rounded-full animate-ping" />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-android-on-surface-variant z-10">
                <Compass size={48} className="animate-spin-slow" />
                <p className="text-sm font-medium">{isOfflineMode ? 'GPS Offline' : 'Waiting for GPS...'}</p>
              </div>
            )}
          </AnimatePresence>
        </TransformComponent>
      </TransformWrapper>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-20">
        <button 
          onClick={onToggleOffline}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center android-shadow transition-colors",
            isOfflineMode 
              ? "bg-red-500/20 text-red-500" 
              : "bg-android-surface-variant text-android-on-surface-variant hover:bg-android-surface-variant/80"
          )}
        >
          {isOfflineMode ? <WifiOff size={24} /> : <Wifi size={24} />}
        </button>
        <button className="w-14 h-14 rounded-2xl bg-android-surface-variant text-android-on-surface-variant flex items-center justify-center android-shadow hover:bg-android-surface-variant/80 transition-colors">
          <LocateFixed size={24} />
        </button>
        <button className="w-14 h-14 rounded-2xl bg-android-primary text-android-on-primary flex items-center justify-center android-shadow-lg hover:brightness-110 transition-all">
          <Plus size={28} />
        </button>
      </div>

      {/* Info Card */}
      <div className="absolute top-6 left-6 right-6 z-20">
        <div className="bg-android-surface/90 backdrop-blur-md p-4 rounded-3xl android-shadow border border-android-outline/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-android-secondary-container flex items-center justify-center text-android-on-secondary-container">
              <Navigation size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-android-on-surface">
                {isOfflineMode ? 'Offline Mode' : (location ? 'Current Location' : 'Forest Adventure')}
              </h3>
              <p className="text-xs text-android-on-surface-variant">
                {isOfflineMode 
                  ? 'GPS tracking is paused'
                  : (location 
                    ? `Lat: ${location.lat.toFixed(4)} • Lng: ${location.lng.toFixed(4)}${location.altitude ? ` • Alt: ${Math.round(location.altitude)}m` : ''}`
                    : 'Distance: 120m • Zone: Entrance')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
