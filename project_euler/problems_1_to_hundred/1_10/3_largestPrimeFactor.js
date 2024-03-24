const N = 600_851_475_143;
const primeFactors = findPrimeFactors(N);
console.log('Biggest prime factor of', N, 'is', primeFactors[primeFactors.length - 1]);

function findPrimeFactors(n) {
    let primeFactors = [];

    while (n % 2 === 0) {
        primeFactors.push(2);
        n = n / 2;
    }

    let sqrtN = Math.sqrt(n);
    for (let i = 3; i <= sqrtN; i += 2) {
        while (n % i === 0) {
            primeFactors.push(i);
            n = n / i;
            sqrtN = Math.sqrt(n);
        }
    }

    if (n > 2) {
        primeFactors.push(n);
    }

    return primeFactors;
}