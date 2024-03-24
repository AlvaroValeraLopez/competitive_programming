function sumSpiralDiagonals(spiralSize) {
	let sum = 1; // Start with the center number
	let currentNumber = 1;
	let stepSize = 2;

	while (stepSize < spiralSize) {
		for (let i = 0; i < 4; i++) {
			currentNumber += stepSize; // Move to the next corner
			sum += currentNumber;
		}
		stepSize += 2; // Increase the step size for the next layer
	}

	return sum;
}

const diagonalSum = sumSpiralDiagonals(1001);
console.log(diagonalSum);
