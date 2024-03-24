#include "grains.h"

uint64_t square(uint8_t i){
    if(i == 0 || i > 64){return 0;}
    return 1ULL << (i - 1);
}
uint64_t total(void){
    unsigned long long summation = 0;
    for(int i = 0; i <= 64; i++){ summation += square(i); }
    return summation;
}