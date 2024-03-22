const fs = require('fs');

fs.readFile('triangle.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  
  // Parse the triangle into a two-dimensional array
  let triangle = data.split('\n')
                     .filter(line => line !== '')
                     .map(line => line.split(' ').map(Number));
                     
  console.log(maximumPathSum(triangle));
});

function maximumPathSum(triangle) {
  // Start from the second to last row and move upwards to the top
  for (let row = triangle.length - 2; row >= 0; row--) {
    for (let col = 0; col < triangle[row].length; col++) {
      // Add the maximum of the two adjacent numbers from the row below to each number
      triangle[row][col] += Math.max(triangle[row + 1][col], triangle[row + 1][col + 1]);
    }
  }
  // The top element now contains the maximum total
  return triangle[0][0];
}
