"""Cambio de monedas: las formas de pagar una cantidad se reparten entre las que no usan la
moneda más grande y las que la usan al menos una vez, y esa recurrencia rellena una tabla.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/monedas.py CambioMonedas
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Brace,
    Circle,
    Create,
    FadeIn,
    FadeOut,
    LaggedStart,
    MathTex,
    Rectangle,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, FONDO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import formas_de_pagar, tabla_cambio

MONEDAS = [1, 2, 5]
EJEMPLO = 5
HASTA = 10
COLOR_MONEDA = {1: ACENTO, 2: AZUL, 5: ACENTO_CLARO}
ANCHO_CELDA, ALTO_CELDA = 0.82, 0.68
X_TABLA = -3.6  # centro de la columna 0
Y_CABECERA = 1.55


def moneda(valor: int) -> VGroup:
    color = COLOR_MONEDA[valor]
    circulo = Circle(radius=0.28, color=color, stroke_width=3).set_fill(color, 0.85)
    numero = MathTex(str(valor), font_size=30, color=FONDO if valor == 5 else BLANCO).move_to(circulo)
    return VGroup(circulo, numero)


class CambioMonedas(EscenaEuler):
    def construct(self) -> None:
        # 1. Las formas de pagar 5 con monedas de 1, 2 y 5.
        titulo = Text(f"¿De cuántas formas se pagan {EJEMPLO} con monedas de 1, 2 y 5?", font_size=30).to_edge(UP, buff=0.4)
        formas = formas_de_pagar(MONEDAS, EJEMPLO)
        filas = VGroup()
        for forma in formas:
            assert sum(forma) == EJEMPLO
            filas.add(VGroup(*[moneda(v) for v in forma]).arrange(RIGHT, buff=0.12))
        filas.arrange(DOWN, buff=0.35, aligned_edge=LEFT).move_to(np.array([-3.4, -0.2, 0]))
        self.play(FadeIn(titulo, shift=0.2 * DOWN))
        self.play(LaggedStart(*[FadeIn(f, shift=0.2 * RIGHT) for f in filas], lag_ratio=0.3), run_time=1.6)
        cuantas = MathTex(rf"{len(formas)} \text{{ formas}}", font_size=44, color=ACENTO_CLARO).next_to(filas, DOWN, buff=0.4)
        self.play(Write(cuantas))
        self.wait(0.6)

        # 2. Se reparten: sin la moneda de 5, o con al menos una (quitándola, queda pagar 0).
        mayor = MONEDAS[-1]
        con = VGroup(*[f for f, forma in zip(filas, formas) if mayor in forma])
        sin = VGroup(*[f for f, forma in zip(filas, formas) if mayor not in forma])
        tabla = tabla_cambio(MONEDAS, HASTA)
        assert len(sin) == tabla[-2][EJEMPLO] and len(con) == tabla[-1][EJEMPLO - mayor]
        llave_con, llave_sin = Brace(con, RIGHT, color=TEXTO), Brace(sin, RIGHT, color=TEXTO)
        x_texto = max(llave_con.get_right()[0], llave_sin.get_right()[0]) + 0.3
        texto_con = VGroup(
            Text("con al menos una de 5:", font_size=24),
            Text(f"quitándola queda pagar {EJEMPLO - mayor}: {len(con)} forma", font_size=24, color=ACENTO_CLARO),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT)
        texto_sin = VGroup(
            Text("sin la de 5:", font_size=24),
            Text(f"pagar {EJEMPLO} con 1 y 2: {len(sin)} formas", font_size=24, color=ACENTO_CLARO),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT)
        texto_con.move_to(np.array([x_texto, llave_con.get_center()[1], 0]), aligned_edge=LEFT)
        texto_sin.move_to(np.array([x_texto, llave_sin.get_center()[1], 0]), aligned_edge=LEFT)
        self.play(FadeIn(llave_con), FadeIn(texto_con), run_time=1)
        self.wait(0.5)
        self.play(FadeIn(llave_sin), FadeIn(texto_sin), run_time=1)
        recurrencia = MathTex(
            rf"W(3, {EJEMPLO}) = W(2, {EJEMPLO}) + W(3, {EJEMPLO - mayor}) = {len(sin)} + {len(con)} = {len(formas)}",
            font_size=38, color=ACENTO_CLARO,
        ).to_edge(DOWN, buff=0.45)  # fmt: skip
        self.play(FadeOut(cuantas), Write(recurrencia), run_time=1.5)
        self.wait(1.5)

        # 3. La recurrencia rellena una tabla, moneda a moneda.
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=0.8)
        titulo = Text("Cada casilla: la de encima más la que está c columnas a su izquierda", font_size=26).to_edge(UP, buff=0.4)

        def centro(fila: int, m: int) -> np.ndarray:
            return np.array([X_TABLA + m * ANCHO_CELDA, Y_CABECERA - (fila + 1) * (ALTO_CELDA + 0.12), 0])

        cabecera = VGroup(*[MathTex(str(m), font_size=30, color=GRIS).move_to(centro(-1, m)) for m in range(HASTA + 1)])
        etiquetas = VGroup(
            *[
                MathTex(r"\{" + ", ".join(map(str, MONEDAS[: i + 1])) + r"\}", font_size=30, color=TEXTO)
                .next_to(centro(i, 0), LEFT, buff=0.6)
                for i in range(len(MONEDAS))
            ]
        )
        celdas = [
            [Rectangle(width=ANCHO_CELDA - 0.08, height=ALTO_CELDA, color=GRIS, stroke_width=2).move_to(centro(i, m)) for m in range(HASTA + 1)]
            for i in range(len(MONEDAS))
        ]
        self.play(
            FadeIn(titulo, shift=0.2 * DOWN), FadeIn(cabecera), FadeIn(etiquetas),
            *[Create(c) for fila in celdas for c in fila], run_time=1.2,
        )  # fmt: skip

        valores: list[list[MathTex]] = [[None] * (HASTA + 1) for _ in MONEDAS]
        cuenta = None
        for i, c in enumerate(MONEDAS):
            for m in range(HASTA + 1):
                arriba = tabla[i - 1][m] if i else int(m == 0)
                izquierda = tabla[i][m - c] if m >= c else 0
                assert tabla[i][m] == arriba + izquierda
                valor = MathTex(str(tabla[i][m]), font_size=34, color=BLANCO).move_to(centro(i, m))
                fuentes = []
                if i:
                    fuentes.append(celdas[i - 1][m])
                if m >= c:
                    fuentes.append(celdas[i][m - c])
                despacio = i > 0 and m in (c, c + 1, HASTA)
                if i == 0:
                    self.play(FadeIn(valor), run_time=0.12)
                else:
                    partes = ([str(arriba)] if i else []) + ([str(izquierda)] if m >= c else [])
                    nueva_cuenta = MathTex(
                        rf"W({i + 1}, {m}) = " + " + ".join(partes) + f" = {tabla[i][m]}", font_size=40
                    ).to_edge(DOWN, buff=0.6)
                    self.play(
                        *[f.animate.set_stroke(ACENTO_CLARO, width=5) for f in fuentes],
                        *([FadeOut(cuenta)] if cuenta else []),
                        FadeIn(nueva_cuenta),
                        run_time=0.5 if despacio else 0.2,
                    )
                    self.play(
                        FadeIn(valor, scale=1.3),
                        *[f.animate.set_stroke(GRIS, width=2) for f in fuentes],
                        run_time=0.5 if despacio else 0.2,
                    )
                    if despacio:
                        self.wait(0.4)
                    cuenta = nueva_cuenta
                valores[i][m] = valor
        final = SurroundingRectangle(celdas[-1][HASTA], color=ACENTO_CLARO, buff=0.06)
        self.play(Create(final))
        self.wait(1)

        # 4. La recurrencia.
        self.play(*[FadeOut(x) for x in self.mobjects], run_time=0.8)
        formula = MathTex(r"W(i, m) = W(i - 1, m) + W(i, m - c_i)", font_size=56)
        explicacion = VGroup(
            Text("sin la moneda cᵢ  +  con al menos una", font_size=28),
            Text("Con k monedas y una cantidad n: k · n sumas", font_size=28, color=ACENTO_CLARO),
        ).arrange(DOWN, buff=0.3)
        VGroup(formula, explicacion).arrange(DOWN, buff=0.7)
        caja = SurroundingRectangle(formula, color=ACENTO, buff=0.25, corner_radius=0.1)
        self.play(Write(formula), run_time=1.5)
        self.play(Create(caja), FadeIn(explicacion[0], shift=0.2 * UP))
        self.play(FadeIn(explicacion[1], shift=0.2 * UP))
        self.wait(2)
