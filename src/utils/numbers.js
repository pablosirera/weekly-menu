export const generateRandomNumbers = ({ quantity, max }) => {
  const numbers = []
  while (numbers.length < quantity) {
    const number = Math.floor(Math.random() * max)
    numbers.push(number)
  }
  return numbers
}
