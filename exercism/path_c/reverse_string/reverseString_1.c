#include "reverse_string.h"
#include <stdlib.h>
#include <string.h>

char *reverse(const char *str) {
    int length = strlen(str);
    char *reversed = (char *)malloc(length + 1);
    if (reversed != NULL) {
        for (int i = 0; i < length; i++) {
            reversed[i] = str[length - 1 - i];
        }
        reversed[length] = '\0';
    }
    return reversed;
}