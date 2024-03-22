function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

function lcmOfArray(numbers) {
    let currentLcm = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        currentLcm = lcm(currentLcm, numbers[i]);
    }
    return currentLcm;
}

const MAX = 10
const numbers = Array.from({length: MAX}, (_, i) => i + 1);
const result = lcmOfArray(numbers);
console.log(`The LCM of the list is: ${result}`);
