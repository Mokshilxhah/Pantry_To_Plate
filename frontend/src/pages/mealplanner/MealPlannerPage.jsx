import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import mealPlanService from '../../services/mealPlanService';
import pantryService from '../../services/pantryService';
import chatService from '../../services/chatService';
import recipesService from '../../services/recipesService';
import { 
  Plus, 
  Trash2, 
  X, 
  Check,
  Loader2,
  Calendar,
  Layers,
  Sparkles,
  Coffee,
  Sun,
  Moon,
  Clock,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import useToastStore from '../../store/toastStore';

const RECIPE_BOOK = {
  'Poha': {
    prep: '10 min',
    ingredients: ['Poha', 'Onion', 'Potato'],
    steps: [
      'Wash and drain poha in a colander, letting it sit to soften.',
      'Sauté mustard seeds, green chiles, and onions in oil.',
      'Add finely diced potatoes, turmeric, and salt; cook until tender.',
      'Gently fold in the softened poha and mix well.',
      'Garnish with fresh coriander leaves, lemon juice, and roasted peanuts.'
    ]
  },
  'Oats with Fruits': {
    prep: '5 min',
    ingredients: ['Oats', 'Milk', 'Banana', 'Apple'],
    steps: [
      'Combine oats and milk in a saucepan and bring to a gentle boil.',
      'Cook for 3-4 minutes, stirring constantly until thick.',
      'Pour into a bowl and let cool slightly.',
      'Slice bananas and apples, and arrange them on top.',
      'Drizzle with honey or maple syrup and serve.'
    ]
  },
  'Aloo Paratha & Curd': {
    prep: '20 min',
    ingredients: ['Flour', 'Potato', 'Curd', 'Butter'],
    steps: [
      'Boil and mash potatoes, mixing with finely chopped onions, chilies, and paratha spices.',
      'Knead wheat flour with water into a soft pliable dough.',
      'Stuff a ball of spiced potato mixture inside a dough ball and seal.',
      'Roll out gently into a flat disc without tearing.',
      'Roast on a hot tawa with ghee/butter until golden brown spots appear on both sides. Serve hot with curd.'
    ]
  },
  'Bread Butter': {
    prep: '3 min',
    ingredients: ['Bread', 'Butter'],
    steps: [
      'Toast bread slices in a toaster or on a pan until golden and crispy.',
      'Spread a generous layer of butter on the hot slices instantly.',
      'Serve hot alongside warm morning tea or milk.'
    ]
  },
  'Dal Chawal & Aloo Bhindi': {
    prep: '30 min',
    ingredients: ['Rice', 'Dal', 'Potato', 'Tomato'],
    steps: [
      'Rinse and boil rice in water until soft; drain and cover.',
      'Boil yellow dal in a pressure cooker with turmeric, salt, and tomatoes.',
      'Sauté chopped potatoes and bhindi (okra) with dry spices until crispy.',
      'Temper dal with ghee, cumin seeds, garlic, and dry red chilies.',
      'Serve hot tempered dal over steaming rice with okra sabzi on the side.'
    ]
  },
  'Fish Curry & Rice': {
    prep: '35 min',
    ingredients: ['Fish', 'Rice', 'Tomato', 'Onion'],
    steps: [
      'Boil rice and keep warm.',
      'Sauté onions, ginger-garlic paste, and tomatoes in a pan with oil.',
      'Add red chili powder, turmeric, fish curry masala, and coconut milk; bring to a simmer.',
      'Gently place cleaned fish pieces into the simmering curry sauce.',
      'Cook on low heat for 8-10 minutes until fish is tender. Serve with rice.'
    ]
  },
  'Paneer Butter Masala & Roti': {
    prep: '25 min',
    ingredients: ['Paneer', 'Butter', 'Tomato', 'Flour'],
    steps: [
      'Mix flour and water to knead roti dough; roll out flat and cook on tawa.',
      'Puree tomatoes and blend with cashews into a smooth paste.',
      'Melt butter, sauté onions, and add the tomato cashew puree with garam masala and red chili.',
      'Add fresh cream, water, and paneer cubes; simmer on low for 5 minutes.',
      'Garnish with kasuri methi and serve warm with hot rotis.'
    ]
  }
};

const RECIPE_LIST = [
  { name: 'Poha', slots: ['breakfast'] },
  { name: 'Oats with Fruits', slots: ['breakfast'] },
  { name: 'Aloo Paratha & Curd', slots: ['breakfast'] },
  { name: 'Bread Butter', slots: ['breakfast', 'dinner'] },
  { name: 'Dal Chawal & Aloo Bhindi', slots: ['lunch', 'dinner'] },
  { name: 'Fish Curry & Rice', slots: ['lunch'] },
  { name: 'Paneer Butter Masala & Roti', slots: ['lunch', 'dinner'] }
];

export default function MealPlannerPage() {
  const [plans, setPlans] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [dbRecipes, setDbRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { token } = useAuthStore();
  const toast = useToastStore.getState();

  // Weekly calendar calculation (Monday to Sunday)
  const [weekDates, setWeekDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('breakfast'); // 'breakfast' | 'lunch' | 'dinner'

  // Modal dialog states
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);

  const calculateWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    
    const monday = new Date(today);
    monday.setDate(diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    setWeekDates(dates);
    
    // Default active date is today normalized to start of day
    const normalizedToday = new Date(today.setHours(0,0,0,0));
    setSelectedDate(normalizedToday.toISOString().split('T')[0]);
  };

  const loadData = async () => {
    try {
      const [plansData, pantryData, recipesData] = await Promise.all([
        mealPlanService.getWeeklyPlans(token),
        pantryService.getItems(token),
        recipesService.getRecipes(token)
      ]);
      setPlans(plansData);
      setPantryItems(pantryData);
      setDbRecipes(recipesData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load meal planning schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateWeek();
  }, []);

  useEffect(() => {
    if (token && selectedDate) {
      loadData();
    }
  }, [token, selectedDate]);

  // Bulk AI Week Menu Generation
  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const data = await mealPlanService.generateWeeklyPlans(token);
      setPlans(data);
      toast.success('AI Calendar Restructured!');
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Schedule a recipe manually
  const handleSelectRecipe = async (recipeName) => {
    try {
      const plan = await mealPlanService.planMeal(token, {
        date: selectedDate,
        mealType: selectedSlot,
        name: recipeName
      });
      // Update local state directly
      setPlans(prev => {
        const filtered = prev.filter(p => {
          const pDate = new Date(p.date).toISOString().split('T')[0];
          return !(pDate === selectedDate && p.mealType === selectedSlot);
        });
        return [...filtered, plan];
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Clear slot
  const handleClearSlot = async (id, slotLabel) => {
    try {
      await mealPlanService.clearPlan(token, id, slotLabel);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to retrieve meal plan for selectedDate and slot
  const getPlannedMeal = (slot) => {
    return plans.find(p => {
      const pDate = new Date(p.date).toISOString().split('T')[0];
      return pDate === selectedDate && p.mealType === slot;
    });
  };

  // Ingredients matching calculator
  const checkIngredients = (recipeName) => {
    const recipe = RECIPE_BOOK[recipeName];
    if (!recipe) return { inStock: [], missing: [] };

    const inStock = [];
    const missing = [];
    const stockedNames = new Set(pantryItems.filter(i => i.quantity > 0).map(i => i.name.toLowerCase()));

    recipe.ingredients.forEach(ing => {
      if (stockedNames.has(ing.toLowerCase())) {
        inStock.push(ing);
      } else {
        missing.push(ing);
      }
    });

    return { inStock, missing };
  };

  // Fetch recipe list for slot
  const getRecipesForSlot = (slot) => {
    return RECIPE_LIST.filter(r => r.slots.includes(slot));
  };

  // Format date readable
  const formatDay = (dateObj) => {
    return dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
  };
  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const plannedBreakfast = getPlannedMeal('breakfast');
  const plannedLunch = getPlannedMeal('lunch');
  const plannedDinner = getPlannedMeal('dinner');

  const activePlanned = getPlannedMeal(selectedSlot);
  const ingredientStatus = activePlanned ? checkIngredients(activePlanned.name) : { inStock: [], missing: [] };

  if (loading) {
    return (
      <DashboardLayout title="Meal Planner" subtitle="Personalized calorie schedules and nutrient targeting">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 font-semibold">Loading weekly calendars...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Meal Planner" subtitle="Simple weekly calendar of what's being cooked">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Hero Card */}
        <div className="clean-card-dark rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 stripes-pattern opacity-5 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Calendar className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Weekly Meal Planner</h2>
              <p className="text-stone-300 text-xs md:text-sm mt-1 font-medium">Schedule your family meals and check ingredient inventory</p>
            </div>
          </div>
        </div>

        {/* HORIZONTAL WEEKLY CALENDAR SELECTOR (Top Row) */}
        <div className="clean-card-base rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Weekly Schedule</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Select a day below to plan and view planned dishes</p>
            </div>

            <button 
              onClick={handleGenerateAI}
              disabled={generating}
              className="py-2.5 px-4.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-orange-300 disabled:to-amber-300 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-center"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Restructuring...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Generate AI Weekly Menu
                </>
              )}
            </button>
          </div>

          {/* Horizontally scrolling weekly date slider */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {weekDates.map(dateObj => {
              const dateStr = dateObj.toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-1 min-w-[85px] sm:min-w-[100px] p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none flex flex-col justify-center h-20 ${isSelected ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 border-slate-200/50 text-slate-650'}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">{formatDay(dateObj)}</span>
                  <span className="text-xs font-extrabold mt-1">{formatDate(dateObj)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-COLUMN BOTTOM LAYOUT: Slots/Picker on Left; Details Panel on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: 3 Slots (Breakfast, Lunch, Dinner) & Recipe Library */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Scheduled slots */}
            <div className="clean-card-base rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100/80 pb-2">
                Scheduled Slots
              </h3>

              <div className="space-y-4">
                
                {/* Slot 1: Breakfast */}
                <div 
                  onClick={() => setSelectedSlot('breakfast')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${selectedSlot === 'breakfast' ? 'border-orange-500 bg-orange-50/5 ring-1 ring-orange-100' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Breakfast</span>
                        {plannedBreakfast ? (
                          <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">{plannedBreakfast.name}</h4>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-0.5">Empty slot. Select below or AI auto-generate.</p>
                        )}
                      </div>
                    </div>
                    {plannedBreakfast && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleClearSlot(plannedBreakfast.id, 'Breakfast'); }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="Clear slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slot 2: Lunch */}
                <div 
                  onClick={() => setSelectedSlot('lunch')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${selectedSlot === 'lunch' ? 'border-orange-500 bg-orange-50/5 ring-1 ring-orange-100' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lunch</span>
                        {plannedLunch ? (
                          <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">{plannedLunch.name}</h4>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-0.5">Empty slot. Select below or AI auto-generate.</p>
                        )}
                      </div>
                    </div>
                    {plannedLunch && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleClearSlot(plannedLunch.id, 'Lunch'); }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="Clear slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slot 3: Dinner */}
                <div 
                  onClick={() => setSelectedSlot('dinner')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${selectedSlot === 'dinner' ? 'border-orange-500 bg-orange-50/5 ring-1 ring-orange-100' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dinner</span>
                        {plannedDinner ? (
                          <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">{plannedDinner.name}</h4>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-0.5">Empty slot. Select below or AI auto-generate.</p>
                        )}
                      </div>
                    </div>
                    {plannedDinner && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleClearSlot(plannedDinner.id, 'Dinner'); }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="Clear slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Recipe book library selector */}
            <div className="clean-card-base rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 border-b border-slate-100 pb-2">
                Recipe Book ({selectedSlot.charAt(0).toUpperCase() + selectedSlot.slice(1)})
              </h3>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {getRecipesForSlot(selectedSlot).map(recipe => (
                  <div 
                    key={recipe.name} 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100/80 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{recipe.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5 flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-slate-300" /> Prep: {RECIPE_BOOK[recipe.name]?.prep || '15 min'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleSelectRecipe(recipe.name)}
                      className="py-1.5 px-3 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-[10px] font-bold text-slate-700 hover:text-orange-600 rounded-lg flex items-center gap-0.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Select
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Active Slot Details (Recipe, Prep, Stock Match, View, Poll) */}
          <div className="lg:col-span-6">
            <div className="clean-card-base rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between min-h-[350px]">
              
              {!activePlanned ? (
                <div className="premium-card-orange rounded-2xl p-8 text-center flex-1 flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No meal planned</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                    No recipe has been scheduled for {selectedSlot} on this day. Select one from the recipe library or auto-generate!
                  </p>
                </div>
              ) : (
                <div className="space-y-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <span className="text-[9px] bg-orange-50 text-orange-600 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                          Planned Dish
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-800 mt-1.5">{activePlanned.name}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5 mt-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-300" /> Prep: {RECIPE_BOOK[activePlanned.name]?.prep}
                      </span>
                    </div>

                    {/* Stock items comparison */}
                    <div className="space-y-4">
                      {/* In Stock */}
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ingredients In Stock</h5>
                        {ingredientStatus.inStock.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">None of the ingredients are currently in your pantry.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {ingredientStatus.inStock.map(ing => (
                              <span key={ing} className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> {ing}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Missing */}
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ingredients Needed</h5>
                        {ingredientStatus.missing.length === 0 ? (
                          <p className="text-[10px] text-green-650 font-bold flex items-center gap-0.5">
                            <CheckCircle className="w-3.5 h-3.5" /> All ingredients in stock! Ready to cook.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {ingredientStatus.missing.map(ing => (
                              <span key={ing} className="px-2.5 py-1 bg-red-50 text-red-650 border border-red-100 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                <X className="w-2.5 h-2.5" /> {ing}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3.5 pt-4 border-t border-slate-100/50">
                    <button 
                      onClick={() => setShowRecipeModal(true)}
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm hover:shadow"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" /> View Recipe
                    </button>
                    <button 
                      onClick={() => setShowPollModal(true)}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm hover:shadow"
                    >
                      <HelpCircle className="w-4 h-4 text-white" /> Create Poll
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* VIEW RECIPE COOKING INSTRUCTIONS MODAL */}
      {showRecipeModal && activePlanned && (() => {
        const details = (() => {
          // 1. Check in hardcoded RECIPE_BOOK
          if (RECIPE_BOOK[activePlanned.name]) {
            return {
              prep: RECIPE_BOOK[activePlanned.name].prep,
              ingredients: RECIPE_BOOK[activePlanned.name].ingredients,
              steps: RECIPE_BOOK[activePlanned.name].steps
            };
          }
          
          // 2. Check in dbRecipes list (look up by name case insensitively)
          const dbMatch = dbRecipes.find(r => r.title.toLowerCase().trim() === activePlanned.name.toLowerCase().trim());
          if (dbMatch) {
            return {
              prep: `${dbMatch.prep_time + dbMatch.cook_time} min`,
              ingredients: dbMatch.ingredients ? dbMatch.ingredients.map(i => typeof i === 'string' ? i : `${i.quantity || ''} ${i.unit || ''} ${i.name || ''}`.trim()) : (activePlanned.ingredients || []),
              steps: dbMatch.steps || []
            };
          }
          
          // 3. Fallback to generating steps from ingredients list
          const ings = activePlanned.ingredients || [];
          const step1 = ings.length > 0
            ? `Gather and prepare the main ingredients: ${ings.slice(0, 3).map(i => typeof i === 'string' ? i : i.name).join(', ')}${ings.length > 3 ? ', and others' : ''}.`
            : "Gather base ingredients, pantry items, and fresh produce.";
          const step2 = `Heat your cooking pan or pot. Lightly sauté any aromatic bases, spices, or vegetables.`;
          const step3 = `Add the remaining ingredients and simmer/cook under medium heat for approximately ${activePlanned.time_required || 15} minutes until thoroughly cooked.`;
          const step4 = `Taste, adjust seasonings as required, garnish with fresh herbs, and serve warm!`;
          
          return {
            prep: activePlanned.time_required ? `${activePlanned.time_required} min` : '15 min',
            ingredients: ings.map(i => typeof i === 'string' ? i : i.name),
            steps: [step1, step2, step3, step4]
          };
        })();

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div 
              className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div>
                  <span className="text-[9px] bg-orange-50 text-orange-600 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Cooking Guide
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 mt-1 flex items-center gap-1">
                    <BookOpen className="w-4.5 h-4.5 text-orange-500" /> {activePlanned.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowRecipeModal(false)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Steps Container */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-550 font-bold">
                    <Clock className="w-4 h-4 text-slate-400" /> Total Prep & Cook: {details.prep}
                  </div>
                  {activePlanned.calories && (
                    <div className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                      🔥 {activePlanned.calories} kcal
                    </div>
                  )}
                </div>

                {/* Ingredients section */}
                {details.ingredients && details.ingredients.length > 0 && (
                  <div className="space-y-2 p-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ingredients List:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {details.ingredients.map((ing, i) => (
                        <span key={i} className="text-[10px] bg-white text-slate-700 px-2.5 py-1 rounded-xl font-semibold border border-slate-200/60 shadow-sm">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps section */}
                <div className="space-y-3.5 pt-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Preparation Steps:</h4>
                  {details.steps && details.steps.length > 0 ? (
                    details.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3.5 bg-slate-50/30 border border-slate-100/60 rounded-2xl">
                        <span className="w-5.5 h-5.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-650 leading-relaxed pt-0.5 font-medium">{step}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No instructions available for this recipe.</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowRecipeModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  Close Steps
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* CREATE MEAL POLL SIMULATION MODAL */}
      {showPollModal && activePlanned && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-3xl w-full max-w-sm flex flex-col shadow-xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4.5 h-4.5 text-orange-500 animate-pulse" /> Create Family Vote?
              </h3>
              <button 
                onClick={() => setShowPollModal(false)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                This will post a dinner/lunch recommendation poll inside your family workspace chat:
              </p>
              <div className="p-3.5 bg-slate-50 border border-slate-100/80 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-700">Family Poll Option:</p>
                <div className="p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-bold shadow-sm">
                  Should we cook &quot;{activePlanned.name}&quot; for {selectedSlot}?
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button 
                onClick={() => setShowPollModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    await chatService.sendMessage(token, {
                      message_type: 'poll',
                      poll_question: `Should we cook "${activePlanned.name}" for ${selectedSlot}?`,
                      poll_options: [
                        "Yes, let's cook this!",
                        "No, let's pick something else"
                      ],
                      text: `Should we cook "${activePlanned.name}" for ${selectedSlot}?`
                    });
                    toast.success(`Sent poll for ${activePlanned.name} to family chat!`);
                  } catch (err) {
                    console.error(err);
                  }
                  setShowPollModal(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
              >
                Post Poll
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

