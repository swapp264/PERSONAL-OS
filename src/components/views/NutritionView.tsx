import React, { useState, useMemo } from 'react';
import {
  Salad,
  Droplet,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Target,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { FoodEntry, MealCategory } from '../../types/index.ts';
import {
  getTodayDateString,
  formatDateDisplay,
  addDays,
} from '../../utils/dateUtils.ts';
import { VEGETARIAN_FOOD_DATABASE } from '../../db/index.ts';

export const NutritionView: React.FC = () => {
  const {
    foodEntries,
    addFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    waterEntries,
    addWaterEntry,
    userSettings,
    updateUserSettings,
  } = useApp();

  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Modal / Form state
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [mealCategory, setMealCategory] = useState<MealCategory>('lunch');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('serving');
  const [calories, setCalories] = useState('200');
  const [protein, setProtein] = useState('15');
  const [carbs, setCarbs] = useState('25');
  const [fat, setFat] = useState('5');
  const [notes, setNotes] = useState('');

  // Target editor state
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [targetCalories, setTargetCalories] = useState(String(userSettings?.nutritionTargets.dailyCalories || 2400));
  const [targetProtein, setTargetProtein] = useState(String(userSettings?.nutritionTargets.dailyProtein || 130));
  const [targetCarbs, setTargetCarbs] = useState(String(userSettings?.nutritionTargets.dailyCarbs || 280));
  const [targetFat, setTargetFat] = useState(String(userSettings?.nutritionTargets.dailyFat || 65));
  const [targetWater, setTargetWater] = useState(String(userSettings?.nutritionTargets.dailyWaterMl || 3500));

  // Current day foods
  const dayFoods = useMemo(() => {
    return foodEntries.filter((f) => f.date === selectedDate);
  }, [foodEntries, selectedDate]);

  // Current day water
  const dayWaterTotal = useMemo(() => {
    return waterEntries.filter((w) => w.date === selectedDate).reduce((sum, w) => sum + w.amountMl, 0);
  }, [waterEntries, selectedDate]);

  // Aggregated totals
  const dailyTotals = useMemo(() => {
    return dayFoods.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [dayFoods]);

  const targets = userSettings?.nutritionTargets || {
    dailyCalories: 2400,
    dailyProtein: 130,
    dailyCarbs: 280,
    dailyFat: 65,
    dailyWaterMl: 3500,
  };

  const handleOpenAdd = (category: MealCategory = 'lunch') => {
    setIsAddingFood(true);
    setEditingFoodId(null);
    setFoodName('');
    setMealCategory(category);
    setQuantity('1');
    setUnit('serving');
    setCalories('200');
    setProtein('15');
    setCarbs('25');
    setFat('5');
    setNotes('');
  };

  const handleEditFood = (food: FoodEntry) => {
    setIsAddingFood(true);
    setEditingFoodId(food.id);
    setFoodName(food.name);
    setMealCategory(food.mealCategory);
    setQuantity(String(food.quantity));
    setUnit(food.unit);
    setCalories(String(food.calories));
    setProtein(String(food.protein));
    setCarbs(String(food.carbs));
    setFat(String(food.fat));
    setNotes(food.notes || '');
  };

  const handleDuplicateFood = async (food: FoodEntry) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await addFoodEntry({
      date: selectedDate,
      time,
      name: food.name,
      mealCategory: food.mealCategory,
      quantity: food.quantity,
      unit: food.unit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      notes: food.notes,
    });
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (editingFoodId) {
      await updateFoodEntry(editingFoodId, {
        name: foodName.trim(),
        mealCategory,
        quantity: parseFloat(quantity) || 1,
        unit,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        notes: notes.trim() || undefined,
      });
    } else {
      await addFoodEntry({
        date: selectedDate,
        time,
        name: foodName.trim(),
        mealCategory,
        quantity: parseFloat(quantity) || 1,
        unit,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        notes: notes.trim() || undefined,
      });
    }
    setIsAddingFood(false);
  };

  const handleApplyPreset = (item: (typeof VEGETARIAN_FOOD_DATABASE)[0]) => {
    setFoodName(item.name);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setCalories(String(item.calories));
    setProtein(String(item.protein));
    setCarbs(String(item.carbs));
    setFat(String(item.fat));
  };

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserSettings({
      nutritionTargets: {
        dailyCalories: parseInt(targetCalories) || 2400,
        dailyProtein: parseInt(targetProtein) || 130,
        dailyCarbs: parseInt(targetCarbs) || 280,
        dailyFat: parseInt(targetFat) || 65,
        dailyWaterMl: parseInt(targetWater) || 3500,
      },
    });
    setIsEditingTargets(false);
  };

  const mealCategoriesList: { id: MealCategory; label: string }[] = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'snacks', label: 'Evening Snacks' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Date Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="text-xs text-neutral-400">Everyday Food Diary</div>
            <h2 className="text-lg font-bold text-neutral-100">
              {formatDateDisplay(selectedDate, { includeWeekday: true })}
            </h2>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="ml-2 text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingTargets(true)}
            className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md flex items-center gap-1.5"
          >
            <Target size={13} />
            <span>Edit Daily Targets</span>
          </button>

          <button
            onClick={() => handleOpenAdd('lunch')}
            className="px-3.5 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-950 hover:bg-white rounded-md flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={13} />
            <span>Log Food Item</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Bars */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Calories */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Calories</span>
            <span className="font-mono tabular-nums">{Math.round(dailyTotals.calories)} / {targets.dailyCalories}</span>
          </div>
          <div className="text-lg font-bold font-mono text-neutral-100 tabular-nums">
            {Math.round(dailyTotals.calories)} <span className="text-xs font-normal text-neutral-400">kcal</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (dailyTotals.calories / targets.dailyCalories) * 100)}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Protein</span>
            <span className="font-mono tabular-nums">{Math.round(dailyTotals.protein)} / {targets.dailyProtein}g</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
            {Math.round(dailyTotals.protein)} <span className="text-xs font-normal text-neutral-400">g</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, (dailyTotals.protein / targets.dailyProtein) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Carbohydrates</span>
            <span className="font-mono tabular-nums">{Math.round(dailyTotals.carbs)} / {targets.dailyCarbs}g</span>
          </div>
          <div className="text-lg font-bold font-mono text-blue-400 tabular-nums">
            {Math.round(dailyTotals.carbs)} <span className="text-xs font-normal text-neutral-400">g</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (dailyTotals.carbs / targets.dailyCarbs) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Fats</span>
            <span className="font-mono tabular-nums">{Math.round(dailyTotals.fat)} / {targets.dailyFat}g</span>
          </div>
          <div className="text-lg font-bold font-mono text-purple-400 tabular-nums">
            {Math.round(dailyTotals.fat)} <span className="text-xs font-normal text-neutral-400">g</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (dailyTotals.fat / targets.dailyFat) * 100)}%` }}
            />
          </div>
        </div>

        {/* Water */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 col-span-2 md:col-span-1">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Hydration</span>
            <span className="font-mono tabular-nums">{dayWaterTotal} / {targets.dailyWaterMl} ml</span>
          </div>
          <div className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
            {dayWaterTotal} <span className="text-xs font-normal text-neutral-400">ml</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (dayWaterTotal / targets.dailyWaterMl) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hydration Quick-Log Strip */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Droplet size={15} className="text-cyan-400" />
          <span className="font-semibold text-neutral-200">Log Water Intake:</span>
          <span className="text-neutral-400">Tap to instantly record clean hydration:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addWaterEntry(250, selectedDate)}
            className="px-2.5 py-1 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-cyan-300 font-mono"
          >
            +250ml (1 Glass)
          </button>
          <button
            onClick={() => addWaterEntry(500, selectedDate)}
            className="px-2.5 py-1 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-cyan-300 font-mono"
          >
            +500ml (Bottle)
          </button>
          <button
            onClick={() => addWaterEntry(750, selectedDate)}
            className="px-2.5 py-1 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-cyan-300 font-mono"
          >
            +750ml (Sipper)
          </button>
          <button
            onClick={() => addWaterEntry(1000, selectedDate)}
            className="px-2.5 py-1 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-cyan-300 font-mono"
          >
            +1000ml (1 Litre)
          </button>
        </div>
      </div>

      {/* Meal Diary Categories */}
      <div className="space-y-4">
        {mealCategoriesList.map((cat) => {
          const categoryFoods = dayFoods.filter((f) => f.mealCategory === cat.id);
          const catCalories = categoryFoods.reduce((s, f) => s + f.calories, 0);
          const catProtein = categoryFoods.reduce((s, f) => s + f.protein, 0);

          return (
            <div key={cat.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-neutral-100">{cat.label}</h3>
                  <span className="text-xs font-mono text-neutral-400 tabular-nums">
                    {Math.round(catCalories)} kcal · {Math.round(catProtein)}g protein
                  </span>
                </div>
                <button
                  onClick={() => handleOpenAdd(cat.id)}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Add to {cat.label}</span>
                </button>
              </div>

              {categoryFoods.length === 0 ? (
                <div className="py-3 text-center text-xs text-neutral-500">
                  No food recorded for {cat.label.toLowerCase()}.
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryFoods.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs hover:border-neutral-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-200 truncate">{food.name}</span>
                          <span className="text-neutral-500 text-[11px]">
                            ({food.quantity} {food.unit})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 mt-0.5 tabular-nums">
                          <span>{food.calories} kcal</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 font-medium">{food.protein}g protein</span>
                          <span aria-hidden="true">·</span>
                          <span>{food.carbs}g carbs</span>
                          <span aria-hidden="true">·</span>
                          <span>{food.fat}g fat</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-3">
                        <button
                          onClick={() => handleDuplicateFood(food)}
                          title="Duplicate entry"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-200"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => handleEditFood(food)}
                          title="Edit entry"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-200"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => deleteFoodEntry(food.id)}
                          title="Delete entry"
                          className="p-1 rounded text-neutral-500 hover:text-rose-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Food */}
      {isAddingFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-3">
              {editingFoodId ? 'Edit Food Record' : 'Record Food Entry'}
            </h3>

            {/* Quick Presets Picker */}
            <div className="mb-4">
              <span className="text-[11px] text-neutral-400 block mb-1">
                Indian Vegetarian Presets (Tap to fill):
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-neutral-950 border border-neutral-800 rounded text-[11px]">
                {VEGETARIAN_FOOD_DATABASE.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(item)}
                    className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] truncate"
                  >
                    {item.name.split('(')[0].trim()} ({item.protein}g P)
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 150g Boiled Rajma + 1 Cup Steamed Rice"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Meal</label>
                  <select
                    value={mealCategory}
                    onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Evening Snacks</option>
                    <option value="dinner">Dinner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1 text-[11px]">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-emerald-400 mb-1 text-[11px]">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-center text-emerald-400 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 text-[11px]">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 text-[11px]">Fat (g)</label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-950 border border-neutral-700 rounded text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Cooked with 1 tsp mustard oil"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddingFood(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  {editingFoodId ? 'Save Changes' : 'Record Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Nutrition Targets */}
      {isEditingTargets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-4">
              Configure Daily Nutrition & Hydration Targets
            </h3>

            <form onSubmit={handleSaveTargets} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Daily Calories (kcal)</label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-emerald-400 mb-1">Daily Protein (grams)</label>
                <input
                  type="number"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono text-emerald-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Carbohydrates (g)</label>
                  <input
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={targetFat}
                    onChange={(e) => setTargetFat(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan-400 mb-1">Daily Water Target (ml)</label>
                <input
                  type="number"
                  step="100"
                  value={targetWater}
                  onChange={(e) => setTargetWater(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded font-mono text-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditingTargets(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-100 text-neutral-950 rounded font-medium hover:bg-white"
                >
                  Save Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
