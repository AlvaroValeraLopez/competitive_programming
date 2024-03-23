const LIMIT = 28123;

function sumOfDivisors(n) {
	let sum = 1;
	for (let i = 2; i * i <= n; i++) {
		if (n % i === 0) {
			sum += i;
			if (i !== n / i) {
				sum += n / i;
			}
		}
	}
	return sum;
}

function findAbundantNumbers() {
	const abundantNumbers = [];
	for (let i = 12; i <= LIMIT; i++) {
		if (sumOfDivisors(i) > i) {
			abundantNumbers.push(i);
		}
	}
	return abundantNumbers;
}

function findAllSumsOfTwoAbundantNumbers(abundantNumbers) {
	const canBeWrittenAsAbundantSum = new Array(LIMIT + 1).fill(false);
	for (let i = 0; i < abundantNumbers.length; i++) {
		for (let j = i; j < abundantNumbers.length; j++) {
			const sum = abundantNumbers[i] + abundantNumbers[j];
			if (sum <= LIMIT) {
				canBeWrittenAsAbundantSum[sum] = true;
			} else {
				break;
			}
		}
	}
	return canBeWrittenAsAbundantSum;
}

function findNonAbundantSums() {
	const abundantNumbers = findAbundantNumbers();
	const canBeWrittenAsAbundantSum = findAllSumsOfTwoAbundantNumbers(abundantNumbers);
	let sumOfNonAbundantSums = 0;

	for (let i = 1; i <= LIMIT; i++) {
		if (!canBeWrittenAsAbundantSum[i]) {
			sumOfNonAbundantSums += i;
		}
	}

	return sumOfNonAbundantSums;
}

console.log(findNonAbundantSums());
