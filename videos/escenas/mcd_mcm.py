"""mcd y mcm: el algoritmo de Euclides dibujado como cuadrados que llenan un rectángulo,
y el mcd y el mcm a partir de los exponentes de la factorización.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/mcd_mcm.py McdMcm
"""

from math import gcd, lcm, prod

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Brace,
    Create,
    DashedLine,
    FadeIn,
    FadeOut,
    GrowFromCenter,
    LaggedStart,
    MathTex,
    Rectangle,
    Square,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, FONDO, GRIS, EscenaEuler
from euler_video.matematicas import cuadrados_euclides, exponentes, pasos_euclides

A, B = 48, 18
ESCALA = 0.175  # unidades de pantalla por unidad del rectángulo: 48 × 18 → 8,4 × 3,15
ORIGEN = np.array([-5.6, -1.0, 0.0])  # esquina inferior izquierda del rectángulo
COLORES = [ACENTO, AZUL, ACENTO_CLARO]


def punto(x: float, y: float) -> np.ndarray:
    return ORIGEN + np.array([x * ESCALA, y * ESCALA, 0.0])


def potencias(exps: dict[int, int | str]) -> str:
    return r" \cdot ".join(rf"{p}^{{{e}}}" for p, e in sorted(exps.items()))


class McdMcm(EscenaEuler):
    def construct(self) -> None:
        pasos = pasos_euclides(A, B)
        grupos = cuadrados_euclides(A, B)
        mcd, mcm = gcd(A, B), lcm(A, B)
        assert [len(g) for g in grupos] == [q for _, _, q, _ in pasos]
        assert grupos[-1][0][2] == pasos[-1][1] == mcd

        titulo = VGroup(
            MathTex(rf"\operatorname{{mcd}}({A}, {B})", font_size=48),
            Text("con el algoritmo de Euclides", font_size=30),
        ).arrange(RIGHT, buff=0.35)
        titulo.to_edge(UP, buff=0.45)
        self.play(FadeIn(titulo, shift=0.2 * DOWN))

        # El rectángulo A × B.
        marco = Rectangle(width=A * ESCALA, height=B * ESCALA, color=BLANCO, stroke_width=3)
        marco.move_to(punto(A / 2, B / 2))
        llave_ancho = Brace(marco, DOWN, buff=0.12)
        llave_alto = Brace(marco, LEFT, buff=0.12)
        ancho = llave_ancho.get_tex(str(A))
        alto = llave_alto.get_tex(str(B))
        self.play(Create(marco), GrowFromCenter(llave_ancho), GrowFromCenter(llave_alto), FadeIn(ancho), FadeIn(alto))

        # Cada división de Euclides es un grupo de cuadrados, los más grandes que caben.
        cuentas = VGroup()
        for k, ((a, b, q, r), grupo) in enumerate(zip(pasos, grupos)):
            color = COLORES[k % len(COLORES)]
            texto = FONDO if color is ACENTO_CLARO else BLANCO
            cuadrados = VGroup()
            for x, y, lado in grupo:
                cuadrado = Square(
                    side_length=lado * ESCALA,
                    fill_color=color,
                    fill_opacity=0.9,
                    stroke_color=FONDO,
                    stroke_width=3,
                ).move_to(punto(x + lado / 2, y + lado / 2))
                etiqueta = MathTex(str(lado), font_size=28 if lado * ESCALA < 1.5 else 40, color=texto)
                cuadrados.add(VGroup(cuadrado, etiqueta.move_to(cuadrado)))
            cuenta = MathTex(str(a), "=", rf"{q} \cdot {b}", "+", str(r), font_size=40)
            cuenta[2].set_color(color)
            cuentas.add(cuenta)
            cuentas.arrange(DOWN, aligned_edge=LEFT, buff=0.35).move_to(RIGHT * 4.75 + UP * 1.0)
            self.play(
                LaggedStart(*[FadeIn(c, scale=0.85) for c in cuadrados], lag_ratio=0.25),
                Write(cuenta),
                run_time=1.4,
            )
            self.wait(0.4)

        resultado = MathTex(rf"\operatorname{{mcd}}({A}, {B}) = {mcd}", font_size=44)
        resultado.next_to(cuentas, DOWN, buff=0.55)
        self.play(Write(resultado))
        self.play(Create(SurroundingRectangle(resultado, color=ACENTO, buff=0.15)))

        # El último cuadrado cabe un número exacto de veces en los dos lados.
        rejilla = VGroup(
            *[DashedLine(punto(i * mcd, 0), punto(i * mcd, B), color=BLANCO, stroke_width=2) for i in range(1, A // mcd)],
            *[DashedLine(punto(0, j * mcd), punto(A, j * mcd), color=BLANCO, stroke_width=2) for j in range(1, B // mcd)],
        ).set_opacity(0.7)
        cabe = MathTex(
            rf"{A} = {A // mcd} \cdot {mcd}", r"\qquad", rf"{B} = {B // mcd} \cdot {mcd}", font_size=42, color=ACENTO_CLARO
        ).next_to(VGroup(marco, ancho), DOWN, buff=0.35)
        self.play(Create(rejilla, lag_ratio=0.1), FadeIn(cabe, shift=0.2 * UP), run_time=1.5)
        self.wait(1.2)

        # Con exponentes: el mcd se queda con el menor de cada primo y el mcm con el mayor.
        self.play(*[FadeOut(m) for m in self.mobjects])
        ea, eb = exponentes(A), exponentes(B)
        primos = sorted(set(ea) | set(eb))
        minimos = {p: min(ea.get(p, 0), eb.get(p, 0)) for p in primos}
        maximos = {p: max(ea.get(p, 0), eb.get(p, 0)) for p in primos}
        assert prod(p**e for p, e in minimos.items()) == mcd
        assert prod(p**e for p, e in maximos.items()) == mcm
        assert A * B == mcd * mcm

        titulo2 = Text("Con la factorización en primos", font_size=32).to_edge(UP, buff=0.45)
        fa = MathTex(rf"{A} = {potencias(ea)}", font_size=48)
        fb = MathTex(rf"{B} = {potencias(eb)}", font_size=48)
        lmin = MathTex(
            r"\operatorname{mcd} = ",
            potencias({p: rf"\min({ea.get(p, 0)},\,{eb.get(p, 0)})" for p in primos}),
            rf" = {potencias(minimos)} = {mcd}",
            font_size=44,
        )
        lmax = MathTex(
            r"\operatorname{mcm} = ",
            potencias({p: rf"\max({ea.get(p, 0)},\,{eb.get(p, 0)})" for p in primos}),
            rf" = {potencias(maximos)} = {mcm}",
            font_size=44,
        )
        lmin[1].set_color(AZUL)
        lmax[1].set_color(ACENTO_CLARO)
        bloque = VGroup(fa, fb, lmin, lmax).arrange(DOWN, buff=0.5).next_to(titulo2, DOWN, buff=0.6)
        VGroup(fa, fb).set_x(0)
        self.play(FadeIn(titulo2, shift=0.2 * DOWN))
        self.play(Write(fa), Write(fb), run_time=1.5)
        self.play(Write(lmin), run_time=1.5)
        self.play(Write(lmax), run_time=1.5)
        self.wait(1)

        producto = MathTex(
            rf"\operatorname{{mcm}}({A}, {B}) = \frac{{{A} \cdot {B}}}{{\operatorname{{mcd}}({A}, {B})}} = \frac{{{A * B}}}{{{mcd}}} = {mcm}",
            font_size=44,
        ).next_to(bloque, DOWN, buff=0.55)
        self.play(Write(producto), run_time=1.5)
        self.play(Create(SurroundingRectangle(producto, color=ACENTO, buff=0.15)))
        self.wait(1.2)

        # Las dos reglas generales.
        self.play(*[FadeOut(m) for m in self.mobjects])
        reglas = VGroup(
            MathTex(r"\operatorname{mcd}(a, b) = \operatorname{mcd}(b,\ a \bmod b)", font_size=60),
            MathTex(r"\operatorname{mcm}(a, b) = \frac{a \cdot b}{\operatorname{mcd}(a, b)}", font_size=60),
        ).arrange(DOWN, buff=0.7)
        caja = SurroundingRectangle(reglas, color=ACENTO, buff=0.4, corner_radius=0.1)
        self.play(Write(reglas[0]), run_time=1.5)
        self.play(Write(reglas[1]), run_time=1.5)
        self.play(Create(caja))
        self.wait(2)
