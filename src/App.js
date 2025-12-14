import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Edit2, Search, Copy, Heart, Repeat, ChevronDown, ChevronUp } from 'lucide-react';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const getDaysSinceLastMade = (events, mealName) => {
  const mealEvents = events
    .filter(e => e.mealName === mealName)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (mealEvents.length === 0) return null;
  const lastDate = new Date(mealEvents[0].date);
  const today = new Date();
  const diffTime = Math.abs(today - lastDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const PROTEINS = {
  chicken: '#3b82f6',
  beef: '#dc2626',
  pork: '#f97316',
  fish: '#06b6d4',
  vegetarian: '#10b981',
  turkey: '#92400e',
  lamb: '#7c3aed',
  egg: '#fbbf24',
  other: '#6b7280'
};

const PROTEIN_OPTIONS = Object.keys(PROTEINS);

const MealCard = ({ event, onEdit, onDuplicate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="px-3 py-2 rounded mb-2 text-white shadow-sm" style={{ backgroundColor: PROTEINS[event.protein] || PROTEINS.other }}>
      <div className="flex items-start justify-between gap-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-1 min-w-0">
          <div className="font-medium flex items-center gap-2">
            {event.mealName}
            {event.isFavorite && <Heart size={12} fill="white" />}
            {event.hasLeftovers && <span className="text-xs">🍱</span>}
          </div>
          <div className="text-xs opacity-90 mt-1">
            {event.mealType} {event.time} {event.rating > 0 && <span className="ml-2">{'⭐'.repeat(event.rating)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(event); }} className="p-1 hover:bg-white hover:bg-opacity-20 rounded">
            <Copy size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="p-1 hover:bg-white hover:bg-opacity-20 rounded">
            <Edit2 size={12} />
          </button>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white border-opacity-30 text-sm">
          <div className="mb-2">
            <div className="text-xs opacity-75 mb-1">Protein: <span className="capitalize font-medium">{event.protein}</span></div>
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="mb-2">
              <div className="text-xs opacity-75 mb-1">Tags:</div>
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white bg-opacity-20 rounded text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}
          {event.notes && (
            <div>
              <div className="text-xs opacity-75 mb-1">Notes:</div>
              <div className="text-xs whitespace-pre-wrap">{event.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EventModal = ({ event, onClose, onSave, onDelete, selectedDate, allEvents }) => {
  const [formData, setFormData] = useState(event || {
    mealName: '', time: '12:00', protein: 'chicken', date: selectedDate,
    rating: 0, isFavorite: false, hasLeftovers: false, tags: [], mealType: 'lunch', customTags: ''
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'drink', 'date night'];
  const availableTags = ['Quick', 'Healthy', 'Comfort Food', 'Date Night', 'Budget Friendly', 'Meal Prep', 'Spicy', 'Kid Friendly'];

  const daysSinceLastMade = formData.mealName 
    ? getDaysSinceLastMade(allEvents, formData.mealName) : null;

  const handleSubmit = () => {
    if (formData.mealName?.trim()) {
      const tags = [...(formData.tags || [])];
      if (formData.customTags?.trim()) {
        tags.push(...formData.customTags.split(',').map(t => t.trim()).filter(t => t));
      }
      onSave({ ...formData, tags });
    }
  };

  const toggleTag = (tag) => {
    const tags = formData.tags || [];
    setFormData({ ...formData, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">{event ? 'Edit Meal' : 'Add Meal'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
            <input type="text" value={formData.mealName || ''} 
              onChange={(e) => setFormData({ ...formData, mealName: e.target.value })}
              placeholder="e.g., Grilled Chicken Salad"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {daysSinceLastMade !== null && daysSinceLastMade > 0 && (
              <p className={`text-xs mt-1 ${daysSinceLastMade >= 30 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                {daysSinceLastMade >= 30 && '⏰ '}Last made {daysSinceLastMade} days ago
                {daysSinceLastMade >= 30 && ' - It\'s been a while!'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <select value={formData.mealType || 'lunch'} 
              onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              {mealTypes.map(meal => (
                <option key={meal} value={meal}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Protein</label>
            <div className="flex flex-wrap gap-2">
              {PROTEIN_OPTIONS.map(protein => (
                <button key={protein} onClick={() => setFormData({ ...formData, protein })}
                  className={`px-4 py-2 rounded-full text-sm transition-colors capitalize ${
                    formData.protein === protein ? 'ring-2 ring-offset-2 ring-gray-900' : 'hover:opacity-80'
                  }`}
                  style={{ backgroundColor: PROTEINS[protein], color: 'white' }}>
                  {protein}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setFormData({ ...formData, rating: star })}
                  className="text-2xl transition-transform hover:scale-110">
                  {star <= (formData.rating || 0) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableTags.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    (formData.tags || []).includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}>{tag}</button>
              ))}
            </div>
            <input type="text" value={formData.customTags || ''} 
              onChange={(e) => setFormData({ ...formData, customTags: e.target.value })}
              placeholder="Add custom tags (comma-separated)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isFavorite || false}
                onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-gray-700">Favorite ❤️</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.hasLeftovers || false}
                onChange={(e) => setFormData({ ...formData, hasLeftovers: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-gray-700">Has Leftovers 🍱</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Recipe, ingredients, or meal details..." rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
              {event ? 'Update' : 'Add'} Meal
            </button>
            {event && (
              <button onClick={() => onDelete(event.id)} className="px-4 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FavoritesSidebar = ({ events, onAddMeal, isOpen, onToggle }) => {
  const favoriteMeals = events.filter(e => e.isFavorite)
    .reduce((acc, meal) => {
      if (!acc.find(m => m.mealName === meal.mealName)) acc.push(meal);
      return acc;
    }, []).sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (!isOpen) {
    return (
      <button onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-pink-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-pink-700 transition-colors z-40">
        <Heart size={20} />
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l z-40 overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Heart size={20} className="text-pink-600" fill="currentColor" />
          Favorite Meals
        </h3>
        <button onClick={onToggle} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
      </div>
      <div className="p-4 space-y-3">
        {favoriteMeals.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No favorite meals yet!</p>
        ) : (
          favoriteMeals.map((meal) => {
            const daysSince = getDaysSinceLastMade(events, meal.mealName);
            return (
              <div key={meal.mealName} onClick={() => onAddMeal(meal)}
                className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderLeftWidth: '4px', borderLeftColor: PROTEINS[meal.protein] || PROTEINS.other }}>
                <div className="font-medium">{meal.mealName}</div>
                <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                  {meal.rating > 0 && <span>{'⭐'.repeat(meal.rating)}</span>}
                  <span className="capitalize">{meal.mealType}</span>
                  <span className="capitalize text-gray-500">{meal.protein}</span>
                </div>
                {meal.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {meal.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                )}
                {daysSince !== null && (
                  <div className={`text-xs mt-2 ${daysSince >= 30 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                    {daysSince >= 30 && '⏰ '}Last made {daysSince} days ago
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const MonthView = ({ currentDate, events, onDateClick, onEventClick, onDragStart, onDragOver, onDrop, onDuplicate, searchTerm }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    let dayEvents = events.filter(e => e.date === dateStr);
    
    if (searchTerm) {
      dayEvents = dayEvents.filter(e => 
        e.mealName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return dayEvents.sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm text-gray-700 border-r last:border-r-0">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr border-t">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const dateStr = day ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
          return (
            <div key={idx}
              className={`border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden ${!day ? 'bg-gray-50' : ''}`}
              onClick={() => day && onDateClick(day)}
              onDragOver={(e) => dateStr && onDragOver(e)}
              onDrop={(e) => dateStr && onDrop(e, dateStr)}>
              {day && (
                <>
                  <div className="font-medium text-sm mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div key={event.id} draggable
                        onDragStart={(e) => onDragStart(e, event)}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className="text-xs px-2 py-1 rounded truncate text-white cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: PROTEINS[event.protein] || PROTEINS.other }}>
                        {`${event.mealType}: ${event.mealName}${event.hasLeftovers ? ' 🍱' : ''}`}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView = ({ currentDate, events, onDateClick, onEventClick, onDragStart, onDragOver, onDrop, searchTerm }) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const getEventsForDay = (date) => {
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    let dayEvents = events.filter(e => e.date === dateStr);
    
    if (searchTerm) {
      dayEvents = dayEvents.filter(e =>
        e.mealName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return dayEvents.sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="grid grid-cols-7 border-b gap-1 p-2">
        {days.map((date, idx) => (
          <div key={idx} className="text-center border rounded p-2 bg-gray-50">
            <div className="text-sm font-semibold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="text-lg font-bold">{date.getDate()}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 gap-1 p-2 overflow-y-auto">
        {days.map((date, idx) => {
          const dayEvents = getEventsForDay(date);
          const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          return (
            <div key={idx}
              className="border rounded bg-white p-2 cursor-pointer hover:shadow-md transition-shadow overflow-y-auto"
              onClick={() => onDateClick(date.getDate())}
              onDragOver={(e) => onDragOver(e)}
              onDrop={(e) => onDrop(e, dateStr)}>
              <div className="space-y-2">
                {dayEvents.map(event => (
                  <div key={event.id} draggable
                    onDragStart={(e) => onDragStart(e, event)}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    className="text-xs p-2 rounded text-white cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: PROTEINS[event.protein] || PROTEINS.other }}>
                    <div className="font-medium truncate">{event.mealName}</div>
                    <div className="text-xs opacity-90 capitalize">{event.mealType}</div>
                    <div className="text-xs opacity-75">{event.time}</div>
                    {event.hasLeftovers && <div className="text-xs">🍱 Leftovers</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DayView = ({ currentDate, events, onDateClick, onEventClick, onDragStart, onDragOver, onDrop, searchTerm }) => {
  const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
  let dayEvents = events.filter(e => e.date === dateStr);
  
  if (searchTerm) {
    dayEvents = dayEvents.filter(e =>
      e.mealName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  dayEvents = dayEvents.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {dayEvents.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p className="text-lg">No meals scheduled for today</p>
        </div>
      ) : (
        <div className="flex justify-center w-full p-4">
          <div className="space-y-3 w-full max-w-2xl">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                draggable
                onDragStart={(e) => onDragStart(e, event)}
                onClick={() => onEventClick(event)}
                className="p-4 rounded-lg text-white cursor-pointer hover:shadow-lg transition-shadow"
                style={{
                  backgroundColor: PROTEINS[event.protein] || PROTEINS.other
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg">{event.mealName}</div>
                    <div className="text-sm opacity-90 mt-1 capitalize">{event.mealType} at {event.time}</div>
                    {event.rating > 0 && (
                      <div className="text-sm mt-2">{'⭐'.repeat(event.rating)}</div>
                    )}
                    {event.hasLeftovers && <div className="text-sm mt-2">🍱 Leftovers</div>}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {event.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    {event.notes && (
                      <div className="text-sm opacity-90 mt-3 whitespace-pre-wrap">{event.notes}</div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onEventClick(event); }} className="p-2 hover:bg-white hover:bg-opacity-10 rounded flex-shrink-0">
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedEvent, setDraggedEvent] = useState(null);

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(currentDate.getMonth() + direction);
    else if (view === 'week') newDate.setDate(currentDate.getDate() + (direction * 7));
    else newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const handleSaveEvent = (eventData) => {
    if (selectedEvent) {
      setEvents(events.map(e => e.id === selectedEvent.id ? { ...eventData, id: e.id } : e));
    } else {
      setEvents([...events, { ...eventData, id: Date.now().toString() }]);
    }
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleDateClick = (day) => {
    let dateStr;
    if (day instanceof Date) {
      // Day is a Date object (from WeekView or DayView)
      dateStr = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
    } else {
      // Day is a number (from MonthView)
      dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    setSelectedDate(dateStr);
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedDate(event.date);
    setShowModal(true);
  };

  const handleDuplicateMeal = (meal) => {
    setSelectedEvent(null);
    setSelectedDate(selectedDate || `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`);
    setShowModal(true);
    setTimeout(() => {
      setSelectedEvent({ ...meal, id: null });
    }, 0);
  };

  const handleAddFavoriteMeal = (meal) => {
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    setEvents([...events, { ...meal, id: Date.now().toString(), date: dateStr }]);
  };

  const handleRepeatLastWeek = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(startOfWeek.getDate() - 7);
    
    const lastWeekEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= lastWeekStart && eventDate < startOfWeek;
    });

    const newEvents = lastWeekEvents.map(e => {
      const oldDate = new Date(e.date);
      const daysDiff = Math.floor((oldDate - lastWeekStart) / (1000 * 60 * 60 * 24));
      const newDate = new Date(startOfWeek);
      newDate.setDate(startOfWeek.getDate() + daysDiff);
      const newDateStr = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}-${newDate.getDate().toString().padStart(2, '0')}`;
      return { ...e, id: Date.now().toString() + Math.random(), date: newDateStr };
    });

    setEvents([...events, ...newEvents]);
  };

  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDate) => {
    e.preventDefault();
    if (draggedEvent) {
      setEvents(events.map(ev => 
        ev.id === draggedEvent.id ? { ...ev, date: targetDate } : ev
      ));
      setDraggedEvent(null);
    }
  };

  const getHeaderText = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const weekNum = Math.ceil(((currentDate - new Date(currentDate.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
      return `Week ${weekNum}, ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const renderView = () => {
    switch(view) {
      case 'week':
        return <WeekView currentDate={currentDate} events={events} onDateClick={handleDateClick}
          onEventClick={handleEventClick} onDragStart={handleDragStart} onDragOver={handleDragOver}
          onDrop={handleDrop} searchTerm={searchTerm} />;
      case 'day':
        return <DayView currentDate={currentDate} events={events} onDateClick={handleDateClick}
          onEventClick={handleEventClick} onDragStart={handleDragStart} onDragOver={handleDragOver}
          onDrop={handleDrop} searchTerm={searchTerm} />;
      default:
        return <MonthView currentDate={currentDate} events={events} onDateClick={handleDateClick}
          onEventClick={handleEventClick} onDragStart={handleDragStart} onDragOver={handleDragOver}
          onDrop={handleDrop} onDuplicate={handleDuplicateMeal} searchTerm={searchTerm} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Meal Calendar</h1>
            <button onClick={() => {
              setCurrentDate(new Date());
              setView('day');
            }}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
              Today
            </button>
            <button onClick={handleRepeatLastWeek}
              className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 rounded-md transition-colors flex items-center gap-2">
              <Repeat size={16} /> Repeat Last Week
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-lg min-w-64 text-center">{getHeaderText()}</span>
            <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-200 rounded-md p-1">
              {['month', 'week', 'day'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-2 text-sm rounded transition-colors ${view === v ? 'bg-white shadow-sm' : 'hover:bg-gray-300'}`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={() => {
                setSelectedDate(`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`);
                setSelectedEvent(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Plus size={18} /> Add Meal
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search meals by name or ingredients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border overflow-hidden flex flex-col">
        {renderView()}
      </div>

      {showModal && (
        <EventModal event={selectedEvent} onClose={() => { setShowModal(false); setSelectedEvent(null); }}
          onSave={handleSaveEvent} onDelete={handleDeleteEvent} selectedDate={selectedDate} allEvents={events} />
      )}

      <FavoritesSidebar events={events} onAddMeal={handleAddFavoriteMeal} 
        isOpen={showFavorites} onToggle={() => setShowFavorites(!showFavorites)} />
    </div>
  );
};

export default Calendar;