"""Lo que afirman los vídeos del test de primalidad, la criba de Eratóstenes y la
factorización en primos, comprobado antes de renderizarlos."""

from math import isqrt, prod

import pytest

from euler_video.matematicas import (
    divisores,
    es_primo,
    factorizar,
    pares_de_divisores,
    pasos_criba,
    pasos_factorizacion,
)


def primos_por_fuerza_bruta(n: int) -> list[int]:
    return [k for k in range(2, n + 1) if all(k % d for d in range(2, k))]


# --- Test de primalidad ---


def test_es_primo_coincide_con_la_definicion():
    assert [k for k in range(2000) if es_primo(k)] == primos_por_fuerza_bruta(1999)


@pytest.mark.parametrize("n", range(1, 3000))
def test_el_menor_de_cada_pareja_de_divisores_no_pasa_de_la_raiz(n):
    pares = pares_de_divisores(n)
    assert sorted({x for par in pares for x in par}) == divisores(n)
    for d, e in pares:
        assert d * e == n and d <= isqrt(n) <= e


def test_los_ejemplos_del_video():
    assert pares_de_divisores(36) == [(1, 36), (2, 18), (3, 12), (4, 9), (6, 6)]
    assert es_primo(97) and isqrt(97) == 9
    assert all(97 % d for d in range(2, 10))
    assert not es_primo(91) and 91 == 7 * 13


# --- Criba de Eratóstenes ---


@pytest.mark.parametrize("n", [2, 10, 30, 100, 101, 1000, 4096])
def test_la_criba_deja_exactamente_los_primos(n):
    tachados = {m for _, multiplos in pasos_criba(n) for m in multiplos}
    assert [k for k in range(2, n + 1) if k not in tachados] == primos_por_fuerza_bruta(n)


@pytest.mark.parametrize("n", [30, 100, 1000])
def test_solo_criban_los_primos_hasta_la_raiz(n):
    cribadores = [p for p, _ in pasos_criba(n)]
    assert cribadores == [p for p in primos_por_fuerza_bruta(n) if p * p <= n]


@pytest.mark.parametrize("n", [30, 100, 1000])
def test_cada_compuesto_lo_tacha_primero_su_menor_factor_primo(n):
    primero = {}
    for p, multiplos in pasos_criba(n):
        for m in multiplos:
            primero.setdefault(m, p)
    for m, p in primero.items():
        assert p == factorizar(m)[0][0]


@pytest.mark.parametrize("n", [30, 100, 1000])
def test_los_multiplos_por_debajo_de_p_al_cuadrado_ya_estaban_tachados(n):
    tachados: set[int] = set()
    for p, multiplos in pasos_criba(n):
        anteriores = set(range(2 * p, p * p, p))
        assert anteriores <= tachados
        tachados |= set(multiplos)


def test_el_ejemplo_del_video():
    pasos = pasos_criba(100)
    assert [p for p, _ in pasos] == [2, 3, 5, 7]
    tachados = {m for _, multiplos in pasos for m in multiplos}
    assert len([k for k in range(2, 101) if k not in tachados]) == 25


# --- Factorización en primos ---


@pytest.mark.parametrize("n", range(2, 5000))
def test_la_factorizacion_por_tanteo_es_correcta(n):
    pasos, parada = pasos_factorizacion(n)
    factores = [f for _, f, _ in pasos]
    assert prod(factores) == n
    assert all(es_primo(f) for f in factores)
    assert factores == sorted(factores)
    # Cada paso divide al n que había, y el siguiente parte del cociente.
    actual = n
    for antes, f, fallidos in pasos:
        assert antes == actual and antes % f == 0
        assert all(antes % c for c in fallidos)
        actual //= f
    # Se para cuando el candidato al cuadrado pasa de lo que queda.
    ultimo_antes, ultimo, _ = pasos[-1]
    if ultimo == ultimo_antes:  # quedó un primo sin dividir dentro del bucle
        assert parada * parada > ultimo


def test_el_ejemplo_del_video():
    # Coincide con la tabla de la web: se prueban del 2 al 13 y se para en 14² = 196 > 29.
    pasos, parada = pasos_factorizacion(13195)
    assert pasos == [
        (13195, 5, [2, 3, 4]),
        (2639, 7, [5, 6]),
        (377, 13, [7, 8, 9, 10, 11, 12]),
        (29, 29, [13]),
    ]
    assert parada == 14 and parada * parada > 29


def test_el_segundo_ejemplo_de_la_web():
    # 2520: el 2 divide tres veces, el 3 dos, el 4 no, el 5 una y se para en 6² = 36 > 7.
    pasos, parada = pasos_factorizacion(2520)
    assert [(antes, f) for antes, f, _ in pasos] == [
        (2520, 2), (1260, 2), (630, 2), (315, 3), (105, 3), (35, 5), (7, 7),
    ]  # fmt: skip
    assert parada == 6
