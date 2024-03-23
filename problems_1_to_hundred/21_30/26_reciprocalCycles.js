function findLongestRecurringCycle(limit) {
	let maxCycleLength = 0;
	let denominatorWithMaxCycle = 0;

	for (let d = 2; d < limit; d++) {
		let remainders = new Map();
		let value = 1;
		let position = 0;

		while (!remainders.has(value) && value !== 0) {
			remainders.set(value, position);
			value *= 10;
			value %= d;
			position++;
		}

		if (value !== 0) {
			let cycleLength = position - remainders.get(value);
			if (cycleLength > maxCycleLength) {
				maxCycleLength = cycleLength;
				denominatorWithMaxCycle = d;
			}
		}
	}

	return denominatorWithMaxCycle;
}

const d = findLongestRecurringCycle(1000);
console.log(d);
