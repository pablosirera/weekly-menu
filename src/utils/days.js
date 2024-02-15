export const loadDays = (max = 6) => {
  const today = new Date().getDate()
  const totalDays = []

  for (let i = 0; i <= max; i++) {
    totalDays.push(today + i)
  }

  return totalDays.map(day => ({
    value: day.toString(),
    text: day,
  }))
}
