export const RECIPE_TYPE_LABELS = {
  breakfast: 'Desayuno',
  brunch: 'Almuerzo',
  lunch: 'Comida',
  snack: 'Merienda',
  dinner: 'Cena',
}

export const getRecipeTypeLabel = name => RECIPE_TYPE_LABELS[name] || name
