const LIMIT = 4_000_000;
const fibonacciSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

let newFibonacciNumber;
do{
    newFibonacciNumber = fibonacciSequence[fibonacciSequence.length - 1] + fibonacciSequence[fibonacciSequence.length - 2];
    fibonacciSequence.push(newFibonacciNumber);
}while(newFibonacciNumber < LIMIT);

fibonacciSequence.pop();
const evenFibonacciSummation = fibonacciSequence.filter(number => number % 2 === 0).reduce((acc, curr) => acc + curr, 0);

console.log('Even Fibonacci Sumattion = ', evenFibonacciSummation);