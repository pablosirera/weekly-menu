import useSupabase from './useSupabase'
import { useUser } from './useUser'

const ACTIVE_PANTRY_STATUSES = ['available', 'assigned']

const withRemainingQuantity = item => {
  const quantityMode = item.quantity_mode || 'fixed'
  const allocated = (item.allocations || []).reduce(
    (sum, allocation) => sum + Number(allocation.quantity || 0),
    0,
  )
  const quantity = Number(item.quantity || 0)
  const isOpenQuantity = quantityMode === 'open'

  return {
    ...item,
    quantity_mode: quantityMode,
    is_open_quantity: isOpenQuantity,
    allocated_quantity: allocated,
    remaining_quantity: isOpenQuantity
      ? null
      : Math.max(quantity - allocated, 0),
  }
}

export function usePantry() {
  const { supabase } = useSupabase()
  const { user } = useUser()
  const pantrySelect =
    'id, user_id, recipe_id, custom_name, quantity_mode, quantity, status, storage, appliances, purchased_at, best_before, notes, created_at, recipe:recipes(id,title,description), allocations:pantry_item_allocations(quantity)'

  const listPantryItems = async () => {
    const { data, error } = await supabase
      .from('pantry_items')
      .select(pantrySelect)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(withRemainingQuantity)
  }

  const listAvailablePantryItems = async () => {
    const allItems = await listPantryItems()

    return allItems.filter(
      item =>
        ACTIVE_PANTRY_STATUSES.includes(item.status) &&
        item.recipe_id &&
        (item.is_open_quantity || item.remaining_quantity > 0),
    )
  }

  const createPantryItem = async pantryInfo => {
    if (user.value?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.value.id }, { onConflict: 'id' })
      if (profileError) throw profileError
    }

    const customName = pantryInfo.custom_name?.trim() || null
    const payload = {
      ...pantryInfo,
      custom_name: customName,
      status: pantryInfo.status || 'available',
      quantity_mode: pantryInfo.quantity_mode || 'fixed',
      quantity:
        pantryInfo.quantity_mode === 'open'
          ? null
          : Number(pantryInfo.quantity || 1),
      user_id: user.value.id,
    }

    const { error } = await supabase.from('pantry_items').insert(payload)
    if (error) throw error
  }

  const markPantryItemCompleted = async ({ id, completed }) => {
    const { error } = await supabase
      .from('pantry_items')
      .update({ status: completed ? 'eaten' : 'available' })
      .eq('id', id)

    if (error) throw error
  }

  const deletePantryItem = async ({ id }) => {
    const { error } = await supabase.from('pantry_items').delete().eq('id', id)
    if (error) throw error
  }

  const linkPantryItemToRecipe = async ({ id, recipeId }) => {
    const { error } = await supabase
      .from('pantry_items')
      .update({ recipe_id: recipeId, custom_name: null })
      .eq('id', id)

    if (error) throw error
  }

  const replaceMealPlanAllocation = async ({
    mealPlanId,
    pantryItemId,
    quantity = 1,
  }) => {
    const { error: deleteError } = await supabase
      .from('pantry_item_allocations')
      .delete()
      .eq('meal_plan_id', mealPlanId)

    if (deleteError) throw deleteError

    if (!pantryItemId) return

    const { error: insertError } = await supabase
      .from('pantry_item_allocations')
      .insert({
        meal_plan_id: mealPlanId,
        pantry_item_id: pantryItemId,
        quantity,
      })

    if (insertError) throw insertError
  }

  return {
    listPantryItems,
    listAvailablePantryItems,
    createPantryItem,
    markPantryItemCompleted,
    deletePantryItem,
    linkPantryItemToRecipe,
    replaceMealPlanAllocation,
  }
}
