"""Criba de Eratóstenes hasta 100: cada primo hasta √100 tacha sus múltiplos desde p²,
y lo que queda sin tachar son los primos.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/criba.py Criba
"""

from math import isqrt

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    AnimationGroup,
    Create,
    FadeIn,
    FadeOut,
    LaggedStart,
    MathTex,
    Square,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, FONDO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import es_primo, factorizar, pasos_criba

N = 100
COLUMNAS = 10
LADO = 0.6
ESQUINA = np.array([-6.4, 2.75, 0.0])  # esquina superior izquierda de la cuadrícula
COLOR_DE = {2: ACENTO, 3: AZUL, 5: ACENTO_CLARO, 7: TEXTO}


def centro(k: int) -> np.ndarray:
    fila, columna = divmod(k - 1, COLUMNAS)
    return ESQUINA + np.array([(columna + 0.5) * LADO, -(fila + 0.5) * LADO, 0.0])


class Criba(EscenaEuler):
    def construct(self) -> None:
        pasos = pasos_criba(N)
        assert all(p in COLOR_DE for p, _ in pasos)

        titulo = Text(f"La criba de Eratóstenes hasta {N}", font_size=32).to_edge(UP, buff=0.3).shift(3.4 * RIGHT)

        casillas: dict[int, Square] = {}
        numeros: dict[int, MathTex] = {}
        for k in range(1, N + 1):
            casillas[k] = Square(
                side_length=LADO, stroke_color=GRIS, stroke_width=1.5, fill_color=FONDO, fill_opacity=1
            ).move_to(centro(k))
            numeros[k] = MathTex(str(k), font_size=24, color=BLANCO).move_to(centro(k))
        cuadricula = VGroup(*casillas.values())
        self.play(FadeIn(titulo, shift=0.2 * DOWN), Create(cuadricula, lag_ratio=0.005), run_time=1.5)
        self.play(LaggedStart(*[FadeIn(n) for n in numeros.values()], lag_ratio=0.005), run_time=1)
        self.play(numeros[1].animate.set_opacity(0.3), run_time=0.5)

        # Panel de la derecha: qué primo criba y desde dónde.
        panel_x = 3.4
        tachado_por: dict[int, int] = {}
        texto_p = texto_desde = None
        for p, multiplos in pasos:
            color = COLOR_DE[p]
            nuevo_p = MathTex(rf"p = {p}", font_size=64, color=color).move_to(RIGHT * panel_x + UP * 1.6)
            nuevo_desde = VGroup(
                Text("tacha sus múltiplos desde", font_size=26),
                MathTex(rf"p^2 = {p * p}", font_size=44, color=color),
            ).arrange(DOWN, buff=0.2).move_to(RIGHT * panel_x + UP * 0.1)
            aro = SurroundingRectangle(casillas[p], color=color, buff=0, stroke_width=6)
            animaciones = [Create(aro)]
            if texto_p is None:
                animaciones += [FadeIn(nuevo_p), FadeIn(nuevo_desde)]
            else:
                animaciones += [FadeOut(texto_p), FadeIn(nuevo_p), FadeOut(texto_desde), FadeIn(nuevo_desde)]
            self.play(*animaciones, run_time=0.8)
            texto_p, texto_desde = nuevo_p, nuevo_desde

            nuevos = [m for m in multiplos if m not in tachado_por]
            for m in nuevos:
                tachado_por[m] = p
            self.play(
                LaggedStart(
                    *[
                        AnimationGroup(
                            casillas[m].animate.set_fill(color, opacity=0.55),
                            numeros[m].animate.set_opacity(0.35),
                        )
                        for m in nuevos
                    ],
                    lag_ratio=min(0.15, 2.5 / max(1, len(nuevos))),
                ),
                run_time=min(2.5, 0.6 + 0.08 * len(nuevos)),
            )
            self.play(FadeOut(aro), run_time=0.3)

        # Cada compuesto queda del color de su menor factor primo.
        assert all(p == factorizar(m)[0][0] for m, p in tachado_por.items())

        # El siguiente primo ya no tacha nada nuevo: su cuadrado pasa de N.
        siguiente = next(k for k in range(pasos[-1][0] + 1, N + 1) if k not in tachado_por)
        assert siguiente * siguiente > N and isqrt(N) < siguiente
        parada = VGroup(
            MathTex(rf"{siguiente}^2 = {siguiente * siguiente} > {N}", font_size=44),
            Text("ya no hay nada más que tachar", font_size=26),
        ).arrange(DOWN, buff=0.2).move_to(RIGHT * panel_x + UP * 0.6)
        self.play(FadeOut(texto_p), FadeOut(texto_desde), FadeIn(parada, shift=0.2 * UP))
        self.wait(0.6)

        # Lo que queda sin tachar son los primos.
        primos = [k for k in range(2, N + 1) if k not in tachado_por]
        assert primos == [k for k in range(2, N + 1) if es_primo(k)]
        self.play(
            LaggedStart(
                *[
                    AnimationGroup(casillas[k].animate.set_stroke(BLANCO, width=3), numeros[k].animate.scale(1.15))
                    for k in primos
                ],
                lag_ratio=0.05,
            ),
            run_time=2,
        )
        cuenta = MathTex(rf"{len(primos)} \text{{ primos hasta }} {N}", font_size=48, color=ACENTO_CLARO)
        cuenta.move_to(RIGHT * panel_x + DOWN * 1.2)
        nota = Text(
            f"Basta con cribar con los primos\nhasta √{N} = {isqrt(N)}",
            font_size=26,
            line_spacing=0.8,
        ).next_to(cuenta, DOWN, buff=0.5)
        self.play(Write(cuenta))
        self.play(Create(SurroundingRectangle(cuenta, color=ACENTO, buff=0.15)), FadeIn(nota, shift=0.2 * UP))
        self.wait(2.5)
