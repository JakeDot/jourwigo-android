import React from 'react';
import { motion } from 'motion/react';

export const InventoryView = () => (
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
