#include "grains.h"

uint64_t square(uint8_t i){
    return (i <= 0 || i > 64) ? 0 : 1ULL << (i - 1);
}

uint64_t total(void){
    // UINT64_MAX == (1ULL << 64) - 1;
    return UINT64_MAX;
}