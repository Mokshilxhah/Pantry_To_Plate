import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import recipesService from '../../services/recipesService';
import { 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Loader2,
  BookOpen,
  ArrowRight,
  Clock,
  Tag,
  Sparkles,
  Download,
  Eye,
  Grid,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import useToastStore from '../../store/toastStore';

const SEED_TEMPLATES = [
  {
    title: 'Chole Bhature',
    ingredients: 'Chickpeas (1 cup), Flour/Maida (2 cups), Yogurt (1/2 cup), Onion (2 pcs), Tomato (2 pcs), Ginger-Garlic Paste (1 tbsp), Chana Masala (2 tsp), Oil (for deep frying)',
    steps: '1. Soak chickpeas overnight and boil with tea bag/spices until tender.\n2. Knead maida, yogurt, pinch of baking soda, and warm water into a soft dough. Rest for 2 hours.\n3. Sauté onions, ginger-garlic paste, and tomato puree with chana masala powder.\n4. Add boiled chickpeas and simmer until the gravy thickens.\n5. Roll out dough discs and deep fry in hot oil until puffed. Serve hot with chole.',
    tags: 'lunch, snack',
    diet_type: 'veg',
    source: 'template'
  },
  {
    title: 'Chicken Biryani',
    ingredients: 'Chicken (500g), Basmati Rice (2 cups), Yogurt (1 cup), Onion (3 large), Biryani Masala (2 tbsp), Saffron Milk (2 tbsp), Mint Leaves (1/2 cup), Ghee (3 tbsp)',
    steps: '1. Marinate chicken in yogurt, ginger-garlic paste, chili, turmeric, and biryani spices for 1 hour.\n2. Boil rice until 70% cooked; drain and set aside.\n3. Fry sliced onions until golden brown (birista).\n4. Cook chicken in a heavy bottom pot. Layer half-cooked rice over it.\n5. Sprinkle saffron milk, fried onions, mint, and ghee. Seal pot and cook on low heat (dum) for 20 minutes.',
    tags: 'dinner, lunch',
    diet_type: 'nonveg',
    source: 'template'
  },
  {
    title: 'Masala Dosa & Sambar',
    ingredients: 'Dosa Batter (4 cups), Potato (3 medium), Onion (1 large), Mustard Seeds (1 tsp), Turmeric (1/2 tsp), Split Toor Dal (1/2 cup), Sambar Powder (2 tsp), Tamarind Paste (1 tbsp)',
    steps: '1. Boil and mash potatoes. Sauté with mustard seeds, green chilis, onions, and turmeric to make potato masala.\n2. Cook toor dal with vegetables, tamarind paste, and sambar powder to make hot sambar.\n3. Pour a ladle of dosa batter on a hot tawa and spread in a thin circle.\n4. Drizzle ghee around the edges and cook until crispy and golden.\n5. Place potato masala in the center, fold, and serve hot with sambar and coconut chutney.',
    tags: 'breakfast, snack',
    diet_type: 'veg',
    source: 'template'
  },
  {
    title: 'Butter Chicken & Naan',
    ingredients: 'Chicken (500g), Yogurt (1/2 cup), Butter (3 tbsp), Tomato Puree (1 cup), Cream (1/4 cup), Kasuri Methi (1 tsp), Wheat Flour (2 cups), Yeast (1/2 tsp)',
    steps: '1. Knead flour, yeast, yogurt, and warm water. Rest for 1 hour to rise, then roll and bake naans on tawa.\n2. Grill marinated chicken pieces until cooked.\n3. Heat butter, add tomato puree, cashew paste, garam masala, and simmer into a rich gravy.\n4. Stir in cream, grilled chicken pieces, and kasuri methi; simmer for 5 minutes.\n5. Serve hot with butter naans.',
    tags: 'dinner',
    diet_type: 'nonveg',
    source: 'template'
  },
  {
    title: 'Paneer Butter Masala & Roti',
    ingredients: 'Paneer (200g), Butter (2 tbsp), Tomato (3 medium), Cream (1 tbsp), Cashews (10 pcs), Garam Masala (1 tsp), Wheat Flour (1 cup)',
    steps: '1. Knead flour into dough and roll into rotis. Cook on tawa.\n2. Blend tomatoes and cashews into a smooth paste.\n3. Melt butter, sauté onion paste, and add cashew tomato puree with garam masala.\n4. Stir in fresh cream, paneer cubes, and simmer for 5 minutes.\n5. Garnish with coriander and serve hot with rotis.',
    tags: 'lunch, dinner',
    diet_type: 'veg',
    source: 'template'
  },
  {
    title: 'Pav Bhaji',
    ingredients: 'Potatoes (3 pcs), Cauliflower (1/2 cup), Green Peas (1/2 cup), Pav Bread (1 pack), Butter (4 tbsp), Pav Bhaji Masala (2 tbsp), Onion (1 large), Tomato (2 large)',
    steps: '1. Boil potatoes, cauliflower, and peas. Mash them completely.\n2. Sauté chopped onions and tomatoes with ginger-garlic paste and pav bhaji masala in butter.\n3. Add mashed vegetables and water. Simmer on low while mashing further.\n4. Slice pav buns, toast them generously on a tawa with butter and coriander.\n5. Serve hot bhaji topped with a dollop of butter, lemon juice, and chopped onions alongside the pav.',
    tags: 'snack, dinner',
    diet_type: 'veg',
    source: 'template'
  },
  {
    title: 'Poha',
    ingredients: 'Poha (2 cups), Onion (1 medium), Potato (1 small), Mustard Seeds (1 tsp), Curry Leaves (10 pcs), Green Chili (2 pcs), Peanuts (2 tbsp), Turmeric (1/2 tsp)',
    steps: '1. Wash and drain poha. Let it rest.\n2. Sauté mustard seeds, green chilis, peanuts, and onions.\n3. Add diced potato and cook until soft.\n4. Stir in turmeric, salt, and poha. Mix gently.\n5. Serve warm with coriander.',
    tags: 'breakfast, snack',
    diet_type: 'veg',
    source: 'template'
  },
  {
    title: 'Aloo Paratha & Curd',
    ingredients: 'Flour (1 cup), Potato (2 medium), Curd (1/2 cup), Butter (1 tbsp), Green Chili (1 pc), Coriander (1 tbsp)',
    steps: '1. Boil, mash, and spice potatoes.\n2. Roll out dough ball, stuff with potato mixture, and seal.\n3. Roll flat and cook on hot tawa with butter/ghee until golden.\n4. Serve hot with fresh curd.',
    tags: 'breakfast',
    diet_type: 'veg',
    source: 'template'
  },
  {
    title: 'Dal Chawal & Okra',
    ingredients: 'Rice (1 cup), Yellow Dal (1/2 cup), Okra (200g), Potato (1 medium), Tomato (1 medium), Spices (Cumin, Turmeric)',
    steps: '1. Cook rice. Boil dal in cooker with turmeric.\n2. Cook chopped okra and potato with spices until crispy.\n3. Temper dal with cumin, garlic, and dried chili.\n4. Serve hot tempered dal over rice with bhindi side.',
    tags: 'lunch, dinner',
    diet_type: 'veg',
    source: 'template'
  },
  {
    title: 'Fish Curry & Rice',
    ingredients: 'Fish Fillet (250g), Rice (1 cup), Tomato (1 medium), Onion (1 medium), Coconut Milk (1/2 cup), Fish Curry Powder (1 tbsp)',
    steps: '1. Wash and boil rice.\n2. Sauté onions and tomatoes, add fish curry powder and coconut milk; simmer.\n3. Add fish pieces and cook on low for 10 minutes.\n4. Serve curry over hot rice.',
    tags: 'lunch',
    diet_type: 'nonveg',
    source: 'template'
  }
];

const getTagsArray = (tagsVal) => {
  if (!tagsVal) return [];
  if (Array.isArray(tagsVal)) return tagsVal;
  if (typeof tagsVal === 'string') return tagsVal.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

const getIngredientsArray = (ingVal) => {
  if (!ingVal) return [];
  if (Array.isArray(ingVal)) {
    return ingVal.map(item => {
      if (typeof item === 'object' && item !== null) {
        const name = item.name || '';
        const qty = item.quantity || '';
        const unit = item.unit || '';
        return `${name} ${qty} ${unit}`.trim();
      }
      return String(item);
    });
  }
  if (typeof ingVal === 'string') {
    return ingVal.split(',').map(i => i.trim()).filter(Boolean);
  }
  return [];
};

const getStepsArray = (stepsVal) => {
  if (!stepsVal) return [];
  if (Array.isArray(stepsVal)) return stepsVal;
  if (typeof stepsVal === 'string') {
    return stepsVal.split('\n').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all'); // 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'
  const [gridView, setGridView] = useState(false); // Toggle grid view when "More..." clicked

  // Modals
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newSteps, setNewSteps] = useState('');
  const [newTags, setNewTags] = useState('breakfast');
  const [newSource, setNewSource] = useState('manual');
  const [newDietType, setNewDietType] = useState('veg');

  const { token } = useAuthStore();
  const toast = useToastStore.getState();

  const fetchRecipes = async () => {
    try {
      const data = await recipesService.getRecipes(token, {
        search: searchQuery,
        tag: selectedTag
      });
      setRecipes(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load recipe book.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecipes();
    }
  }, [token, searchQuery, selectedTag]);

  // Add custom recipe
  const handleAddRecipeSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIngredients.trim() || !newSteps.trim()) {
      toast.error('Please fill out Title, Ingredients, and Steps!');
      return;
    }

    try {
      const response = await recipesService.addRecipe(token, {
        title: newTitle,
        ingredients: newIngredients,
        steps: newSteps,
        tags: newTags,
        diet_type: newDietType,
        source: newSource
      });
      setRecipes(prev => [response, ...prev]);
      setShowAddModal(false);
      // Reset form
      setNewTitle('');
      setNewIngredients('');
      setNewSteps('');
      setNewTags('breakfast');
      setNewSource('manual');
      setNewDietType('veg');
    } catch (err) {
      console.error(err);
    }
  };

  // Delete recipe
  const handleDeleteRecipe = async (id, title) => {
    try {
      await recipesService.deleteRecipe(token, id, title);
      setRecipes(prev => prev.filter(r => r.id !== id));
      setSelectedRecipe(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Separation helper
  const getCommonRecipes = () => {
    // Templates or items flagged template/ai
    return recipes.filter(r => r.source === 'template' || r.source === 'ai');
  };

  const getNewRecipes = () => {
    // Custom manual ones or newly added
    return recipes.filter(r => r.source === 'manual');
  };

  if (loading) {
    return (
      <DashboardLayout title="Recipe Book" subtitle="Manage and discover culinary templates for your weekly meal logs">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 font-semibold">Opening recipe registry...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Recipe Book" subtitle="Manage and discover culinary templates for your weekly meal logs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Hero Card */}
        <div className="clean-card-dark rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 stripes-pattern opacity-5 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl">
              <BookOpen className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Kitchen Recipe Library</h2>
              <p className="text-stone-300 text-xs md:text-sm mt-1 font-medium">Manage your home recipes and custom food creations</p>
            </div>
          </div>
        </div>

        {/* HEADER CONTROLS (Form triggers and quick imports) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'breakfast', 'lunch', 'dinner', 'snack', 'veg', 'nonveg'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedTag === t 
                    ? t === 'veg' 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : t === 'nonveg'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                        : 'bg-orange-500 border-orange-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t === 'all' 
                  ? 'All Recipes' 
                  : t === 'veg' 
                    ? 'Veg Only' 
                    : t === 'nonveg' 
                      ? 'Non-Veg Only' 
                      : t.charAt(0).toUpperCase() + t.slice(1)
                }
              </button>
            ))}
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="py-2 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Recipe
            </button>
          </div>

        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipe name or ingredient..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 transition-all shadow-sm placeholder-slate-455"
          />
        </div>

        {/* FEED SECTION */}
        {recipes.length === 0 ? (
          <div className="premium-card-orange rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Your Recipe Book is Empty</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Create custom dishes manually or click &quot;Import Template&quot; above to seed standard pantry dishes.
            </p>
          </div>
        ) : gridView ? (
          
          /* OPTIONAL GRID VIEW Overlay (when "More..." clicked) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Catalog Recipes ({recipes.length})</h3>
              <button 
                onClick={() => setGridView(false)}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
              >
                Back to Carousel Rows
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recipes.map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-350 cursor-pointer flex flex-col h-60 group"
                >
                  {/* Recipe Image or fallback */}
                  <div className="h-32 w-full overflow-hidden relative bg-orange-50/50">
                    <img 
                      src={recipe.image_url || '/other_cat.png'} 
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <span className={`absolute top-2.5 left-2.5 text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${recipe.source === 'manual' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-white'}`}>
                      {recipe.source}
                    </span>
                    <span className={`absolute top-2.5 right-2.5 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      recipe.diet_type === 'nonveg' 
                        ? 'bg-rose-50 text-rose-650 border border-rose-200' 
                        : 'bg-green-50 text-green-750 border border-green-200'
                    }`}>
                      {recipe.diet_type === 'nonveg' ? 'Non-Veg' : 'Veg'}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-805 line-clamp-2 group-hover:text-orange-500 transition-colors">{recipe.title}</h4>
                    
                    <div className="text-[9px] text-slate-400 font-bold border-t border-slate-100/80 pt-2 flex items-center justify-between">
                      <span className="truncate max-w-[70%] text-slate-455">Tags: {getTagsArray(recipe.tags).join(', ')}</span>
                      <span className="text-orange-500 flex items-center gap-0.5 font-extrabold">Open <ChevronRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (
          
          /* CAROUSEL ROWS VIEW */
          <div className="space-y-8">
            
            {/* Carousel 1: New Recipes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Recipes</h3>
              
              <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-hide min-h-[140px] items-stretch">
                {getNewRecipes().map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-350 cursor-pointer w-60 flex flex-col h-56 shrink-0 group"
                  >
                    {/* Recipe Image or fallback */}
                    <div className="h-28 w-full overflow-hidden relative bg-orange-50/50">
                      <img 
                        src={recipe.image_url || '/other_cat.png'} 
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                      <span className={`absolute top-2 left-2 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${recipe.source === 'manual' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-white'}`}>
                        {recipe.source}
                      </span>
                      <span className={`absolute top-2 right-2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        recipe.diet_type === 'nonveg' 
                          ? 'bg-rose-50 text-rose-650 border border-rose-200' 
                          : 'bg-green-50 text-green-750 border border-green-200'
                      }`}>
                        {recipe.diet_type === 'nonveg' ? 'Non-Veg' : 'Veg'}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-850 line-clamp-2 group-hover:text-orange-500 transition-colors">{recipe.title}</h4>
                      <div className="text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-2 flex items-center justify-between animate-all">
                        <span className="truncate max-w-[80%] text-slate-455">Tags: {getTagsArray(recipe.tags).join(', ')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* More... card trigger at the end of New Recipes */}
                <div
                  onClick={() => setGridView(true)}
                  className="bg-slate-100/50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-3xl p-4 shadow-sm transition-all cursor-pointer w-44 flex flex-col items-center justify-center shrink-0 h-56 text-center select-none"
                >
                  <Grid className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-xs font-extrabold text-slate-700">More...</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Toggle Grid View</p>
                </div>
              </div>
            </div>

            {/* Carousel 2: Most Common Recipes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Common Recipes</h3>
              
              <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-hide min-h-[140px] items-stretch">
                {getCommonRecipes().length === 0 ? (
                  <div className="w-full text-center py-6 text-[11px] text-slate-400 italic">No template recipes imported yet.</div>
                ) : (
                  getCommonRecipes().map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-350 cursor-pointer w-60 flex flex-col h-56 shrink-0 group"
                    >
                      {/* Recipe Image or fallback */}
                      <div className="h-28 w-full overflow-hidden relative bg-orange-50/50">
                        <img 
                          src={recipe.image_url || '/other_cat.png'} 
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        <span className={`absolute top-2 left-2 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${recipe.source === 'manual' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-white'}`}>
                          {recipe.source}
                        </span>
                        <span className={`absolute top-2 right-2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          recipe.diet_type === 'nonveg' 
                            ? 'bg-rose-50 text-rose-650 border border-rose-200' 
                            : 'bg-green-50 text-green-750 border border-green-200'
                        }`}>
                          {recipe.diet_type === 'nonveg' ? 'Non-Veg' : 'Veg'}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-855 line-clamp-2 group-hover:text-orange-500 transition-colors">{recipe.title}</h4>
                        <div className="text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-2 flex items-center justify-between">
                          <span className="truncate max-w-[80%] text-slate-455">Tags: {getTagsArray(recipe.tags).join(', ')}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* VIEW RECIPE DETAILS MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider select-none ${selectedRecipe.source === 'manual' ? 'bg-orange-100 text-orange-850' : 'bg-orange-50 text-orange-600'}`}>
                  {selectedRecipe.source}
                </span>
                <span className={`text-[8px] font-extrabold px-2 py-0.5 ml-1.5 rounded-full uppercase tracking-wider select-none ${
                  selectedRecipe.diet_type === 'nonveg' 
                    ? 'bg-rose-50 text-rose-650 border border-rose-200' 
                    : 'bg-green-50 text-green-750 border border-green-200'
                }`}>
                  {selectedRecipe.diet_type === 'nonveg' ? 'Non-Veg' : 'Veg'}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">{selectedRecipe.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {getTagsArray(selectedRecipe.tags).map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-orange-50/60 border border-orange-100 text-orange-700 rounded-lg text-[9px] font-bold">
                    {tag.trim().toLowerCase()}
                  </span>
                ))}
              </div>

              {/* Ingredients list */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 select-none">Ingredients</h4>
                <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl">
                  <ul className="list-disc pl-4 space-y-1.5">
                    {getIngredientsArray(selectedRecipe.ingredients).map((ing, idx) => (
                      <li key={idx} className="text-xs text-slate-600 font-medium">{ing}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Steps instructions */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 select-none">Cooking Instructions</h4>
                <div className="space-y-2.5">
                  {getStepsArray(selectedRecipe.steps).map((step, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[9px] font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{step.replace(/^\d+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDeleteRecipe(selectedRecipe.id, selectedRecipe.title)}
                className="py-2 px-3.5 bg-white hover:bg-red-50 text-slate-450 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <Trash2 className="w-4 h-4" /> Delete Recipe
              </button>
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
              >
                Close details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD CUSTOM RECIPE MODAL FORM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-orange-500 animate-pulse" /> Create Custom Recipe
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddRecipeSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-4">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipe Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Paneer Butter Masala & Roti"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                {/* Ingredients */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingredients (Comma-Separated)</label>
                  <textarea
                    required
                    rows={3}
                    value={newIngredients}
                    onChange={(e) => setNewIngredients(e.target.value)}
                    placeholder="Paneer (200g), Butter (2 tbsp), Tomato (3 medium), Flour (1 cup)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner resize-none"
                  />
                </div>

                {/* Steps */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cooking Directions (One step per line)</label>
                  <textarea
                    required
                    rows={5}
                    value={newSteps}
                    onChange={(e) => setNewSteps(e.target.value)}
                    placeholder="1. Sauté onions and tomatoes in butter.&#10;2. Add paneer cubes.&#10;3. Cook on low heat."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner resize-none"
                  />
                </div>

                {/* Tag Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meal Category Tag</label>
                  <select
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner cursor-pointer"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {/* Diet Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dietary Class</label>
                  <select
                    value={newDietType}
                    onChange={(e) => setNewDietType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner cursor-pointer"
                  >
                    <option value="veg">Vegetarian (Veg)</option>
                    <option value="nonveg">Non-Vegetarian (Non-Veg)</option>
                  </select>
                </div>

                {/* Source Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipe Source</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner cursor-pointer"
                  >
                    <option value="manual">Manual Addition</option>
                    <option value="ai">AI Recommendation</option>
                  </select>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  Save Recipe
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
