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
type Tab = 'map' | 'inventory' | 'ai' | 'profile' | 'settings';

import { AISettings, DEFAULT_AI_SETTINGS, aiService } from './services/aiService';
import Markdown from 'react-markdown';

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

const SettingsView = ({ aiSettings, setAiSettings }: { aiSettings: AISettings, setAiSettings: (s: AISettings) => void }) => (
  <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
    <h2 className="text-2xl font-bold mb-6 text-android-on-surface">Settings</h2>
    
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
  LocateFixed,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  Volume2,
  Camera,
  X,
  Sparkles
} from 'lucide-react';

// ... (StatusBar and BottomNav remain same)

const AIView = ({ settings }: { settings: AISettings }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string, image?: string, video?: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (type: 'chat' | 'image' | 'video' = 'chat') => {
    if (!input.trim() && !selectedImage && !loading) return;
    
    const userMsg = input;
    const userImg = selectedImage;
    setInput('');
    setSelectedImage(null);
    setShowTools(false);
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg, image: userImg || undefined }]);
    setLoading(true);

    try {
      if (type === 'image') {
        const imgUrl = await aiService.generateImage(userMsg, "1K", "1:1", settings);
        setMessages(prev => [...prev, { role: 'assistant', text: 'Generated image:', image: imgUrl }]);
      } else if (type === 'video') {
        const videoUrl = await aiService.generateVideo(userMsg, settings);
        setMessages(prev => [...prev, { role: 'assistant', text: 'Generated video:', video: videoUrl }]);
      } else {
        let responseText = '';
        if (userImg) {
          responseText = await aiService.analyzeImage(userImg, userMsg || "What is in this image?", settings);
        } else {
          const response = await aiService.chat(userMsg, messages, settings);
          responseText = response.text || 'No response';
        }
        setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const playTTS = async (text: string) => {
    try {
      const base64 = await aiService.textToSpeech(text, settings);
      if (base64) {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.play();
      }
    } catch (err) {
      console.error("TTS failed", err);
    }
  };

  if (!settings.enabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-android-surface-variant flex items-center justify-center text-android-on-surface-variant mb-6">
          <Compass size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">Gemini Intelligence</h2>
        <p className="text-sm text-android-on-surface-variant mb-6">
          Enable AI features in settings to get help with geocaching, puzzles, and more.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-12 text-android-on-surface-variant">
            <Sparkles size={48} className="mx-auto mb-4 opacity-20 text-android-primary" />
            <p className="text-sm">How can I help you with your Wherigo adventure today?</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex flex-col max-w-[85%]",
            msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
          )}>
            <div className={cn(
              "p-3 rounded-2xl text-sm relative group",
              msg.role === 'user' 
                ? "bg-android-primary text-android-on-primary rounded-tr-none" 
                : "bg-android-surface-variant text-android-on-surface-variant rounded-tl-none"
            )}>
              {msg.image && (
                <img src={msg.image} alt="AI Content" className="w-full rounded-lg mb-2 android-shadow" />
              )}
              {msg.video && (
                <video src={msg.video} controls className="w-full rounded-lg mb-2 android-shadow" />
              )}
              <Markdown className="prose prose-sm prose-invert max-w-none">
                {msg.text}
              </Markdown>
              
              {msg.role === 'assistant' && settings.permissions.audioSpeech && (
                <button 
                  onClick={() => playTTS(msg.text)}
                  className="absolute -right-8 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-android-primary"
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-android-on-surface-variant">
            <div className="w-2 h-2 bg-android-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-android-primary rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-android-primary rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      <div className="p-4 bg-android-surface border-t border-android-outline/10">
        {selectedImage && (
          <div className="relative w-20 h-20 mb-4">
            <img src={selectedImage} className="w-full h-full object-cover rounded-xl border-2 border-android-primary" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {showTools && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-2 mb-4"
          >
            {settings.permissions.imageGen && (
              <button 
                onClick={() => handleSend('image')}
                className="flex flex-col items-center gap-1 p-3 bg-android-surface-variant/50 rounded-2xl"
              >
                <ImageIcon size={20} className="text-android-primary" />
                <span className="text-[10px] font-bold">Generate Image</span>
              </button>
            )}
            {settings.permissions.imageGen && ( // Using imageGen for video too
              <button 
                onClick={() => handleSend('video')}
                className="flex flex-col items-center gap-1 p-3 bg-android-surface-variant/50 rounded-2xl"
              >
                <VideoIcon size={20} className="text-android-primary" />
                <span className="text-[10px] font-bold">Generate Video</span>
              </button>
            )}
            {settings.permissions.imageAnalysis && (
              <label className="flex flex-col items-center gap-1 p-3 bg-android-surface-variant/50 rounded-2xl cursor-pointer">
                <Camera size={20} className="text-android-primary" />
                <span className="text-[10px] font-bold">Analyze Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </motion.div>
        )}

        <div className="flex gap-2 bg-android-surface-variant/50 rounded-full p-1 pl-4 items-center">
          <button 
            onClick={() => setShowTools(!showTools)}
            className={cn(
              "p-2 rounded-full transition-transform",
              showTools ? "rotate-45 text-red-500" : "text-android-primary"
            )}
          >
            <Plus size={20} />
          </button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Gemini..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
          />
          {settings.permissions.audioSpeech && (
            <button className="p-2 text-android-on-surface-variant hover:text-android-primary">
              <Mic size={20} />
            </button>
          )}
          <button 
            onClick={() => handleSend()}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-android-primary text-android-on-primary flex items-center justify-center disabled:opacity-50"
          >
            <Navigation size={18} className="rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [location, setLocation] = useState<Location | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('ai_settings');
    return saved ? JSON.parse(saved) : DEFAULT_AI_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

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
