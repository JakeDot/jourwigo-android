import React from 'react';
import { User } from 'lucide-react';

export const ProfileView = () => (
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
