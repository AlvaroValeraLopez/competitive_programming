const LIMIT = 1000;
const sumMultiples = (n) => n * Math.floor((LIMIT - 1) / n) * Math.floor((LIMIT - 1) / n + 1) / 2;
console.log(`Summation = ${sumMultiples(3) + sumMultiples(5) - sumMultiples(15)}`);