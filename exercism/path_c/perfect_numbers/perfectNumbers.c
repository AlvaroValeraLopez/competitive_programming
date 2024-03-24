#include "perfect_numbers.h"
#include <stdio.h>

kind classify_number(int n) {
    if (n <= 0) { return ERROR; }

    int sum = 0;
    for (int i = 1; i <= n / 2; i++) {
        if (n % i == 0) { sum += i; }
    }

    if (sum == n) { return PERFECT_NUMBER; }
    if (sum > n) { return ABUNDANT_NUMBER; }
    return DEFICIENT_NUMBER; 
}