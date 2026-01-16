export const ALLERGENS = [
  { id: 'gluten', label: 'Glutine', icon: '🌾' },
  { id: 'lactose', label: 'Lattosio', icon: '🥛' },
  { id: 'eggs', label: 'Uova', icon: '🥚' },
  { id: 'nuts', label: 'Frutta a guscio', icon: '🥜' },
  { id: 'peanuts', label: 'Arachidi', icon: '🥜' },
  { id: 'fish', label: 'Pesce', icon: '🐟' },
  { id: 'shellfish', label: 'Crostacei', icon: '🦐' },
  { id: 'soy', label: 'Soia', icon: '🫘' },
  { id: 'celery', label: 'Sedano', icon: '🥬' },
  { id: 'mustard', label: 'Senape', icon: '🌭' },
  { id: 'sesame', label: 'Sesamo', icon: '🥯' },
  { id: 'sulfites', label: 'Solfiti', icon: '🍷' },
  { id: 'lupin', label: 'Lupini', icon: '🌼' },
  { id: 'molluscs', label: 'Molluschi', icon: '🐙' },
] as const

export type AllergenId = typeof ALLERGENS[number]['id']
