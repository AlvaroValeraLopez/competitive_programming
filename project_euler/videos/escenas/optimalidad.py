"""Principio de optimalidad: bajar siempre hacia el número mayor falla, y calculando de abajo
arriba la mejor suma desde cada casilla se encuentra el mejor camino con una cuenta por casilla.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/optimalidad.py PrincipioOptimalidad
"""

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
    Line,
    MathTex,
    SurroundingRectangle,
    Text,
    Transform,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, FONDO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import camino_voraz, mejor_camino, mejor_desde_cada_casilla

TRAMPA = [[1], [2, 3], [9, 1, 1]]
EJEMPLO = [[3], [7, 4], [2, 4, 6], [8, 5, 9, 3]]
DX, DY = 1.35, 1.15
RADIO = 0.38
X_PANEL = 2.9


class Triangulo:
    """Las casillas de un triángulo de números, colocadas por fila y posición."""

    def __init__(self, triangulo: list[list[int]], centro: np.ndarray) -> None:
        self.valores = triangulo
        filas = len(triangulo)
        arriba = centro + (filas - 1) * DY / 2 * UP
        self.centros = [[arriba + (j - i / 2) * DX * RIGHT + i * DY * DOWN for j in range(i + 1)] for i in range(filas)]
        self.circulos = [
            [Circle(radius=RADIO, color=GRIS, stroke_width=3).set_fill(FONDO, 1).move_to(p) for p in fila] for fila in self.centros
        ]
        self.numeros = [
            [MathTex(str(v), font_size=40).move_to(p) for v, p in zip(fila_v, fila_p)]
            for fila_v, fila_p in zip(triangulo, self.centros)
        ]
        self.aristas = {}
        for i in range(filas - 1):
            for j in range(i + 1):
                for d in (0, 1):
                    a, b = self.centros[i][j], self.centros[i + 1][j + d]
                    v = (b - a) / np.linalg.norm(b - a)
                    self.aristas[(i, j, d)] = Line(a + RADIO * v, b - RADIO * v, color=GRIS, stroke_width=2)

    def todo(self) -> VGroup:
        return VGroup(
            *self.aristas.values(), *[c for f in self.circulos for c in f], *[n for f in self.numeros for n in f]
        )

    def resaltar_camino(self, camino: list[int], color) -> list:
        animaciones = [self.circulos[0][0].animate.set_stroke(color, width=6)]
        for i in range(1, len(camino)):
            animaciones.append(self.aristas[(i - 1, camino[i - 1], camino[i] - camino[i - 1])].animate.set_stroke(color, width=5))
            animaciones.append(self.circulos[i][camino[i]].animate.set_stroke(color, width=6))
        return animaciones


