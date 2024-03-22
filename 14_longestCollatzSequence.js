function collatzSequenceLength(n) {
    let length = 1;
    while (n !== 1) {
        n = (n % 2 === 0) ? (n / 2) : (3 * n + 1);
        length++;
    }
    return length;
}

function findLongestCollatzUnderOneMillion() {
    let maxLength = 0;
    let numberWithMaxLength = 0;

    for (let i = 1; i < 1000000; i++) {
        const currentLength = collatzSequenceLength(i);
        if (currentLength > maxLength) {
            maxLength = currentLength;
            numberWithMaxLength = i;
        }
    }

    return numberWithMaxLength;
}

// This will start the process to find the number with the longest Collatz sequence under one million
console.log(findLongestCollatzUnderOneMillion());
