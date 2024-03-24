#include "hamming.h"
#include <string.h>

int compute(const char *lhs, const char *rhs){
    if(strlen(lhs) != strlen(rhs)){return -1;}
    int diff = 0;
    int len = strlen(lhs);
    
    for(int i = 0; i < len; i++){
        if(lhs[i] != rhs[i]){++diff;}
    }
    return diff;
}