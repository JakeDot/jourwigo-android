import React, { useState } from 'react';
import { Navigation, Compass, Image as ImageIcon, Video as VideoIcon, Mic, Volume2, Camera, X, Sparkles, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { AISettings, aiService } from '../services/aiService';

export const AIView = ({ settings }: { settings: AISettings }) => {
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
