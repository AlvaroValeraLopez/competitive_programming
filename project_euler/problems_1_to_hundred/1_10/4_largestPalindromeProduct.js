function isPalindrome(num) {
  const str = num.toString();
  const reversedStr = str.split('').reverse().join('');
  return str === reversedStr;
}

function findLargestPalindrome() {
  let largestPalindrome = 0;
  let factorA = 0, factorB = 0;

  for (let i = 999; i >= 100; i--) {
    for (let j = 999; j >= 100; j--) {
      const product = i * j;
      if (product < largestPalindrome) {
        break;
      }
      if (isPalindrome(product)) {
        largestPalindrome = product;
        factorA = i;
        factorB = j;
      }
    }
  }

  console.log(`The largest palindrome made from the product of two-digit numbers is: ${largestPalindrome} = ${factorA} x ${factorB}`);
  return largestPalindrome;
}
  
console.log( findLargestPalindrome() );
  