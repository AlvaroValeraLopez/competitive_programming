function isPandigital(n) {
	return n.split('').sort().join('') === '123456789';
}

function findPandigitalProducts() {
	const products = new Set();

	// The outer loop is for the multiplicand
	for (let i = 2; i < 100; i++) {
		// The inner loop is for the multiplier
		for (let j = i + 1; j < 10000 / i; j++) {
			const product = i * j;
			const combined = `${i}${j}${product}`;
			if (combined.length === 9 && isPandigital(combined)) {
				products.add(product);
			}
		}
	}

	return Array.from(products).reduce((sum, product) => sum + product, 0);
}

console.log(findPandigitalProducts());
