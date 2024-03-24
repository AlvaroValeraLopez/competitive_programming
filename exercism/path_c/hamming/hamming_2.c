#include "hamming.h"
#include <string.h>

int compute(const char *lhs, const char *rhs){
    if(strlen(lhs) != strlen(rhs) || !lhs || !rhs){return -1;}

    int diff = 0;
    for (; *lhs && *rhs; lhs++, rhs++) {
        if (*lhs != *rhs) { diff++; }
    }

    return diff;
}