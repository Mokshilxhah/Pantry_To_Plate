import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Heart } from 'lucide-react';

const FOOD_EMOJIS = ['🍲', '🍛', '🥘', '🍜', '🫕', '🍝', '🥗', '🍢', '🍨', '🍿'];
const CAT_EMOJIS = {
  breakfast: '🍳',
  lunch: '🍛',
  dinner: '🍽️',
  desserts: '🍰',
  dessert: '🍰',
  salads: '🥗',
  salad: '🥗',
  drinks: '🍹',
  drink: '🍹',
  fastfood: '🍕',
  'fast food': '🍕',
  snack: '🥪'
};

export default function RecipeCard({ recipe, index, isSaved, onToggleSave }) {
  const isVeg = ['veg', 'vegan', 'jain'].includes(recipe.diet_type);
  const catKey = (recipe.category || '').toLowerCase();
  const emoji = CAT_EMOJIS[catKey] || FOOD_EMOJIS[index % FOOD_EMOJIS.length];
  const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4, scale: 1.03 }}
      className="glass-card rounded-2xl overflow-hidden group cursor-pointer flex flex-col h-full border border-white/10 hover:border-green-500/40 transition-all bg-white/5 relative"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(34,197,94,0.06), transparent 80%)' }} />

      {/* Thumbnail */}
      <div className="relative h-20 sm:h-24 overflow-hidden border-b border-white/5 bg-white/[0.02] flex items-center justify-center">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            onError={(e) => { 
              e.target.style.display = 'none'; 
              const sibling = e.target.nextSibling;
              if (sibling) sibling.style.display = 'block';
            }}
          />
        ) : null}
        <div className="text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform duration-300" style={{ display: recipe.image_url ? 'none' : 'block' }}>
          {emoji}
        </div>
        
        {/* Diet indicator dot */}
        <div className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full border border-[#0F0F14]/60 z-10 ${
          isVeg ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
        }`} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'} />

        {/* Favorite Heart Button */}
        {onToggleSave && (
          <button
            onClick={onToggleSave}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-white hover:scale-110 transition-all z-10"
          >
            <Heart className={`w-3.5 h-3.5 transition-all ${isSaved ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <h3 className="font-display font-bold text-xs text-white/90 group-hover:text-green-400 transition-colors leading-tight line-clamp-2 mb-1">
            {recipe.title}
          </h3>
          <div className="text-[10px] text-light-muted flex justify-between font-medium">
            <span>{recipe.cuisine || 'Universal'}</span>
            <span className="text-amber-400 font-bold">{recipe.calories || 300} kcal</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-light-muted font-semibold mt-auto pt-1 border-t border-white/[0.03]">
          <span className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5 text-green-400" /> {total}m
          </span>
          <span className="flex items-center gap-0.5 font-bold text-emerald-400">
            P: {recipe.protein || 10}g
          </span>
        </div>
      </div>
    </motion.div>
  );
}
