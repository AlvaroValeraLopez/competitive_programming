"""Lo que afirman los vídeos de la suma de cuadrados, la sucesión de Fibonacci y las
ternas pitagóricas, comprobado antes de renderizarlos."""

from fractions import Fraction
from math import gcd, isqrt

import pytest

from euler_video.matematicas import (
    capas_en_l,
    casillas_pitagoras,
    descarte_euclides,
    espiral_fibonacci,
    fibonacci,
    rectangulo,
    rectangulo_tres_copias,
    terna_euclides,
    triangular,
)

# --- Suma de cuadrados ---


@pytest.mark.parametrize("j", range(1, 15))
def test_las_capas_en_l_parten_el_cuadrado(j):
    capas = capas_en_l(j)
    casillas = [celda for capa in capas for celda in capa]
    assert len(casillas) == len(set(casillas)) == j * j
    assert set(casillas) == rectangulo(j, j)
    for i, capa in enumerate(capas, start=1):
        assert len(capa) == 2 * i - 1
        assert all(max(celda) == i - 1 for celda in capa)


@pytest.mark.parametrize("j", range(1, 15))
def test_cada_capa_es_un_camino_que_se_puede_enderezar(j):
    # Dos casillas seguidas del recorrido comparten un lado.
    for capa in capas_en_l(j):
        for (f1, c1), (f2, c2) in zip(capa, capa[1:]):
            assert abs(f1 - f2) + abs(c1 - c2) == 1


@pytest.mark.parametrize("n", range(1, 16))
def test_tres_copias_llenan_el_rectangulo_sin_huecos_ni_solapes(n):
    izquierda, derecha, centro = rectangulo_tres_copias(n)
    casillas = []
    for k in range(1, n + 1):
        for esquinas in (izquierda, derecha):
            f0, c0 = esquinas[k]
            casillas += [(f0 + f, c0 + c) for f in range(k) for c in range(k)]
    for j in range(1, n + 1):
        capas = capas_en_l(j)
        for i in range(1, j + 1):
            destino = centro[(j, i)]
            assert len(destino) == len(capas[i - 1])
            # La capa enderezada es una fila de casillas seguidas.
            assert len({f for f, _ in destino}) == 1
            assert [c for _, c in destino] == list(range(destino[0][1], destino[0][1] + len(destino)))
            casillas += destino
    assert len(casillas) == len(set(casillas)) == 3 * sum(k * k for k in range(1, n + 1))
    assert set(casillas) == rectangulo(triangular(n), 2 * n + 1)


@pytest.mark.parametrize("n", range(1, 300))
def test_la_formula_de_la_suma_de_cuadrados(n):
    assert 3 * sum(k * k for k in range(1, n + 1)) == (2 * n + 1) * triangular(n)
    assert sum(k * k for k in range(1, n + 1)) == n * (n + 1) * (2 * n + 1) // 6


def test_el_ejemplo_del_video_de_cuadrados():
    assert sum(k * k for k in range(1, 5)) == 30
    assert (triangular(4), 2 * 4 + 1) == (10, 9) and 9 * 10 == 3 * 30


# --- Fibonacci ---


def test_fibonacci_por_la_definicion():
    assert fibonacci(12) == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]


@pytest.mark.parametrize("cuantos", range(1, 25))
def test_la_espiral_llena_un_rectangulo_de_fibonacci(cuantos):
    f = fibonacci(cuantos + 1)
    cuadrados = espiral_fibonacci(cuantos)
    assert [lado for _, _, lado in cuadrados] == f[1 : cuantos + 1]
    # Sin solapes: los interiores de dos cuadrados distintos no se cortan.
    for i, (x1, y1, l1) in enumerate(cuadrados):
        for x2, y2, l2 in cuadrados[i + 1 :]:
            assert x1 + l1 <= x2 or x2 + l2 <= x1 or y1 + l1 <= y2 or y2 + l2 <= y1
    # Sin huecos: el área de los cuadrados es la del rectángulo que los encierra, F_n × F_(n+1).
    x0 = min(x for x, _, _ in cuadrados)
    x1 = max(x + l for x, _, l in cuadrados)
    y0 = min(y for _, y, _ in cuadrados)
    y1 = max(y + l for _, y, l in cuadrados)
    assert sorted((x1 - x0, y1 - y0)) == [f[cuantos], f[cuantos + 1]]
    assert sum(lado * lado for _, _, lado in cuadrados) == (x1 - x0) * (y1 - y0) == f[cuantos] * f[cuantos + 1]


