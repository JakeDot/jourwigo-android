import React, { useState, useEffect } from 'react';
import { Bell, Map as MapIcon, Package, User, Settings, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { Tab } from '../types';

export const StatusBar = () => {
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

export const BottomNav = ({ activeTab, onTabChange }: { activeTab: Tab, onTabChange: (tab: Tab) => void }) => {
  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'map', icon: MapIcon, label: 'Map' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'ai', icon: Compass, label: 'AI' },
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
