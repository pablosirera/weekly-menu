import breakfast from '@/data/breakfast.json'
import snack from '@/data/snack.json'
import lunch from '@/data/lunch.json'
import snack2 from '@/data/snack2.json'
import dinner from '@/data/dinner.json'

export const menu = {}

export const createMenu = () => {
  const today = new Date().getDate()
  const days = [today, today + 1, today + 2]
  for (const day of days) {
    const index = Math.floor(Math.random() * 2)
    console.log(index)

    menu[day] = {
      breakfast: breakfast[index],
      snack: snack[index],
      lunch: lunch[index],
      snack2: snack2[index],
      dinner: dinner[index],
    }
  }
}
