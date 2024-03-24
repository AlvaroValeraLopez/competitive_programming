function coinSums(total) {
	const coins = [1, 2, 5, 10, 20, 50, 100, 200]; // pence
	let ways = new Array(total + 1).fill(0);
	ways[0] = 1; // There is 1 way to make 0 pence
	
	for (let coin of coins) {
		for (let j = coin; j <= total; j++) {
			ways[j] += ways[j - coin];
		}
	}

	return ways[total];
}
  
const numberOfWays = coinSums(200); // 200 pence is equivalent to £2
console.log(numberOfWays);
  