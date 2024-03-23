const LIMIT = 2_000_000;

function sumOfPrimesBelow() {
    if (LIMIT < 2) {
        return 0;
    }

    let sumPrimes = 2; // Account for 2, the only even prime
    let sieve = new Array(LIMIT).fill(true); // Initialize sieve array
    sieve[0] = false; // 0 is not prime
    sieve[1] = false; // 1 is not prime

    for (let num = 3; num < LIMIT; num += 2) { // Skip even numbers, start from 3
        if (sieve[num]) {
            sumPrimes += num;
            for (let multiple = num * num; multiple < LIMIT; multiple += 2 * num) {
                sieve[multiple] = false; // Mark multiples of num as not prime
            }
        }
    }

    return sumPrimes;
}

console.log(sumOfPrimesBelow());
