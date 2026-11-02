"""Las matemáticas que muestran los vídeos, separadas del dibujo.

Las escenas construyen lo que se ve en pantalla a partir de estas funciones,
y los tests las comprueban contra cálculos independientes. Así, lo que dice un
vídeo está verificado antes de renderizarlo.

Este módulo no importa Manim, para que los tests sean rápidos.
"""

from itertools import combinations
from math import prod

Celda = tuple[int, int]
"""Una casilla de una cuadrícula: (fila, columna), con la fila 0 arriba."""


def triangular(n: int) -> int:
    """T(n) = 1 + 2 + ... + n, con la fórmula de Gauss."""
    return n * (n + 1) // 2


def escalera(n: int) -> set[Celda]:
    """Escalera de n filas: la fila f tiene f + 1 casillas, pegadas a la izquierda."""
    return {(f, c) for f in range(n) for c in range(f + 1)}


def complemento_escalera(n: int) -> set[Celda]:
    """Lo que le falta a la escalera para llenar un rectángulo de n × (n + 1)."""
    return {(f, c) for f in range(n) for c in range(f + 1, n + 1)}


def rectangulo(filas: int, columnas: int) -> set[Celda]:
    return {(f, c) for f in range(filas) for c in range(columnas)}


def girar_180(celdas: set[Celda], filas: int, columnas: int) -> set[Celda]:
    """Gira las casillas media vuelta alrededor del centro de un rectángulo filas × columnas."""
    return {(filas - 1 - f, columnas - 1 - c) for f, c in celdas}


# --- Inclusión-exclusión ---


def multiplos(k: int, hasta: int) -> list[int]:
    """Múltiplos de k entre 1 y `hasta`, ambos incluidos."""
    return list(range(k, hasta + 1, k))


def tamano_union(a: set[int], b: set[int]) -> int:
    """|A ∪ B| contado con inclusión-exclusión: |A| + |B| − |A ∩ B|."""
    return len(a) + len(b) - len(a & b)


# --- Función divisor ---


def factorizar(n: int) -> list[tuple[int, int]]:
    """Factorización en primos: [(p, e), …] con los primos en orden creciente."""
    factores = []
    p = 2
    while p * p <= n:
        e = 0
        while n % p == 0:
            n //= p
            e += 1
        if e:
            factores.append((p, e))
        p += 1
    if n > 1:
        factores.append((n, 1))
    return factores


def divisores(n: int) -> list[int]:
    """Todos los divisores de n, probando uno a uno (sin usar la factorización)."""
    return [d for d in range(1, n + 1) if n % d == 0]


def numero_divisores(n: int) -> int:
    """d(n) = (e₁ + 1)(e₂ + 1)⋯ a partir de la factorización."""
    return prod(e + 1 for _, e in factorizar(n))


def tabla_divisores(n: int) -> list[list[int]]:
    """Para n = pᵃ · qᵇ, la tabla de sus divisores: la fila i y la columna j valen pⁱ · qʲ."""
    factores = factorizar(n)
    if len(factores) != 2:
        raise ValueError(f"{n} no tiene exactamente dos factores primos distintos: {factores}")
    (p, a), (q, b) = factores
    return [[p**i * q**j for j in range(b + 1)] for i in range(a + 1)]


# --- Coeficientes binomiales ---


def triangulo_pascal(filas: int) -> list[list[int]]:
    """Las filas 0 a filas − 1 del triángulo de Pascal: cada número es la suma de los dos de encima."""
    triangulo = [[1]]
    for n in range(1, filas):
        anterior = triangulo[-1]
        triangulo.append([1] + [anterior[k - 1] + anterior[k] for k in range(1, n)] + [1])
    return triangulo


def subconjuntos(elementos: str, k: int) -> list[str]:
    """Las formas de elegir k elementos sin importar el orden: «abcd», 2 → ab, ac, ad, bc, bd, cd."""
    return ["".join(c) for c in combinations(elementos, k)]


# --- Máximo común divisor y mínimo común múltiplo ---

Cuadrado = tuple[int, int, int]
"""Un cuadrado dentro de un rectángulo: (x, y, lado), con (0, 0) en la esquina inferior izquierda."""


def pasos_euclides(a: int, b: int) -> list[tuple[int, int, int, int]]:
    """Las divisiones del algoritmo de Euclides: (a, b, cociente, resto), hasta que el resto es 0."""
    pasos = []
    while b:
        cociente, resto = divmod(a, b)
        pasos.append((a, b, cociente, resto))
        a, b = b, resto
    return pasos


def cuadrados_euclides(ancho: int, alto: int) -> list[list[Cuadrado]]:
    """Llena un rectángulo ancho × alto con los cuadrados más grandes que quepan, como Euclides.

    Devuelve un grupo de cuadrados por cada división del algoritmo: en cada paso
    se quitan del lado largo tantos cuadrados del lado corto como quepan.
    """
    grupos = []
    x, y, w, h = 0, 0, ancho, alto
    while w and h:
        if w >= h:
            cuantos = w // h
            grupos.append([(x + i * h, y, h) for i in range(cuantos)])
            x, w = x + cuantos * h, w - cuantos * h
        else:
            cuantos = h // w
            grupos.append([(x, y + i * w, w) for i in range(cuantos)])
            y, h = y + cuantos * w, h - cuantos * w
    return grupos


def exponentes(n: int) -> dict[int, int]:
    """Exponente de cada primo en la factorización de n."""
    return dict(factorizar(n))
