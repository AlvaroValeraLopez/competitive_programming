const LIMIT = 4_000_000;
let sum = 0;
let a = 1;
let b = 1; 
let c = a + b;

while (c < LIMIT) {
    sum += c;
    a = b + c;
    b = a + c;
    c = a + b;
}

console.log('Even Fibonacci Summation = ', sum);