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

  const listRecipesTypes = async () => {
    const { data, error } = await supabase.from('recipes_types').select()
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

  return {
    listRecipes,
    listRecipesTypes,
    readRecipe,
  }
}
