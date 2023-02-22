export const generateRandomNumbers = ({ quantity, max }) => {
  const numbers = []
  while (numbers.length < quantity) {
    const number = Math.floor(Math.random() * max)
    if (!numbers.includes(number)) {
      numbers.push(number)
    }
  }
  return numbers
}
