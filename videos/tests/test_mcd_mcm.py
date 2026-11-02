"""Lo que afirma el vídeo del máximo común divisor y el mínimo común múltiplo,
comprobado antes de renderizarlo."""

from math import gcd, lcm, prod

import pytest

from euler_video.matematicas import cuadrados_euclides, exponentes, pasos_euclides

PAREJAS = [(48, 18), (1071, 462), (18, 48), (13, 8), (100, 75), (7, 7), (89, 55), (360, 84)]


def test_las_divisiones_del_video():
    assert pasos_euclides(48, 18) == [(48, 18, 2, 12), (18, 12, 1, 6), (12, 6, 2, 0)]


@pytest.mark.parametrize("a", range(1, 120))
@pytest.mark.parametrize("b", range(1, 120, 7))
def test_euclides_da_el_mcd(a, b):
    pasos = pasos_euclides(a, b)
    assert pasos[-1][3] == 0
    assert pasos[-1][1] == gcd(a, b)
    for x, y, q, r in pasos:
        assert x == q * y + r and 0 <= r < y


@pytest.mark.parametrize("ancho, alto", PAREJAS)
def test_los_cuadrados_llenan_el_rectangulo_sin_solaparse(ancho, alto):
    cuadrados = [c for grupo in cuadrados_euclides(ancho, alto) for c in grupo]
    assert sum(lado * lado for _, _, lado in cuadrados) == ancho * alto
    for x, y, lado in cuadrados:
        assert 0 <= x and x + lado <= ancho and 0 <= y and y + lado <= alto
    ocupadas = set()
    for x, y, lado in cuadrados:
        celdas = {(i, j) for i in range(x, x + lado) for j in range(y, y + lado)}
        assert ocupadas.isdisjoint(celdas)
        ocupadas |= celdas
    assert len(ocupadas) == ancho * alto


@pytest.mark.parametrize("ancho, alto", PAREJAS)
def test_cada_grupo_de_cuadrados_es_una_division_de_euclides(ancho, alto):
    grupos = cuadrados_euclides(ancho, alto)
    pasos = pasos_euclides(max(ancho, alto), min(ancho, alto))
    assert [len(g) for g in grupos] == [q for _, _, q, _ in pasos]
    assert [g[0][2] for g in grupos] == [b for _, b, _, _ in pasos]


@pytest.mark.parametrize("ancho, alto", PAREJAS)
def test_el_ultimo_cuadrado_mide_el_mcd_y_cubre_el_rectangulo(ancho, alto):
    lado = cuadrados_euclides(ancho, alto)[-1][0][2]
    assert lado == gcd(ancho, alto)
    assert ancho % lado == 0 and alto % lado == 0


def test_los_exponentes_del_video():
    assert exponentes(48) == {2: 4, 3: 1}
    assert exponentes(18) == {2: 1, 3: 2}


@pytest.mark.parametrize("a", range(2, 80))
@pytest.mark.parametrize("b", range(2, 80, 5))
def test_minimos_y_maximos_de_exponentes_dan_mcd_y_mcm(a, b):
    ea, eb = exponentes(a), exponentes(b)
    primos = set(ea) | set(eb)
    assert prod(p ** min(ea.get(p, 0), eb.get(p, 0)) for p in primos) == gcd(a, b)
    assert prod(p ** max(ea.get(p, 0), eb.get(p, 0)) for p in primos) == lcm(a, b)
    assert a * b // gcd(a, b) == lcm(a, b)
