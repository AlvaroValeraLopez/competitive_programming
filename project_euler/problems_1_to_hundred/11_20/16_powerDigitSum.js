function sumOfDigits(base, exponent) {
	const NUMBER = BigInt(Math.pow(base, exponent)).toString();
	return [...NUMBER].reduce((acc, digit) => acc + parseInt(digit), 0);
}

// Usage:
const sum = sumOfDigits(2, 1000);
console.log("The sum of the digits is:", sum);
