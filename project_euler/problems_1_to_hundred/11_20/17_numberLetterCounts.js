function getLetterCount(number) {
  const ones = ['','one','two','three','four','five','six','seven','eight','nine','ten',
                'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

  if (number === 1000) return 'onethousand'.length;

  let count = 0;
  let remaining = number;
  
  if (Math.floor(number / 100) > 0) {
    count += ones[Math.floor(number / 100)].length + 'hundred'.length;
    remaining %= 100;
    if (remaining > 0) count += 'and'.length;  // British usage includes 'and'
  }
  if (remaining > 19) {
    count += tens[Math.floor(remaining / 10)].length;
    remaining %= 10;
  }
  count += ones[remaining].length;

  return count;
}

function countLetters(start, end) {
  let totalLetters = 0;
  for (let i = start; i <= end; i++) {
    totalLetters += getLetterCount(i);
  }
  return totalLetters;
}

const total = countLetters(1, 1000);
console.log(total);
