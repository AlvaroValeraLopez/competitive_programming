#include "armstrong_numbers.h"
#include <stdio.h>
#include <math.h>

bool is_armstrong_number(int num) {
    int numCopy, summation=0, n=0, i=0;
    for (numCopy = num; numCopy != 0; ++i) {
        numCopy /= 10;
    }
    for (numCopy = num; numCopy != 0; numCopy /= 10) {
        n = numCopy % 10;
        summation += pow(n, i);
    }
    return summation == num;
}