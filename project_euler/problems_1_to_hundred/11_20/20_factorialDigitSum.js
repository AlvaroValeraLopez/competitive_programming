function factorial(n) {
	let result = BigInt(1); // Use BigInt for handling very large numbers
	for (let i = BigInt(2); i <= n; i++) {
		result *= i;
	}
	return result;
}
  
function sumOfDigits(n) {
  return n.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
}
  
const factorial100 = factorial(BigInt(10));
const sum = sumOfDigits(factorial100);
console.log(sum);
  