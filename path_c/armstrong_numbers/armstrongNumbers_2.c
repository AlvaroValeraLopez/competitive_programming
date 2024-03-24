#include "armstrong_numbers.h"
#include <stdio.h>
#include <math.h>

bool is_armstrong_number(int num) {
    int numCopy, i, summation=0, n=0;

    i= log10(num) + 1;

    for (numCopy = num; numCopy != 0; numCopy /= 10) {
        n = numCopy % 10;
        summation += pow(n, i);
    }

    return summation == num;
}