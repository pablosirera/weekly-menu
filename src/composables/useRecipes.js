import useSupabase from './useSupabase'
import { RECIPE_TYPES } from '@/utils/recipeTypes'
import { useUser } from './useUser'

export function useRecipes() {
  const { supabase } = useSupabase()
  const { user } = useUser()
  const isMissingTypeColumnError = error =>
    error?.code === '42703' ||
    error?.message?.includes("Could not find the 'type' column")
  const isMissingUserIdColumnError = error =>
    error?.code === '42703' && error?.message?.includes('user_id')

  const listRecipes = async ({ type }) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('type', type)
      .order('updated_at', { ascending: false })
    if (error) {
      if (!isMissingTypeColumnError(error)) throw error

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('recipes')
        .select('*')
        .order('updated_at', { ascending: false })
      if (fallbackError) throw fallbackError

      return fallbackData
    }

    return data
  }

  const listAllRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error

    return data
  }

  const readRecipe = async ({ id }) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error

    return data
  }

  const createRecipe = async recipeInfo => {
    const payloadWithUser = {
      ...recipeInfo,
      user_id: user.value?.id || null,
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert(payloadWithUser)
      .select()
      .single()
    if (error) {
      if (isMissingUserIdColumnError(error)) {
        const { data: retryData, error: retryError } = await supabase
          .from('recipes')
          .insert(recipeInfo)
          .select()
          .single()
        if (retryError) throw retryError
        return retryData
      }

      if (!isMissingTypeColumnError(error)) throw error

      const { type, ...fallbackInfo } = recipeInfo
      const fallbackWithUser = {
        ...fallbackInfo,
        user_id: user.value?.id || null,
      }
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('recipes')
        .insert(fallbackWithUser)
        .select()
        .single()
      if (fallbackError) {
        if (isMissingUserIdColumnError(fallbackError)) {
          const { data: retryFallbackData, error: retryFallbackError } =
            await supabase
              .from('recipes')
              .insert(fallbackInfo)
              .select()
              .single()
          if (retryFallbackError) throw retryFallbackError
          return retryFallbackData
        }

        throw fallbackError
      }

      return fallbackData
    }

    return data
  }

  const listRecipesTypes = async () => RECIPE_TYPES

  const readRecipeType = async ({ type }) =>
    RECIPE_TYPES.find(recipeType => recipeType.name === type) || null

  const updateRecipe = async recipeInfo => {
    const { id, ...payload } = recipeInfo
    const { error } = await supabase
      .from('recipes')
      .update(payload)
      .eq('id', id)
    if (error) {
      if (!isMissingTypeColumnError(error)) throw error

      const { type, ...fallbackPayload } = payload
      const { error: fallbackError } = await supabase
        .from('recipes')
        .update(fallbackPayload)
        .eq('id', id)
      if (fallbackError) throw fallbackError
    }
  }

  const listRecipeIngredients = async ({ recipeId }) => {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select(
        'recipe_id, ingredient_id, quantity, unit, note, ingredient:ingredients(name)',
      )
      .eq('recipe_id', recipeId)
      .order('ingredient_id', { ascending: true })
    if (error) throw error

    return data
  }

  const listRecipeSteps = async ({ recipeId }) => {
    const { data, error } = await supabase
      .from('recipe_steps')
      .select('id, recipe_id, step_number, instruction, photo_url')
      .eq('recipe_id', recipeId)
      .order('step_number', { ascending: true })
    if (error) throw error

    return data
  }

  return {
    listRecipes,
    listAllRecipes,
    listRecipesTypes,
    readRecipe,
    readRecipeType,
    createRecipe,
    updateRecipe,
    listRecipeIngredients,
    listRecipeSteps,
  }
}
