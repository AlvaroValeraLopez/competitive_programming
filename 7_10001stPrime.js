function isPrime(num, primes) {
    for (let i = 0; primes[i] * primes[i] <= num; i++) {
        if (num % primes[i] === 0) return false;
    }
    return true;
}

function findNthPrime(n) {
    const primes = [2]; // Starting with the first prime
    let num = 3; // Starting from the first odd number after 2

    while (primes.length < n) {
        if (isPrime(num, primes)) {
            primes.push(num);
        }
        num += 2; // Only check odd numbers
    }

    return primes[n - 1];
}

const N = 10_001;
console.log(findNthPrime(N));
