function findPythagoreanTripletWithSum(sum) {
	for (let a = 1; a < sum / 3; a++) { // a < sum/3 ensures a < b < c
			for (let b = a + 1; b < sum / 2; b++) { // b < sum/2 for the same reason
					let c = sum - a - b;
					if (a * a + b * b === c * c) {
							// Found the triplet
							return {a, b, c};
					}
			}
	}
	return null; // Returns null if no such triplet is found
}

// Example usage
const {a, b, c} = findPythagoreanTripletWithSum(1000);
console.log(`${a} * ${b} * ${c} = `, (a*b*c) );

