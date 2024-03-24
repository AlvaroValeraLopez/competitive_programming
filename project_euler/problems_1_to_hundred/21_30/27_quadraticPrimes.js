function isPrime(num) {
	if (num <= 1) return false;
	if (num <= 3) return true;
	if (num % 2 === 0 || num % 3 === 0) return false;
	for (let i = 5; i * i <= num; i += 6) {
		if (num % i === 0 || num % (i + 2) === 0) return false;
	}
	return true;
}

function findQuadraticPrimes(range) {
	let maxNumOfPrimes = 0;
	let product = 0;

	for (let a = -range + 1; a < range; a++) {
		for (let b = -range; b <= range; b++) {
			if (!isPrime(Math.abs(b))) continue; // b must be prime when n = 0
			let n = 0;
			while (isPrime(Math.abs(n * n + a * n + b))) {
				n++;
			}
			if (n > maxNumOfPrimes) {
				maxNumOfPrimes = n;
				product = a * b;
			}
		}
	}

	return product;
}

// Example usage:
const product = findQuadraticPrimes(1000);
console.log(product);