def test_uno_de_cada_tres_es_par():
    f = fibonacci(300)
    assert all((f[n] % 2 == 0) == (n % 3 == 0) for n in range(301))


def test_las_proporciones_se_acercan_a_la_razon_aurea():
    # Con fracciones exactas: para q > 1/2, q > φ equivale a (2q − 1)² > 5. Las proporciones
    # caen alternativamente a un lado y a otro de φ, y la distancia entre dos seguidas se
    # estrecha, así que se acercan a φ.
    f = fibonacci(60)
    proporciones = [Fraction(f[n + 1], f[n]) for n in range(1, 60)]
    por_encima = [(2 * q - 1) ** 2 > 5 for q in proporciones]
    assert por_encima == [n % 2 == 0 for n in range(1, 60)]
    anchos = [abs(b - a) for a, b in zip(proporciones, proporciones[1:])]
    assert all(b < a for a, b in zip(anchos, anchos[1:]))


def test_el_ejemplo_del_video_de_fibonacci():
    assert [lado for _, _, lado in espiral_fibonacci(8)] == [1, 1, 2, 3, 5, 8, 13, 21]
    assert sum(lado * lado for _, _, lado in espiral_fibonacci(8)) == 21 * 34 == 714
    assert round(34 / 21, 3) == 1.619 and round((1 + 5**0.5) / 2, 3) == 1.618


# --- Ternas pitagóricas ---


def primitivas_por_fuerza_bruta(hasta: int) -> set[tuple[int, int, int]]:
    """Ternas primitivas con c ≤ hasta, con el cateto par en segundo lugar."""
    ternas = set()
    for c in range(1, hasta + 1):
        for a in range(1, c):
            b2 = c * c - a * a
            b = isqrt(b2)
            if b * b == b2 and b > 0 and b % 2 == 0 and gcd(a, b) == 1:
                ternas.add((a, b, c))
    return ternas


def test_euclides_da_cada_terna_primitiva_exactamente_una_vez():
    hasta = 400
    generadas = []
    for m in range(2, isqrt(hasta) + 1):
        for n in range(1, m):
            if descarte_euclides(m, n) is None and m * m + n * n <= hasta:
                generadas.append(terna_euclides(m, n))
    assert len(generadas) == len(set(generadas))
    assert set(generadas) == primitivas_por_fuerza_bruta(hasta)


@pytest.mark.parametrize("m", range(2, 30))
def test_los_pares_descartados_no_dan_ternas_primitivas(m):
    for n in range(1, m):
        a, b, c = terna_euclides(m, n)
        assert a * a + b * b == c * c
        assert (gcd(a, b) == 1) == (descarte_euclides(m, n) is None)


def test_los_descartes_del_video():
    assert descarte_euclides(3, 1) == "los dos impares" and terna_euclides(3, 1) == (8, 6, 10)
    assert descarte_euclides(4, 2) == "no coprimos" and terna_euclides(4, 2) == (12, 16, 20)


@pytest.mark.parametrize("terna", [(3, 4, 5), (5, 12, 13), (7, 24, 25), (9, 40, 41)])
def test_las_casillas_de_a_rellenan_el_hueco_de_c(terna):
    a, b, c = terna
    origen, destino, fijas = casillas_pitagoras(a, b, c)
    assert set(origen) == rectangulo(a, a) and len(origen) == a * a
    assert len(destino) == len(set(destino)) == a * a
    assert set(destino) | set(fijas) == rectangulo(c, c)
    assert not set(destino) & set(fijas)
