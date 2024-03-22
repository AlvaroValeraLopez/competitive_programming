const multiples = new Set();
const LIMIT = 1000;

for (let n = 1; n < LIMIT; n++) {
	if (n % 3 === 0 || n % 5 === 0) {
		multiples.add(n);
	}
}

const sum = Array.from(multiples).reduce((acc, curr) => acc + curr, 0);
console.log(`Summation = ${sum}`);