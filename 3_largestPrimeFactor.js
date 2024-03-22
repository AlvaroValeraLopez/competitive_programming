const NUMBER = 13195;
const factors = [];

for (let i = 2; i <= Math.sqrt(NUMBER); i++) {
  if (NUMBER % i === 0) {
    factors.push(i);
  }
}

const primeFactors = factors.filter((factor) => {
  for (let i = 2; i <= Math.sqrt(factor); i++) {
    if (factor % i === 0) {
      return false;
    }
  }
  return true;
});

console.log('Largest Prime Factor = ', primeFactors[primeFactors.length - 1])