"""Coeficientes binomiales: el triángulo de Pascal se construye sumando, y cada número cuenta
de cuántas formas se pueden elegir k elementos entre n.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/coeficientes_binomiales.py CoeficientesBinomiales
"""

from math import comb, factorial

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Circle,
    Create,
    FadeIn,
    FadeOut,
    Indicate,
    LaggedStart,
    MathTex,
    RoundedRectangle,
    SurroundingRectangle,
    Text,
    TransformFromCopy,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, GRIS, EscenaEuler
from euler_video.matematicas import subconjuntos, triangulo_pascal

FILAS = 7
N_EJEMPLO, K_EJEMPLO = 4, 2
LETRAS = "abcd"
PASO_X, PASO_Y = 0.95, 0.72
CIMA = np.array([-3.1, 2.55, 0.0])  # posición del 1 de la fila 0


def posicion(n: int, k: int) -> np.ndarray:
    return CIMA + (k - n / 2) * PASO_X * RIGHT + n * PASO_Y * DOWN


class CoeficientesBinomiales(EscenaEuler):
    def construct(self) -> None:
        triangulo = triangulo_pascal(FILAS)
        pares = subconjuntos(LETRAS, K_EJEMPLO)
        assert len(LETRAS) == N_EJEMPLO
        assert len(pares) == triangulo[N_EJEMPLO][K_EJEMPLO] == comb(N_EJEMPLO, K_EJEMPLO)

        titulo = Text("El triángulo de Pascal", font_size=34).to_edge(UP, buff=0.35).shift(3.6 * RIGHT)
        regla = Text("Cada número es la suma\nde los dos de encima", font_size=26, line_spacing=0.8)
        regla.next_to(titulo, DOWN, buff=0.3)
        self.play(FadeIn(titulo, shift=0.2 * DOWN))

        # Fila a fila: los extremos valen 1 y cada número interior nace de sus dos padres.
        numeros: list[list[MathTex]] = []
        for n, fila in enumerate(triangulo):
            nueva = [MathTex(str(v), font_size=40).move_to(posicion(n, k)) for k, v in enumerate(fila)]
            numeros.append(nueva)
            if n < 2:
                self.play(LaggedStart(*[FadeIn(m, scale=0.6) for m in nueva], lag_ratio=0.2), run_time=0.6)
                continue
            if n == 2:
                self.play(FadeIn(regla))
            anterior = numeros[n - 1]
            animaciones = [FadeIn(nueva[0], scale=0.6), FadeIn(nueva[-1], scale=0.6)]
            for k in range(1, n):
                assert fila[k] == triangulo[n - 1][k - 1] + triangulo[n - 1][k]
                animaciones.append(TransformFromCopy(VGroup(anterior[k - 1], anterior[k]), nueva[k]))
            self.play(*animaciones, run_time=0.9 if n < 4 else 0.7)
        self.wait(0.5)

        # Qué cuenta cada número: elegir k elementos entre n.
        self.play(FadeOut(regla))
        objetivo = numeros[N_EJEMPLO][K_EJEMPLO]
        aro = Circle(radius=0.32, color=ACENTO, stroke_width=5).move_to(objetivo)
        etiqueta_n = MathTex(rf"n = {N_EJEMPLO}", font_size=32, color=ACENTO_CLARO)
        etiqueta_n.next_to(numeros[N_EJEMPLO][0], LEFT, buff=0.5)
        self.play(Create(aro), FadeIn(etiqueta_n), Indicate(objetivo, color=ACENTO_CLARO))

        pregunta = Text(
            f"¿De cuántas formas se pueden\nelegir {K_EJEMPLO} letras de {{{', '.join(LETRAS)}}}?",
            font_size=26,
            line_spacing=0.8,
        ).move_to(3.6 * RIGHT + 1.6 * UP)
        self.play(FadeIn(pregunta, shift=0.2 * UP))

        fichas = VGroup()
        for par in pares:
            texto = MathTex(r"\{" + ", ".join(par) + r"\}", font_size=34)
            fondo = RoundedRectangle(
                width=1.35,
                height=0.6,
                corner_radius=0.1,
                stroke_width=0,
                fill_color=GRIS,
                fill_opacity=0.35,
            )
            fichas.add(VGroup(fondo, texto.move_to(fondo)))
        fichas.arrange_in_grid(rows=2, buff=(0.2, 0.2)).next_to(pregunta, DOWN, buff=0.4)
        self.play(LaggedStart(*[FadeIn(f, shift=0.15 * UP) for f in fichas], lag_ratio=0.15), run_time=1.2)

        recuento = MathTex(
            rf"\binom{{{N_EJEMPLO}}}{{{K_EJEMPLO}}} = \frac{{{N_EJEMPLO}!}}{{{K_EJEMPLO}!\,{N_EJEMPLO - K_EJEMPLO}!}}"
            rf" = {factorial(N_EJEMPLO) // (factorial(K_EJEMPLO) * factorial(N_EJEMPLO - K_EJEMPLO))}",
            font_size=44,
        ).next_to(fichas, DOWN, buff=0.5)
        self.play(Write(recuento))
        self.play(Create(SurroundingRectangle(recuento, color=ACENTO, buff=0.15)))
        self.wait(1)

        # La regla del triángulo, en general.
        self.play(*[FadeOut(m) for m in self.mobjects])
        general = MathTex(
            r"\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}",
            font_size=72,
        )
        explicacion = Text(
            "Con un elemento fijo: los grupos que lo contienen y los que no",
            font_size=26,
            color=AZUL,
        ).next_to(general, DOWN, buff=0.6)
        caja = SurroundingRectangle(general, color=ACENTO, buff=0.35, corner_radius=0.1)
        self.play(Write(general), run_time=1.5)
        self.play(Create(caja), FadeIn(explicacion, shift=0.2 * UP))
        self.wait(2)
