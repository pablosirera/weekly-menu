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
        new Date(
          `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}Z`,
        ).toISOString(),
      )
    if (error) throw error

    return data
  }

  const saveMenu = async ({ day, menu }) => {
    const { data, error } = await supabase.from('menu').insert([
      {
        day: new Date(
          `${new Date().getMonth() + 1}/${day}/${new Date().getFullYear()}`,
        ),
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

  const createMenu = async () => {
    let allRecipes = {}
    const today = new Date().getDate()

    const types = await listRecipesTypes()

    for (const type of types) {
      const recipes = await listRecipes({ type: type.id })
      const randomNumbers = generateRandomNumbers({
        quantity: 3,
        max: recipes.length,
      })

      allRecipes = {
        ...allRecipes,
        [today]: {
          ...allRecipes[today],
          [type.name]: recipes[randomNumbers[0]],
        },
        [today + 1]: {
          ...allRecipes[today + 1],
          [type.name]: recipes[randomNumbers[1]],
        },
        [today + 2]: {
          ...allRecipes[today + 2],
          [type.name]: recipes[randomNumbers[2]],
        },
      }
    }

    for (const day in allRecipes) {
      saveMenu({ day, menu: allRecipes[day] })
    }

    return allRecipes
  }

  return {
    createMenu,
    readMenu,
  }
}
