const BOTTOM_LIMIT = 2;
const TOP_LIMIT = 100;

const combinations = new Set();
for (let i = BOTTOM_LIMIT; i <= TOP_LIMIT; i++) {
	for (let j = BOTTOM_LIMIT; j <= TOP_LIMIT; j++) {
		combinations.add(BigInt(i ** j));
	}
}

console.log(combinations.size);