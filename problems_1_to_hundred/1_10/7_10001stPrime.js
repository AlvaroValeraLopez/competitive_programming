function isPrime(num, primes) {
    for (let i = 0; primes[i] * primes[i] <= num; i++) {
        if (num % primes[i] === 0) return false;
    }
    return true;
}

function findNthPrime(n) {
    const primes = [2];
    let num = 3;

    while (primes.length < n) {
        if (isPrime(num, primes)) {
            primes.push(num);
        }
        num += 2;
    }

    return primes[n - 1];
}

const N = 10_001;
console.log(findNthPrime(N));
