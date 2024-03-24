function gcd(a, b) {
	while (b != 0) {
		let t = b;
		b = a % b;
		a = t;
	}
	return a;
}

function digitCancellingFractions() {
	let productNumerator = 1;
	let productDenominator = 1;

	for (let numerator = 10; numerator <= 98; numerator++) {
		for (let denominator = numerator + 1; denominator <= 99; denominator++) {
			let numStr = numerator.toString();
			let denStr = denominator.toString();

			if (numStr[1] === '0' || denStr[1] === '0') continue; // Skip trivial cases

			let cancelledNumerator, cancelledDenominator;

			// Check if the digits can be cancelled
			if (numStr[0] === denStr[0]) {
				cancelledNumerator = parseInt(numStr[1]);
				cancelledDenominator = parseInt(denStr[1]);
			} else if (numStr[1] === denStr[1]) {
				cancelledNumerator = parseInt(numStr[0]);
				cancelledDenominator = parseInt(denStr[0]);
			} else if (numStr[0] === denStr[1]) {
				cancelledNumerator = parseInt(numStr[1]);
				cancelledDenominator = parseInt(denStr[0]);
			} else if (numStr[1] === denStr[0]) {
				cancelledNumerator = parseInt(numStr[0]);
				cancelledDenominator = parseInt(denStr[1]);
			} else {
				continue; // No digit in common
			}

			// Check if the fraction is the same after cancelling the digit
			if (cancelledDenominator !== 0 && numerator * cancelledDenominator === denominator * cancelledNumerator) {
				productNumerator *= cancelledNumerator;
				productDenominator *= cancelledDenominator;
			}
		}
	}

	// Reduce the final product to its lowest terms
	let finalGcd = gcd(productNumerator, productDenominator);
	productNumerator /= finalGcd;
	productDenominator /= finalGcd;

	return productDenominator;
}

console.log(digitCancellingFractions());
