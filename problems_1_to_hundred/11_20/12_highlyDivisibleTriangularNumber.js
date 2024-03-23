function countDivisors(n) {
    let count = 0;
    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            count += (n / i === i) ? 1 : 2; // Increment by 2 for each factor pair, except if perfect square
        }
    }
    return count;
}

function findTriangularOver500Divisors() {
    let n = 1;
    while (true) {
        let triangular = n * (n + 1) / 2; // Generate triangular number
        // Adjust divisor count calculation based on parity of n
        let divisors = (n % 2 === 0) ?
            countDivisors(n / 2) * countDivisors(n + 1) :
            countDivisors(n) * countDivisors((n + 1) / 2);

        if (divisors > 5) {
            return triangular;
        }
        n++;
    }
}

// Find the first triangular number with over 500 divisors
console.log(findTriangularOver500Divisors());
