const fifthPowers = new Set();

for (let i = 2; i < 1_000_000; i++) {
	if (i === i.toString().split('').reduce((acc, cur) => acc + (parseInt(cur) ** 5), 0)) {
		fifthPowers.add(i);
	}
}

console.log([...fifthPowers].reduce((acc, cur) => acc + cur, 0));