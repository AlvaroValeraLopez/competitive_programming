"""Ternas pitagóricas: 3² + 4² = 5² con casillas, y la fórmula de Euclides sobre la rejilla
de pares (m, n): los pares coprimos y de distinta paridad dan cada terna primitiva una vez,
y los demás dan múltiplos de otras.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/ternas_pitagoricas.py TernasPitagoricas
"""

from math import gcd

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    AnimationGroup,
    Create,
    Cross,
    DashedVMobject,
    Dot,
    FadeIn,
    FadeOut,
    LaggedStart,
    MathTex,
    Polygon,
    Square,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.componentes import Cuadricula, comprobar_casillas
from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, FONDO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import casillas_pitagoras, descarte_euclides, rectangulo, terna_euclides

A, B, C = 3, 4, 5
LADO = 0.4
M_MAX = 6
X_M = {m: -5.3 + (m - 2) * 1.2 for m in range(2, M_MAX + 1)}  # columna de cada m en la rejilla
Y_N = {n: -2.55 + (n - 1) * 0.98 for n in range(1, M_MAX)}  # fila de cada n
X_PANEL = 1.2


def bloque(filas: int, columnas: int, color, centro) -> tuple[Cuadricula, dict]:
    cuadricula = Cuadricula(filas=filas, columnas=columnas, lado=LADO, centro=centro)
    casillas = {
        celda: Square(side_length=LADO, fill_color=color, fill_opacity=1, stroke_color=FONDO, stroke_width=2.5).move_to(
            cuadricula.centro_de(celda)
        )
        for celda in rectangulo(filas, columnas)
    }
    return cuadricula, casillas


