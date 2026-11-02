"""Lo que afirman los vídeos de la precisión arbitraria, el principio de optimalidad y el
cambio de monedas, comprobado antes de renderizarlos."""

import random
from itertools import product

import pytest

from euler_video.matematicas import (
    camino_voraz,
    como_doble,
    formas_de_pagar,
    mejor_camino,
    mejor_desde_cada_casilla,
    suma_con_llevadas,
    tabla_cambio,
)

# --- Precisión arbitraria ---


def numero_de_columnas(columnas: list[tuple[int, int, int, int, int]]) -> int:
    return sum(escrita * 10**i for i, (_, _, _, escrita, _) in enumerate(columnas))


@pytest.mark.parametrize("semilla", range(300))
def test_la_suma_con_llevadas_es_la_suma(semilla):
    azar = random.Random(semilla)
    a, b = azar.randrange(10**azar.randint(1, 40)), azar.randrange(10**azar.randint(1, 40))
    columnas = suma_con_llevadas(a, b)
    assert numero_de_columnas(columnas) == a + b
    # La llevada nunca pasa de 1, y la que sale de una columna es la que entra en la siguiente.
    assert all(entra in (0, 1) and sale in (0, 1) for _, _, entra, _, sale in columnas)
    assert all(columnas[i][4] == columnas[i + 1][2] for i in range(len(columnas) - 1))
    for x, y, entra, escrita, sale in columnas:
        assert x + y + entra == escrita + 10 * sale


def test_el_ejemplo_del_video_de_precision():
    a = 2**63
    columnas = suma_con_llevadas(a, a)
    assert numero_de_columnas(columnas) == 2**64 == 18446744073709551616
    assert len(columnas) == 20 and len(str(a)) == 19


def test_el_limite_de_los_numeros_de_coma_flotante():
    base = 2**53
    assert all(como_doble(n) == n for n in range(base - 1000, base + 1))
    # Por encima de 2^53 solo quedan los pares, y los impares se redondean al par
    # cuya mantisa es par (los empates van «al par»).
    assert [como_doble(base + k) - base for k in range(-2, 7)] == [-2, -1, 0, 0, 2, 4, 4, 4, 6]
    assert all(como_doble(base + k) == base + k for k in range(0, 1000, 2))
    assert all(como_doble(base + k) != base + k for k in range(1, 1000, 2))


# --- Principio de optimalidad ---


def todos_los_caminos(triangulo):
    for giros in product((0, 1), repeat=len(triangulo) - 1):
        camino = [0]
        for g in giros:
            camino.append(camino[-1] + g)
        yield camino


def suma(triangulo, camino):
    return sum(triangulo[i][j] for i, j in enumerate(camino))


@pytest.mark.parametrize("semilla", range(200))
def test_la_programacion_dinamica_da_el_mejor_camino(semilla):
    azar = random.Random(semilla)
    filas = azar.randint(1, 9)
    triangulo = [[azar.randint(0, 99) for _ in range(i + 1)] for i in range(filas)]
    m = mejor_desde_cada_casilla(triangulo)
    mejor = max(suma(triangulo, c) for c in todos_los_caminos(triangulo))
    assert m[0][0] == mejor
    assert suma(triangulo, mejor_camino(triangulo)) == mejor
    # Cada M(i, j) es el mejor camino que empieza en (i, j).
    for i in range(filas):
        for j in range(i + 1):
            sub = [fila[j : j + k + 1] for k, fila in enumerate(triangulo[i:])]
            assert m[i][j] == max(suma(sub, c) for c in todos_los_caminos(sub))


def test_los_ejemplos_del_video_de_optimalidad():
    ejemplo = [[3], [7, 4], [2, 4, 6], [8, 5, 9, 3]]
    assert mejor_desde_cada_casilla(ejemplo) == [[23], [20, 19], [10, 13, 15], [8, 5, 9, 3]]
    assert [ejemplo[i][j] for i, j in enumerate(mejor_camino(ejemplo))] == [3, 7, 4, 9]
    trampa = [[1], [2, 3], [9, 1, 1]]
    assert suma(trampa, camino_voraz(trampa)) == 5
    assert suma(trampa, mejor_camino(trampa)) == 12


# --- Cambio de monedas ---


def formas_por_fuerza_bruta(monedas, n):
    rangos = [range(n // c + 1) for c in monedas]
    return sum(1 for cuantas in product(*rangos) if sum(a * c for a, c in zip(cuantas, monedas)) == n)


@pytest.mark.parametrize("monedas", [[1], [1, 2], [1, 2, 5], [1, 2, 5, 10], [2, 3, 7], [1, 3, 4]])
def test_la_tabla_cuenta_las_formas(monedas):
    n = 30
    tabla = tabla_cambio(monedas, n)
    for i in range(len(monedas)):
        for m in range(n + 1):
            assert tabla[i][m] == formas_por_fuerza_bruta(monedas[: i + 1], m)
            assert tabla[i][m] == len(formas_de_pagar(monedas[: i + 1], m))
            # La recurrencia: sin la moneda i, más con al menos una.
            arriba = tabla[i - 1][m] if i else int(m == 0)
            izquierda = tabla[i][m - monedas[i]] if m >= monedas[i] else 0
            assert tabla[i][m] == arriba + izquierda


@pytest.mark.parametrize("n", range(0, 25))
def test_las_formas_listadas_son_distintas_y_suman_n(n):
    formas = formas_de_pagar([1, 2, 5], n)
    assert len(formas) == len(set(formas))
    assert all(sum(f) == n and list(f) == sorted(f, reverse=True) for f in formas)


def test_los_ejemplos_del_video_de_monedas():
    assert formas_de_pagar([1, 2, 5], 5) == [(5,), (2, 2, 1), (2, 1, 1, 1), (1, 1, 1, 1, 1)]
    tabla = tabla_cambio([1, 2, 5], 10)
    assert tabla[2][10] == tabla[1][10] + tabla[2][5] == 6 + 4 == 10
