function sumOfDivisors(n) {
	let sum = 1; // 1 is a proper divisor for all n > 1
	for (let i = 2; i <= Math.sqrt(n); i++) {
		if (n % i === 0) {
			sum += i;
			if (n / i !== i) {
				sum += n / i;
			}
		}
	}
	return sum;
}

function findAmicableNumbers(limit) {
	let sum = 0;
	let divisorsSum = new Array(limit);
	for (let i = 0; i < limit; i++) {
		divisorsSum[i] = sumOfDivisors(i);
	}

	for (let i = 0; i < limit; i++) {
		let potentialAmicable = divisorsSum[i];
		if (potentialAmicable < limit && potentialAmicable !== i && divisorsSum[potentialAmicable] === i) {
			sum += i;
		}
	}
	return sum;
}

const result = findAmicableNumbers(10000);
console.log(result);  