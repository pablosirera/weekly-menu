import { generateRandomNumbers } from '../utils/numbers'

import { useRecipes } from './useRecipes'
import useSupabase from './useSupabase'
import { useUser } from './useUser'

export function useMenu() {
  const { supabase } = useSupabase()
  const { user } = useUser()
  const { listRecipesTypes, listRecipes } = useRecipes()

  const readMenu = async day => {
    const { data, error } = await supabase
      .from('menu')
      .select()
      .eq(
        'day',
        `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`,
      )
    if (error) throw error

    return data
  }

  const saveMenu = async ({ day, menu }) => {
    const { data, error } = await supabase.from('menu').insert([
      {
        day: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`,
        breakfast: menu['breakfast'].id,
        snack: menu['snack'].id,
        lunch: menu['lunch'].id,
        snack2: menu['snack2'].id,
        dinner: menu['dinner'].id,
        user: user.value.id,
      },
    ])
    if (error) throw error

    return data
  }

  const createMenu = async days => {
    let allRecipes = {}

    const types = await listRecipesTypes()

    for (const type of types) {
      const recipes = await listRecipes({ type: type.id })
      const randomNumbers = generateRandomNumbers({
        quantity: 5,
        max: recipes.length,
      })

      for (const [index, day] of days.entries()) {
        allRecipes = {
          ...allRecipes,
          [day]: {
            ...allRecipes[day],
            [type.name]: recipes[randomNumbers[index]],
          },
        }
      }
    }

    for (const day in allRecipes) {
      await saveMenu({ day, menu: allRecipes[day] })
    }

    return allRecipes
  }

  const updateMenu = async ({ id, recipeType, recipeTypeId }) => {
    console.log(id, recipeType, recipeTypeId)
    const { error } = await supabase
      .from('menu')
      .update({ [recipeType]: recipeTypeId })
      .eq('id', id)

    if (error) throw error
  }

  return {
    createMenu,
    readMenu,
    updateMenu,
  }
}
