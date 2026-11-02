"""Lo que afirman los vídeos de inclusión-exclusión, función divisor y coeficientes
binomiales, comprobado contra cálculos independientes antes de renderizarlos."""

from math import comb, prod

import pytest

from euler_video.matematicas import (
    divisores,
    factorizar,
    multiplos,
    numero_divisores,
    subconjuntos,
    tabla_divisores,
    tamano_union,
    triangulo_pascal,
)

# --- Inclusión-exclusión ---


def test_multiplos_del_video():
    assert multiplos(3, 30) == [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]
    assert multiplos(5, 30) == [5, 10, 15, 20, 25, 30]


@pytest.mark.parametrize("a, b", [(3, 5), (2, 3), (4, 6), (6, 10), (7, 7)])
@pytest.mark.parametrize("hasta", [1, 10, 30, 97, 1000])
def test_inclusion_exclusion_coincide_con_contar_uno_a_uno(a, b, hasta):
    contados = sum(1 for n in range(1, hasta + 1) if n % a == 0 or n % b == 0)
    assert tamano_union(set(multiplos(a, hasta)), set(multiplos(b, hasta))) == contados


def test_la_interseccion_son_los_multiplos_del_mcm():
    assert set(multiplos(3, 30)) & set(multiplos(5, 30)) == set(multiplos(15, 30))
    # Con números que comparten factores, no es el producto: 4 y 6 → 12, no 24.
    assert set(multiplos(4, 100)) & set(multiplos(6, 100)) == set(multiplos(12, 100))


# --- Función divisor ---


def test_factorizacion_del_video():
    assert factorizar(72) == [(2, 3), (3, 2)]


@pytest.mark.parametrize("n", range(2, 2001))
def test_la_factorizacion_reconstruye_el_numero_con_primos(n):
    factores = factorizar(n)
    assert prod(p**e for p, e in factores) == n
    assert all(divisores(p) == [1, p] for p, _ in factores)
    assert [p for p, _ in factores] == sorted({p for p, _ in factores})


@pytest.mark.parametrize("n", range(1, 2001))
def test_la_formula_de_d_n_coincide_con_contar_divisores(n):
    assert numero_divisores(n) == len(divisores(n))


@pytest.mark.parametrize("n", [6, 12, 18, 36, 72, 100, 200, 675])
def test_la_tabla_contiene_exactamente_los_divisores(n):
    tabla = tabla_divisores(n)
    valores = [v for fila in tabla for v in fila]
    assert sorted(valores) == divisores(n)
    assert len(valores) == len(set(valores)) == numero_divisores(n)


def test_la_tabla_exige_dos_primos():
    with pytest.raises(ValueError):
        tabla_divisores(30)  # 2 · 3 · 5


# --- Coeficientes binomiales ---


def test_cada_numero_del_triangulo_es_un_coeficiente_binomial():
    for n, fila in enumerate(triangulo_pascal(20)):
        assert fila == [comb(n, k) for k in range(n + 1)]


def test_las_filas_suman_potencias_de_dos():
    for n, fila in enumerate(triangulo_pascal(20)):
        assert sum(fila) == 2**n


def test_los_subconjuntos_del_video():
    pares = subconjuntos("abcd", 2)
    assert pares == ["ab", "ac", "ad", "bc", "bd", "cd"]
    assert len(pares) == triangulo_pascal(5)[4][2] == comb(4, 2)


@pytest.mark.parametrize("n", range(7))
def test_hay_tantos_subconjuntos_como_dice_el_triangulo(n):
    letras = "abcdefg"[:n]
    for k in range(n + 1):
        assert len(set(subconjuntos(letras, k))) == triangulo_pascal(n + 1)[n][k]
