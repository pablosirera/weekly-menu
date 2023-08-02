import useSupabase from './useSupabase'

export function useRecipes() {
  const { supabase } = useSupabase()

  const listRecipes = async ({ type }) => {
    const { data, error } = await supabase
      .from('recipes')
      .select()
      .eq('type', type)
    if (error) throw error

    return data
  }

  const readRecipe = async ({ id }) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
    if (error) throw error

    return data
  }

  const createRecipe = async recipeInfo => {
    const { error } = await supabase.from('recipes').insert(recipeInfo)
    if (error) throw error
  }

  const listRecipesTypes = async () => {
    const { data, error } = await supabase.from('recipes_types').select()
    if (error) throw error

    return data
  }

  const readRecipeType = async ({ type }) => {
    const { data, error } = await supabase
      .from('recipes_types')
      .select('*')
      .eq('name', type)
      .limit(1)
    if (error) throw error

    return data[0]
  }

  const updateRecipe = async recipeInfo => {
    const { error } = await supabase
      .from('recipes')
      .update({ description: recipeInfo.description, type: recipeInfo.type })
      .eq('id', recipeInfo.id)
    if (error) throw error
  }

  return {
    listRecipes,
    listRecipesTypes,
    readRecipe,
    readRecipeType,
    createRecipe,
    updateRecipe,
  }
}
