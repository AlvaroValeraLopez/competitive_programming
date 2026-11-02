"""Las matemáticas que muestran los vídeos, separadas del dibujo.

Las escenas construyen lo que se ve en pantalla a partir de estas funciones,
y los tests las comprueban contra cálculos independientes. Así, lo que dice un
vídeo está verificado antes de renderizarlo.

Este módulo no importa Manim, para que los tests sean rápidos.
"""

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
