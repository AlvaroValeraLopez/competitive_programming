function sumOfFifthPowers() {
	const fifthPowers = [];
	for (let i = 0; i < 10; i++) {
		fifthPowers[i] = Math.pow(i, 5);
	}

	function isSumOfFifthPowers(number) {
		return number.toString().split('').reduce((sum, digit) => sum + fifthPowers[digit], 0) === number;
	}

	const upperBound = 6 * fifthPowers[9]; // 6 * 9^5
	let sum = 0;

	for (let i = 2; i <= upperBound; i++) {
		if (isSumOfFifthPowers(i)) {
			sum += i;
		}
	}

	return sum;
}

console.log(sumOfFifthPowers());
