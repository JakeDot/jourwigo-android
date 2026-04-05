import React from 'react';
import { Bell, LocateFixed, Map as MapIcon, Info, Plus, Compass, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AISettings } from '../services/aiService';
import { useTheme } from '../contexts/ThemeContext';

export const SettingsView = ({ aiSettings, setAiSettings }: { aiSettings: AISettings, setAiSettings: (s: AISettings) => void }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold mb-6 text-android-on-surface">Settings</h2>
      
      <div className="mb-8">
        <div className="flex items-center justify-between p-4 bg-android-primary/5 rounded-3xl border border-android-primary/20 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-android-primary flex items-center justify-center text-android-on-primary">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold">High Contrast Theme</h3>
              <p className="text-[10px] text-android-on-surface-variant">Yellow on black accessibility</p>
            </div>
          </div>
          <button 
            onClick={() => setTheme(theme === 'high-contrast' ? 'default' : 'high-contrast')}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              theme === 'high-contrast' ? "bg-android-primary" : "bg-android-outline/30"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              theme === 'high-contrast' ? "left-7" : "left-1"
            )} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between p-4 bg-android-primary/5 rounded-3xl border border-android-primary/20 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-android-primary flex items-center justify-center text-android-on-primary">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Gemini Intelligence</h3>
              <p className="text-[10px] text-android-on-surface-variant">Opt-in for AI-powered features</p>
            </div>
          </div>
          <button 
            onClick={() => setAiSettings({ ...aiSettings, enabled: !aiSettings.enabled })}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              aiSettings.enabled ? "bg-android-primary" : "bg-android-outline/30"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              aiSettings.enabled ? "left-7" : "left-1"
            )} />
          </button>
        </div>

        {aiSettings.enabled && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pl-4 border-l-2 border-android-primary/20 ml-5"
          >
            <h4 className="text-[10px] font-bold text-android-primary uppercase tracking-wider">Granular Permissions</h4>
            {[
              { id: 'chat', label: 'Conversational Assistant', desc: 'Multi-turn chat and help' },
              { id: 'imageGen', label: 'Image Generation', desc: 'Create visuals from text' },
              { id: 'mapsGrounding', label: 'Maps Grounding', desc: 'Use location for accuracy' },
              { id: 'imageAnalysis', label: 'Image Understanding', desc: 'Analyze photos you upload' },
              { id: 'audioSpeech', label: 'Voice & Speech', desc: 'TTS and transcription' },
              { id: 'highThinking', label: 'High Thinking Mode', desc: 'Complex reasoning (Pro model)' },
            ].map((perm) => (
              <div key={perm.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-medium">{perm.label}</p>
                  <p className="text-[9px] text-android-on-surface-variant">{perm.desc}</p>
                </div>
                <button 
                  onClick={() => setAiSettings({
                    ...aiSettings,
                    permissions: { ...aiSettings.permissions, [perm.id]: !((aiSettings.permissions as any)[perm.id]) }
                  })}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    (aiSettings.permissions as any)[perm.id] ? "bg-android-primary/60" : "bg-android-outline/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                    (aiSettings.permissions as any)[perm.id] ? "left-4.5" : "left-0.5"
                  )} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </div>

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
};
