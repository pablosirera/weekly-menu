export const loadDays = (max = 6) => {
  const labels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
  const today = new Date()

  return Array.from({ length: max + 1 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    return {
      value: date.toISOString().slice(0, 10),
      text: `${labels[date.getDay()]} ${date.getDate()}`,
    }
  })
}
