#include "nth_prime.h"

bool isPrime(int number) {
    if (number <= 3) return true;
    if (number % 2 == 0 || number % 3 == 0) return false;
    
    for (int i = 5; i * i <= number; i += 6) {
        if (number % i == 0 || number % (i + 2) == 0) return false;
    }
    return true;
}

uint32_t nth(uint32_t n) {
    if(!n) { return 0; }
    
    uint32_t count = 0, num = 1;

    while (count < n) {
        if (isPrime(++num)) { count++; }
    }

    return num;
}