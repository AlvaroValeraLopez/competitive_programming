"""Lo que afirman los vídeos de las congruencias y el orden multiplicativo, comprobado
antes de renderizarlos."""

from datetime import date
from math import gcd

import pytest

from euler_video.matematicas import (
    ciclo_multiplicativo,
    ciclos_multiplicativos,
    division_larga,
    es_bisiesto,
    es_primo,
    primeros_de_mes,
)


def dia_de_la_semana(fecha: date) -> int:
    """0 = domingo, como en los vídeos (datetime usa 0 = lunes)."""
    return (fecha.weekday() + 1) % 7


# --- Congruencias ---


@pytest.mark.parametrize("anio", range(1890, 2110))
def test_los_primeros_de_mes_coinciden_con_el_calendario(anio):
    filas = primeros_de_mes(anio, dia_de_la_semana(date(anio, 1, 1)))
    assert [dia for _, dia, _ in filas] == [dia_de_la_semana(date(anio, m, 1)) for m in range(1, 13)]
    assert sum(dias for _, _, dias in filas) == (366 if es_bisiesto(anio) else 365)


def test_los_bisiestos():
    assert not es_bisiesto(1900) and es_bisiesto(2000) and es_bisiesto(1904) and not es_bisiesto(1901)


def test_el_ejemplo_del_video_de_congruencias():
    assert dia_de_la_semana(date(1900, 1, 1)) == 1 and dia_de_la_semana(date(1901, 1, 1)) == 2
    filas = primeros_de_mes(1901, 2)
    assert [mes for mes, dia, _ in filas if dia == 0] == ["septiembre", "diciembre"]
    assert (2 + 100) % 7 == 4  # 100 días después de un martes, jueves
    assert [pow(7, k, 10) for k in range(1, 5)] == [7, 9, 3, 1] and pow(7, 100, 10) == 1
    assert all(a % 7 == b % 7 for a, b in [(3, 10), (10, 17), (17, 24)])


# --- Orden multiplicativo ---


def orden(a, n):
    k, r = 1, a % n
    while r != 1:
        r = r * a % n
        k += 1
    return k


@pytest.mark.parametrize("p", [p for p in range(3, 400) if es_primo(p) and p != 5])
def test_los_ciclos_parten_los_restos_en_trozos_iguales(p):
    ciclos = ciclos_multiplicativos(10, p)
    restos = sorted(r for c in ciclos for r in c)
    assert restos == list(range(1, p))
    assert all(len(c) == orden(10, p) for c in ciclos)
    assert (p - 1) % orden(10, p) == 0 and len(ciclos) * orden(10, p) == p - 1


@pytest.mark.parametrize("n", range(2, 300))
def test_cada_ciclo_mide_el_orden(n):
    for a in range(2, n):
        if gcd(a, n) == 1:
            assert len(ciclo_multiplicativo(a, n, 1)) == orden(a, n)


@pytest.mark.parametrize("d", [d for d in range(3, 500) if gcd(d, 10) == 1])
def test_la_division_larga_repite_con_periodo_el_orden(d):
    k = orden(10, d)
    pasos = division_larga(d, 2 * k)
    cifras = [c for _, c, _ in pasos]
    assert cifras[:k] == cifras[k:]
    assert [r for _, _, r in pasos[:k]] == [pow(10, i, d) for i in range(1, k + 1)]
    # Las cifras son las de 1/d.
    assert int("".join(map(str, cifras[:k]))) == (10**k - 1) // d


def test_los_ejemplos_del_video_de_orden():
    assert ciclo_multiplicativo(10, 7, 1) == [1, 3, 2, 6, 4, 5]
    assert [c for _, c, _ in division_larga(7, 6)] == [1, 4, 2, 8, 5, 7]
    assert ciclos_multiplicativos(10, 13) == [[1, 10, 9, 12, 3, 4], [2, 7, 5, 11, 6, 8]]
    assert [c for _, c, _ in division_larga(13, 6)] == [0, 7, 6, 9, 2, 3]
    assert [c for _, c, _ in division_larga(13, 6, numerador=2)] == [1, 5, 3, 8, 4, 6]
    assert [r for r, _, _ in division_larga(13, 6, numerador=2)] == ciclo_multiplicativo(10, 13, 2)
