function findFibonacciIndexByLength(digits) {
	let previous = "1";
	let current = "1";
	let index = 2;

	while (current.length < digits) {
		let next = addBigIntStrings(previous, current);

		previous = current;
		current = next;

		index++;
	}

	return index;
}

function addBigIntStrings(str1, str2) {
	let sum = "";
	let carry = 0;
	let i = str1.length - 1;
	let j = str2.length - 1;

	while (i >= 0 || j >= 0 || carry > 0) {
		let digit1 = i >= 0 ? parseInt(str1.charAt(i--)) : 0;
		let digit2 = j >= 0 ? parseInt(str2.charAt(j--)) : 0;
		let digitsSum = digit1 + digit2 + carry;
		sum = (digitsSum % 10) + sum;
		carry = Math.floor(digitsSum / 10);
	}

	return sum;
}

const index = findFibonacciIndexByLength(1000);
console.log(index);
