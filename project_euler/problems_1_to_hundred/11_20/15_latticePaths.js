function factorial(n) {
    let result = 1n; // Using BigInt for large numbers
    for (let i = 2n; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  
  function binomialCoefficient(n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
  }
  
  // Calculate the number of lattice paths for a 20x20 grid
  const numberOfPaths = binomialCoefficient(40, 20);
  console.log('Number of lattice paths for a 20x20 grid = ', numberOfPaths);
  