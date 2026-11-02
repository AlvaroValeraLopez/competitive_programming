"""Las matemáticas que muestran los vídeos, separadas del dibujo.

Las escenas construyen lo que se ve en pantalla a partir de estas funciones,
y los tests las comprueban contra cálculos independientes. Así, lo que dice un
vídeo está verificado antes de renderizarlo.

Este módulo no importa Manim, para que los tests sean rápidos.
"""

from itertools import combinations
from math import gcd, isqrt, prod

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


# --- Números primos ---


def es_primo(n: int) -> bool:
    """Primalidad probando divisores hasta la raíz cuadrada."""
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


def pares_de_divisores(n: int) -> list[tuple[int, int]]:
    """Los divisores de n emparejados (d, n / d), con d ≤ n / d: el menor de cada pareja no pasa de √n."""
    return [(d, n // d) for d in range(1, isqrt(n) + 1) if n % d == 0]


def pasos_criba(n: int) -> list[tuple[int, list[int]]]:
    """Criba de Eratóstenes hasta n: para cada primo p con p² ≤ n, los múltiplos que tacha (de p² a n)."""
    tachado = [False] * (n + 1)
    pasos = []
    for p in range(2, isqrt(n) + 1):
        if not tachado[p]:
            multiplos = list(range(p * p, n + 1, p))
            for m in multiplos:
                tachado[m] = True
            pasos.append((p, multiplos))
    return pasos


def pasos_factorizacion(n: int) -> tuple[list[tuple[int, int, list[int]]], int]:
    """Factorización por tanteo, con el mismo bucle que la web: cada d se divide
    tantas veces como se pueda y luego se pasa a d + 1.

    Devuelve los pasos (n antes de dividir, factor, candidatos que no dividieron
    a ese n antes de encontrar el factor) y el candidato en el que se paró porque
    su cuadrado ya pasaba del n que quedaba. Si queda un n > 1, es primo y es el
    último paso.
    """
    pasos = []
    fallidos: list[int] = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            pasos.append((n, d, fallidos))
            n //= d
            fallidos = []
        fallidos.append(d)  # al salir del bucle interior, d ya no divide al n que queda
        d += 1
    if n > 1:
        pasos.append((n, n, fallidos))
    return pasos, d


# --- Suma de cuadrados ---


def capas_en_l(j: int) -> list[list[Celda]]:
    """Las capas en forma de L de un cuadrado de j × j, de dentro afuera.

    La capa i (i = 1, …, j) son las casillas con max(fila, columna) = i − 1:
    2i − 1 casillas. Cada capa se recorre como un camino, desde lo alto de su
    columna derecha hasta el extremo izquierdo de su fila de abajo, así que al
    «enderezarla» queda una fila en el mismo orden.
    """
    capas = []
    for i in range(1, j + 1):
        borde = i - 1
        capas.append([(f, borde) for f in range(borde)] + [(borde, c) for c in range(borde, -1, -1)])
    return capas


def rectangulo_tres_copias(n: int) -> tuple[dict[int, Celda], dict[int, Celda], dict[tuple[int, int], list[Celda]]]:
    """Tres copias de 1², 2², …, n² rellenan un rectángulo de T(n) filas y 2n + 1 columnas.

    La franja k del rectángulo son las k filas que empiezan en la fila T(k − 1).
    Devuelve:
    - la esquina superior izquierda del cuadrado k de la primera copia (pegado a la izquierda),
    - la del cuadrado k de la segunda copia (pegado a la derecha),
    - para la tercera copia, dónde acaba cada casilla de la capa i del cuadrado j,
      en el orden de `capas_en_l`: la capa se endereza en una fila del hueco central
      de la franja n + 1 − i, que mide justo 2i − 1 casillas.
    """
    izquierda = {k: (triangular(k - 1), 0) for k in range(1, n + 1)}
    derecha = {k: (triangular(k - 1), 2 * n + 1 - k) for k in range(1, n + 1)}
    centro = {}
    for j in range(1, n + 1):
        for i in range(1, j + 1):
            k = n + 1 - i
            fila = triangular(k - 1) + (j - i)
            centro[(j, i)] = [(fila, k + p) for p in range(2 * i - 1)]
    return izquierda, derecha, centro


# --- Fibonacci ---


def fibonacci(n: int) -> list[int]:
    """[F_0, F_1, …, F_n], con F_0 = 0 y F_1 = 1."""
    f = [0, 1]
    while len(f) <= n:
        f.append(f[-1] + f[-2])
    return f[: n + 1]


def espiral_fibonacci(cuantos: int) -> list[tuple[int, int, int]]:
    """Cuadrados de lados F_1, …, F_cuantos pegados en espiral.

    Cada cuadrado se apoya en un lado del rectángulo que forman los anteriores,
    girando: derecha, arriba, izquierda, abajo, derecha… Devuelve (x, y, lado),
    con (x, y) la esquina inferior izquierda en unidades enteras e y hacia arriba.
    El lado de cada cuadrado tiene que coincidir con el lado en el que se apoya:
    es la recurrencia de Fibonacci.
    """
    f = fibonacci(cuantos)
    cuadrados = [(0, 0, 1)]
    x0, y0, x1, y1 = 0, 0, 1, 1
    for k in range(2, cuantos + 1):
        lado = f[k]
        direccion = (k - 2) % 4
        if direccion in (0, 2):
            assert lado == y1 - y0, "el cuadrado no mide lo que el lado en el que se apoya"
            x = x1 if direccion == 0 else x0 - lado
            cuadrados.append((x, y0, lado))
            x0, x1 = min(x0, x), max(x1, x + lado)
        else:
            assert lado == x1 - x0, "el cuadrado no mide lo que el lado en el que se apoya"
            y = y1 if direccion == 1 else y0 - lado
            cuadrados.append((x0, y, lado))
            y0, y1 = min(y0, y), max(y1, y + lado)
    return cuadrados


# --- Ternas pitagóricas ---


def terna_euclides(m: int, n: int) -> tuple[int, int, int]:
    """(m² − n², 2mn, m² + n²)."""
    return m * m - n * n, 2 * m * n, m * m + n * n


def descarte_euclides(m: int, n: int) -> str | None:
    """Por qué el par (m, n), con m > n ≥ 1, no da una terna primitiva, o None si la da."""
    if gcd(m, n) > 1:
        return "no coprimos"
    if (m - n) % 2 == 0:
        return "los dos impares"
    return None


def casillas_pitagoras(a: int, b: int, c: int) -> tuple[list[Celda], list[Celda], list[Celda]]:
    """a² + b² = c² con casillas: el cuadrado de b va a la esquina superior izquierda
    del de c, y las casillas del de a rellenan lo que queda, capa a capa.

    Devuelve las casillas del cuadrado de a (recorridas por capas en L), dónde acaba
    cada una dentro del cuadrado de c, y las casillas del cuadrado de b (que no se mueven
    de su sitio relativo).
    """
    origen = [celda for capa in capas_en_l(a) for celda in capa]
    hueco = [celda for capa in capas_en_l(c)[b:] for celda in capa]
    assert len(origen) == len(hueco), "a² no es c² − b²"
    return origen, hueco, [(f, col) for f in range(b) for col in range(b)]
