import { generateRandomNumbers } from '../utils/numbers'
import { RECIPE_TYPE_KEYS } from '@/utils/recipeTypes'
import { useRecipes } from './useRecipes'
import useSupabase from './useSupabase'
import { useUser } from './useUser'

export function useMenu() {
  const { supabase } = useSupabase()
  const { user } = useUser()
  const { listRecipes } = useRecipes()

  const readMenu = async planDate => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select(
        'id, user_id, plan_date, slot, recipe_id, notes, recipe:recipes(id,title,description,photo_url)',
      )
      .eq('plan_date', planDate)
      .order('slot', { ascending: true })

    if (error) throw error

    return data || []
  }

  const upsertMealPlanSlot = async ({
    planDate,
    slot,
    recipeId,
    notes = null,
  }) => {
    const payload = {
      user_id: user.value.id,
      plan_date: planDate,
      slot,
      recipe_id: recipeId,
      notes,
    }

    const { data, error } = await supabase
      .from('meal_plans')
      .upsert(payload, { onConflict: 'user_id,plan_date,slot' })
      .select('id, plan_date, slot, recipe_id')
      .single()

    if (error) throw error
    return data
  }

  const createMenu = async planDates => {
    const recipesByType = {}

    for (const slot of RECIPE_TYPE_KEYS) {
      recipesByType[slot] = await listRecipes({ type: slot })
    }

    for (const planDate of planDates) {
      for (const slot of RECIPE_TYPE_KEYS) {
        const recipes = recipesByType[slot]
        if (!recipes.length) continue

        const [randomIndex] = generateRandomNumbers({
          quantity: 1,
          max: recipes.length,
        })

        await upsertMealPlanSlot({
          planDate,
          slot,
          recipeId: recipes[randomIndex]?.id || null,
        })
      }
    }
  }

  return {
    createMenu,
    readMenu,
    upsertMealPlanSlot,
  }
}
