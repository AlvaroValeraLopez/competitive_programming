"""Factorización por tanteo de 13195: se prueba d = 2, 3, 4…; cada vez que d divide se
anota y se sigue con el cociente, y se para cuando d² pasa de lo que queda.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/factorizacion.py Factorizacion
"""

from math import isqrt, prod, sqrt

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Create,
    FadeIn,
    Line,
    MathTex,
    RoundedRectangle,
    SurroundingRectangle,
    Text,
    TransformFromCopy,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import es_primo, pasos_factorizacion

N = 13195
X_NUMEROS = -3.3  # borde derecho de la columna de números de la escalera
X_FACTORES = -2.7  # borde izquierdo de la columna de factores
X_RAIZ = -0.7  # centro de la columna √n
X_CANDIDATOS = 0.7  # borde izquierdo de la fila de candidatos
Y_CABECERA = 2.45
Y_PRIMERA = 1.65
SALTO = 0.75


def decimal(x: float) -> str:
    return f"{x:.1f}".replace(".", "{,}")


def y_fila(i: int) -> float:
    return Y_PRIMERA - i * SALTO


def ficha(d: int, divide: bool) -> VGroup:
    numero = MathTex(str(d), font_size=30, color=BLANCO if divide else TEXTO)
    caja = RoundedRectangle(width=0.62, height=0.5, corner_radius=0.08, stroke_width=2)
    if divide:
        caja.set_stroke(AZUL).set_fill(AZUL, opacity=0.3)
    else:
        caja.set_stroke(GRIS)
        numero.set_opacity(0.6)
    return VGroup(caja, numero.move_to(caja))


class Factorizacion(EscenaEuler):
    def construct(self) -> None:
        pasos, parada = pasos_factorizacion(N)
        factores = [f for _, f, _ in pasos]
        assert prod(factores) == N and all(es_primo(f) for f in factores)
        antes_final, ultimo, _ = pasos[-1]
        assert ultimo == antes_final and parada * parada > ultimo  # el último queda primo sin probar más

        titulo = Text(f"Factorizar {N} probando divisores", font_size=32).to_edge(UP, buff=0.4)
        cabeceras = VGroup(
            MathTex("n", font_size=34, color=GRIS).move_to(np.array([X_NUMEROS - 0.5, Y_CABECERA, 0])),
            MathTex(r"\sqrt{n}", font_size=34, color=GRIS).move_to(np.array([X_RAIZ, Y_CABECERA, 0])),
            Text("candidatos d = 2, 3, 4…", font_size=24, color=GRIS),
        )
        cabeceras[2].move_to(np.array([X_CANDIDATOS, Y_CABECERA, 0]), aligned_edge=LEFT)
        filas = len(pasos) + 1  # la última fila es el 1
        barra = Line(
            np.array([(X_NUMEROS + X_FACTORES) / 2, y_fila(0) + 0.35, 0]),
            np.array([(X_NUMEROS + X_FACTORES) / 2, y_fila(filas - 1) - 0.3, 0]),
            color=GRIS,
            stroke_width=3,
        )

        def numero_en(i: int, n: int) -> MathTex:
            return MathTex(str(n), font_size=40).move_to(np.array([X_NUMEROS, y_fila(i), 0]), aligned_edge=RIGHT)

        actual = numero_en(0, N)
        self.play(FadeIn(titulo, shift=0.2 * DOWN), FadeIn(cabeceras))
        self.play(Write(actual), Create(barra))

        raices = []
        for i, (n, f, fallidos) in enumerate(pasos):
            y = y_fila(i)
            raiz = MathTex(rf"\approx {decimal(sqrt(n))}", font_size=32, color=ACENTO_CLARO)
            raiz.move_to(np.array([X_RAIZ, y, 0]))
            raices.append(sqrt(n))
            self.play(FadeIn(raiz, shift=0.1 * LEFT), run_time=0.5)

            assert all(n % c for c in fallidos) and n % f == 0
            primo_final = f == n and i == len(pasos) - 1
            fichas = VGroup(*[ficha(c, False) for c in fallidos])
            if not primo_final:
                fichas.add(ficha(f, True))
            fichas.arrange(RIGHT, buff=0.1).move_to(np.array([X_CANDIDATOS, y, 0]), aligned_edge=LEFT)
            for k, ficha_k in enumerate(fichas):
                self.play(FadeIn(ficha_k, shift=0.1 * RIGHT), run_time=0.45 if k == len(fichas) - 1 else 0.25)

            if primo_final:
                # El siguiente candidato al cuadrado ya pasa de n: no quedan divisores que probar.
                assert isqrt(n) < parada
                aviso = MathTex(
                    rf"{parada}^2 = {parada * parada} > {n}", r"\ \Rightarrow\ ", rf"{n} \text{{ es primo}}",
                    font_size=34,
                )  # fmt: skip
                aviso[0].set_color(ACENTO_CLARO)
                aviso.next_to(fichas, RIGHT, buff=0.3)
                self.play(Write(aviso), run_time=1.2)
                exito = aviso[2]
            else:
                exito = fichas[-1]

            factor = MathTex(str(f), font_size=40, color=AZUL).move_to(np.array([X_FACTORES, y, 0]), aligned_edge=LEFT)
            siguiente = numero_en(i + 1, n // f)
            self.play(TransformFromCopy(exito, factor), run_time=0.7)
            self.play(TransformFromCopy(VGroup(actual, factor), siguiente), run_time=0.7)
            actual = siguiente

        assert raices == sorted(raices, reverse=True)
        assert actual.get_tex_string() == "1"

        encoge = Text("Cada división encoge n, y con él la raíz hasta la que hay que probar", font_size=24, color=TEXTO)
        encoge.next_to(np.array([0, y_fila(filas - 1), 0]), DOWN, buff=0.55)
        resultado = MathTex(rf"{N} = " + r" \cdot ".join(map(str, factores)), font_size=48)
        resultado.next_to(encoge, DOWN, buff=0.35)
        self.play(FadeIn(encoge, shift=0.2 * UP))
        self.wait(0.8)
        self.play(Write(resultado))
        self.play(Create(SurroundingRectangle(resultado, color=ACENTO, buff=0.15, corner_radius=0.08)))
        self.wait(2.5)