class PrincipioOptimalidad(EscenaEuler):
    def construct(self) -> None:
        # 1. Bajar siempre hacia el mayor no funciona.
        titulo = Text("Bajar siempre hacia el número mayor no funciona", font_size=30).to_edge(UP, buff=0.4)
        trampa = Triangulo(TRAMPA, np.array([-2.6, -0.3, 0]))
        self.play(FadeIn(titulo, shift=0.2 * DOWN), FadeIn(trampa.todo()), run_time=1)
        voraz, mejor = camino_voraz(TRAMPA), mejor_camino(TRAMPA)
        suma_voraz = sum(TRAMPA[i][j] for i, j in enumerate(voraz))
        suma_mejor = mejor_desde_cada_casilla(TRAMPA)[0][0]
        assert suma_mejor == sum(TRAMPA[i][j] for i, j in enumerate(mejor)) and suma_voraz < suma_mejor
        texto_voraz = MathTex(
            "+".join(str(TRAMPA[i][j]) for i, j in enumerate(voraz)) + f"= {suma_voraz}", font_size=48, color=AZUL
        )
        texto_mejor = MathTex(
            "+".join(str(TRAMPA[i][j]) for i, j in enumerate(mejor)) + f"= {suma_mejor}", font_size=48, color=ACENTO_CLARO
        )
        panel = VGroup(
            VGroup(Text("Voraz", font_size=26, color=AZUL), texto_voraz).arrange(DOWN, buff=0.15),
            VGroup(Text("El mejor", font_size=26, color=ACENTO_CLARO), texto_mejor).arrange(DOWN, buff=0.15),
        ).arrange(DOWN, buff=0.6).move_to(np.array([X_PANEL, -0.3, 0]))
        self.play(*trampa.resaltar_camino(voraz, AZUL), FadeIn(panel[0]), run_time=1.5)
        self.wait(0.6)
        self.play(*trampa.resaltar_camino(mejor, ACENTO_CLARO), FadeIn(panel[1]), run_time=1.5)
        self.wait(1.2)

        # 2. De abajo arriba: la mejor suma desde cada casilla.
        self.play(FadeOut(trampa.todo()), FadeOut(panel), FadeOut(titulo), run_time=0.6)
        titulo = Text("De abajo arriba: la mejor suma desde cada casilla", font_size=30).to_edge(UP, buff=0.4)
        ejemplo = Triangulo(EJEMPLO, np.array([-2.6, -0.45, 0]))
        m = mejor_desde_cada_casilla(EJEMPLO)
        self.play(FadeIn(titulo, shift=0.2 * DOWN), FadeIn(ejemplo.todo()), run_time=1)
        abajo = len(EJEMPLO) - 1
        rotulo = Text("En la última fila no hay nada que elegir", font_size=26).move_to(np.array([X_PANEL, 1.6, 0]))
        self.play(*[c.animate.set_stroke(ACENTO_CLARO, width=5) for c in ejemplo.circulos[abajo]], FadeIn(rotulo))
        self.wait(0.6)

        cuenta = None
        for i in range(abajo - 1, -1, -1):
            for j in range(i + 1):
                izquierda, derecha = m[i + 1][j], m[i + 1][j + 1]
                eleccion = 0 if izquierda >= derecha else 1
                assert m[i][j] == EJEMPLO[i][j] + max(izquierda, derecha)
                nueva_cuenta = MathTex(
                    rf"{EJEMPLO[i][j]} + \max({izquierda}, {derecha}) = {m[i][j]}", font_size=44
                ).move_to(np.array([X_PANEL, 0.2, 0]))
                elegida = ejemplo.aristas[(i, j, eleccion)]
                self.play(
                    *([FadeOut(cuenta)] if cuenta else []),
                    FadeIn(nueva_cuenta),
                    elegida.animate.set_stroke(ACENTO_CLARO, width=5),
                    ejemplo.circulos[i + 1][j + eleccion].animate.set_fill(ACENTO, 0.35),
                    run_time=0.7,
                )
                nuevo = MathTex(str(m[i][j]), font_size=40, color=ACENTO_CLARO).move_to(ejemplo.centros[i][j])
                self.play(
                    Transform(ejemplo.numeros[i][j], nuevo),
                    ejemplo.circulos[i][j].animate.set_stroke(ACENTO_CLARO, width=5),
                    elegida.animate.set_stroke(GRIS, width=2),
                    ejemplo.circulos[i + 1][j + eleccion].animate.set_fill(FONDO, 1),
                    run_time=0.6,
                )
                cuenta = nueva_cuenta
        self.play(FadeOut(cuenta), FadeOut(rotulo), run_time=0.4)

        # 3. El camino: bajar hacia la casilla con mayor M.
        camino = mejor_camino(EJEMPLO)
        originales = [EJEMPLO[i][j] for i, j in enumerate(camino)]
        assert sum(originales) == m[0][0]
        rotulo = Text("El camino: bajar hacia la M mayor", font_size=26).move_to(np.array([X_PANEL, 1.6, 0]))
        aclaracion = Text("Sus números originales suman", font_size=26, color=TEXTO).move_to(np.array([X_PANEL, 0.75, 0]))
        suma = MathTex(" + ".join(map(str, originales)) + f" = {m[0][0]}", font_size=48, color=ACENTO_CLARO)
        suma.move_to(np.array([X_PANEL, 0.1, 0]))
        self.play(FadeIn(rotulo), *ejemplo.resaltar_camino(camino, AZUL), run_time=1.5)
        self.play(FadeIn(aclaracion), Write(suma))
        self.wait(1.2)

        # 4. La recurrencia y lo que ahorra.
        self.play(*[FadeOut(x) for x in self.mobjects], run_time=0.8)
        filas = 100
        formula = MathTex(r"M(i, j) = t(i, j) + \max\big(M(i+1, j),\ M(i+1, j+1)\big)", font_size=48)
        comparacion = VGroup(
            Text(f"Con {filas} filas:", font_size=30),
            MathTex(
                rf"\frac{{{filas} \cdot {filas + 1}}}{{2}} = {filas * (filas + 1) // 2} \text{{ casillas}}",
                r"\quad\text{frente a}\quad",
                r"2^{99} \approx 6{,}3 \cdot 10^{29} \text{ caminos}",
                font_size=40,
            ),
        ).arrange(DOWN, buff=0.3)
        assert 6.3e29 < 2**99 < 6.4e29
        comparacion[1][0].set_color(ACENTO_CLARO)
        bloque = VGroup(formula, comparacion).arrange(DOWN, buff=0.8)
        caja = SurroundingRectangle(formula, color=ACENTO, buff=0.25, corner_radius=0.1)
        self.play(Write(formula), run_time=1.5)
        self.play(Create(caja))
        self.play(FadeIn(comparacion, shift=0.2 * UP))
        self.wait(2)
