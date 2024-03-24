const N = 100;

const squareOfTheSum = Math.pow((N * (N + 1)) / 2, 2);
const sumOfSquares = (N * (N + 1) * (2 * N + 1)) / 6;

console.log(squareOfTheSum - sumOfSquares);