class TernasPitagoricas(EscenaEuler):
    def construct(self) -> None:
        assert A * A + B * B == C * C

        # 1. Un triángulo rectángulo de lados 3, 4 y 5, y los cuadrados de sus lados.
        titulo = MathTex(r"a^2 + b^2 = c^2", font_size=56).to_edge(UP, buff=0.4)
        unidad = 0.62
        esquina = np.array([-5.6, -1.6, 0.0])
        triangulo = Polygon(
            esquina, esquina + B * unidad * RIGHT, esquina + A * unidad * UP, color=ACENTO_CLARO, stroke_width=4
        )
        etiquetas = VGroup(
            MathTex(str(B), font_size=40, color=AZUL).next_to(triangulo, DOWN, buff=0.15),
            MathTex(str(A), font_size=40, color=ACENTO).next_to(triangulo, LEFT, buff=0.15),
            MathTex(str(C), font_size=40, color=ACENTO_CLARO).move_to(esquina + unidad * np.array([B / 2 + 0.45, A / 2 + 0.35, 0])),
        )
        self.play(Write(titulo), Create(triangulo), FadeIn(etiquetas), run_time=1.5)

        _, casillas_a = bloque(A, A, ACENTO, np.array([-1.3, -0.1, 0.0]))
        _, casillas_b = bloque(B, B, AZUL, np.array([1.2, -0.1, 0.0]))
        rejilla_c = Cuadricula(filas=C, columnas=C, lado=LADO, centro=np.array([4.5, -0.1, 0.0]))
        marco_c = DashedVMobject(Square(side_length=C * LADO, color=GRIS, stroke_width=2).move_to(rejilla_c.centro), num_dashes=40)
        cuenta = MathTex(f"{A * A}", "+", f"{B * B}", "=", f"{C * C}", font_size=48).move_to(np.array([1.6, -2.2, 0]))
        cuenta[0].set_color(ACENTO)
        cuenta[2].set_color(AZUL)
        cuenta[4].set_color(ACENTO_CLARO)
        grupo_a, grupo_b = VGroup(*casillas_a.values()), VGroup(*casillas_b.values())
        self.play(FadeIn(grupo_a), FadeIn(grupo_b), Create(marco_c), FadeIn(cuenta), run_time=1.2)
        self.wait(0.5)

        # El cuadrado de 4 va a una esquina del de 5; las casillas del de 3 rellenan el hueco en L.
        origen, destino, fijas = casillas_pitagoras(A, B, C)
        self.play(grupo_b.animate.move_to((rejilla_c.centro_de((0, 0)) + rejilla_c.centro_de((B - 1, B - 1))) / 2), run_time=1.2)
        comprobar_casillas(rejilla_c, grupo_b, set(fijas))
        self.play(
            LaggedStart(
                *[casillas_a[o].animate.move_to(rejilla_c.centro_de(d)) for o, d in zip(origen, destino)], lag_ratio=0.12
            ),
            run_time=2,
        )
        comprobar_casillas(rejilla_c, VGroup(grupo_a, grupo_b), rectangulo(C, C))
        rotulo = Text(f"({A}, {B}, {C}) es una terna pitagórica", font_size=30).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(rotulo, shift=0.2 * UP))
        self.wait(1)

        # 2. La fórmula de Euclides, par a par.
        self.play(*[FadeOut(m) for m in (triangulo, etiquetas, grupo_a, grupo_b, marco_c, cuenta, rotulo)], run_time=0.8)
        formula = MathTex(r"a = m^2 - n^2,\quad b = 2mn,\quad c = m^2 + n^2", font_size=40)
        formula.move_to(np.array([0, 2.45, 0]))
        titulo_2 = Text("La fórmula de Euclides", font_size=34).move_to(titulo)
        self.play(FadeOut(titulo), FadeIn(titulo_2), Write(formula), run_time=1.2)

        ejes = VGroup(
            *[MathTex(str(m), font_size=30, color=GRIS).move_to(np.array([X_M[m], Y_N[1] - 0.6, 0])) for m in X_M],
            *[MathTex(str(n), font_size=30, color=GRIS).move_to(np.array([X_M[2] - 0.75, Y_N[n], 0])) for n in Y_N],
            MathTex("m", font_size=36, color=TEXTO).move_to(np.array([(X_M[2] + X_M[M_MAX]) / 2, Y_N[1] - 1.1, 0])),
            MathTex("n", font_size=36, color=TEXTO).move_to(np.array([X_M[2] - 1.25, (Y_N[1] + Y_N[M_MAX - 1]) / 2, 0])),
        )
        self.play(FadeIn(ejes))

        panel = None
        validos = []
        pares = [(m, n) for m in range(2, M_MAX + 1) for n in range(1, m)]
        for paso, (m, n) in enumerate(pares):
            a, b, c = terna_euclides(m, n)
            assert a * a + b * b == c * c
            motivo = descarte_euclides(m, n)
            punto = np.array([X_M[m], Y_N[n], 0.0])
            cabecera = MathTex(rf"m = {m},\ n = {n}", font_size=40)
            if motivo is None:
                assert gcd(a, b) == 1
                validos.append((a, b, c))
                marca = VGroup(
                    Dot(punto, radius=0.11, color=ACENTO_CLARO),
                    MathTex(f"{a}, {b}, {c}", font_size=22, color=ACENTO_CLARO).next_to(punto, DOWN, buff=0.12),
                )
                cuerpo = VGroup(
                    MathTex(rf"a = {m * m} - {n * n} = {a}", font_size=36),
                    MathTex(rf"b = 2 \cdot {m} \cdot {n} = {b}", font_size=36),
                    MathTex(rf"c = {m * m} + {n * n} = {c}", font_size=36),
                    MathTex(rf"{a}^2 + {b}^2 = {a * a} + {b * b} = {c * c} = {c}^2", font_size=32, color=ACENTO_CLARO),
                ).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
            else:
                g = gcd(a, b)
                assert g > 1 and c % g == 0
                marca = VGroup(Dot(punto, radius=0.07, color=GRIS), Cross(scale_factor=0.14, stroke_color=GRIS, stroke_width=3).move_to(punto))
                cuerpo = VGroup(
                    Text("no son coprimos" if motivo == "no coprimos" else "los dos son impares", font_size=28, color=GRIS),
                    MathTex(rf"({a}, {b}, {c}) = {g} \cdot ({a // g}, {b // g}, {c // g})", font_size=36, color=GRIS),
                    Text("no es primitiva", font_size=28, color=GRIS),
                ).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
            nuevo_panel = VGroup(cabecera, cuerpo).arrange(DOWN, buff=0.3, aligned_edge=LEFT)
            nuevo_panel.move_to(np.array([X_PANEL, 0.0, 0]), aligned_edge=LEFT)
            rapido = paso >= 6
            self.play(
                FadeIn(marca, scale=0.6),
                *([FadeOut(panel)] if panel else []),
                FadeIn(nuevo_panel),
                run_time=0.5 if rapido else 0.8,
            )
            self.wait(0.35 if rapido else 1.0)
            panel = nuevo_panel

        # Cada terna primitiva aparece una sola vez.
        assert len(validos) == len(set(validos))
        cierre = VGroup(
            Text("m > n, coprimos", font_size=30),
            Text("y de distinta paridad:", font_size=30),
            Text("cada terna primitiva", font_size=30, color=ACENTO_CLARO),
            Text("sale exactamente una vez", font_size=30, color=ACENTO_CLARO),
        ).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        cierre.move_to(np.array([X_PANEL, 0.0, 0]), aligned_edge=LEFT)
        self.play(FadeOut(panel), FadeIn(cierre, shift=0.2 * UP))
        self.play(Create(SurroundingRectangle(formula, color=ACENTO, buff=0.18, corner_radius=0.08)))
        self.wait(2.5)
