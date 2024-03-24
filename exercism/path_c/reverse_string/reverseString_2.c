#include "reverse_string.h"
#include <stdlib.h>
#include <string.h>

char *reverse(const char *value) {
    if (!value) return NULL;
    
    int len = strlen(value);
    char* reversed = calloc(len + 1, sizeof(char));
    
    for (reversed += len; *value; value++)
        *(--reversed) = *value;

    return reversed;
}