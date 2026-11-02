"""Suma de cuadrados: tres copias de 1² + 2² + … + n² llenan un rectángulo de (2n + 1) × T(n).

Dos copias van enteras a los lados, en escalera. La tercera se deshace en sus capas en
forma de L, que se enderezan en filas y rellenan justo el hueco del medio.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/suma_cuadrados.py SumaCuadrados
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    AnimationGroup,
    Brace,
    Create,
    DashedVMobject,
    FadeIn,
    FadeOut,
    GrowFromCenter,
    LaggedStart,
    MathTex,
    Rectangle,
    Square,
    SurroundingRectangle,
    Text,
    TransformFromCopy,
    VGroup,
    Write,
)

from euler_video.componentes import Cuadricula, comprobar_casillas
from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, FONDO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import capas_en_l, rectangulo, rectangulo_tres_copias, triangular

N = 4
LADO = 0.42
CENTRO_RECTANGULO = np.array([-2.0, -0.35, 0.0])
X_FILAS = 0.85  # borde izquierdo de las filas de cuadrados de la derecha
BASES = [1.15, -0.8, -2.75]  # línea de apoyo de cada copia
HUECO = 0.25
CAPA_PAR = ACENTO_CLARO.interpolate(ACENTO, 0.45)


def casilla(color) -> Square:
    return Square(side_length=LADO, fill_color=color, fill_opacity=1, stroke_color=FONDO, stroke_width=2.5)


def cuadrado_de_casillas(k: int, esquina: np.ndarray, colores: dict) -> dict:
    """Las k² casillas de un cuadrado con su esquina superior izquierda en `esquina`."""
    return {
        (f, c): casilla(colores[(f, c)]).move_to(esquina + (c + 0.5) * LADO * RIGHT + (f + 0.5) * LADO * DOWN)
        for f in range(k)
        for c in range(k)
    }


class SumaCuadrados(EscenaEuler):
    def construct(self) -> None:
        n = N
        total = sum(k * k for k in range(1, n + 1))
        alto, ancho = triangular(n), 2 * n + 1
        assert 3 * total == alto * ancho
        cuadricula = Cuadricula(filas=alto, columnas=ancho, lado=LADO, centro=CENTRO_RECTANGULO)
        izquierda, derecha, centro = rectangulo_tres_copias(n)

        partes = []
        for k in range(1, n + 1):
            partes += (["+"] if k > 1 else []) + [f"{k}^2"]
        titulo = MathTex(*partes, font_size=56).to_edge(UP, buff=0.4)

        # Las tres copias, una por fila; la tercera con sus capas en L de dos tonos.
        copias = []
        for fila, color in enumerate((ACENTO, AZUL, None)):
            x = X_FILAS
            cuadrados = {}
            for k in range(1, n + 1):
                esquina = np.array([x, BASES[fila] + k * LADO, 0.0])
                if color is None:
                    colores = {
                        celda: (ACENTO_CLARO if i % 2 else CAPA_PAR)
                        for i, capa in enumerate(capas_en_l(k), start=1)
                        for celda in capa
                    }
                else:
                    colores = {(f, c): color for f in range(k) for c in range(k)}
                cuadrados[k] = cuadrado_de_casillas(k, esquina, colores)
                x += k * LADO + HUECO
            copias.append(cuadrados)
        grupos = [VGroup(*[VGroup(*cuadrados[k].values()) for k in range(1, n + 1)]) for cuadrados in copias]

        # 1. La suma: cada k² es un cuadrado de k × k casillas.
        primera = grupos[0]
        sitio = primera.get_center()
        primera.move_to(0.3 * DOWN)
        etiquetas = VGroup(
            *[MathTex(str(k * k), font_size=36, color=TEXTO).next_to(primera[k - 1], DOWN, buff=0.2) for k in range(1, n + 1)]
        )
        self.play(Write(titulo), run_time=1.2)
        self.play(
            LaggedStart(*[FadeIn(c, scale=0.9) for c in primera], lag_ratio=0.3),
            LaggedStart(*[FadeIn(e) for e in etiquetas], lag_ratio=0.3),
            run_time=1.6,
        )
        self.wait(0.5)

        # 2. Tres copias.
        rotulo = Text("Tomamos tres copias", font_size=28).to_edge(DOWN, buff=0.3)
        self.play(FadeOut(etiquetas), primera.animate.move_to(sitio), FadeIn(rotulo, shift=0.2 * UP), run_time=1)
        self.play(TransformFromCopy(primera, grupos[1]), TransformFromCopy(primera, grupos[2]), run_time=1.2)
        self.wait(0.3)

        # 3. Dos copias, en escalera a los lados de un rectángulo de (2n + 1) × T(n).
        marco = DashedVMobject(
            Rectangle(width=ancho * LADO, height=alto * LADO, color=GRIS, stroke_width=2).move_to(CENTRO_RECTANGULO),
            num_dashes=60,
        )
        rotulo = self.cambiar_rotulo(rotulo, "Dos copias, en escalera a los lados", Create(marco))

        def centro_bloque(esquina: tuple[int, int], k: int) -> np.ndarray:
            f0, c0 = esquina
            return (cuadricula.centro_de((f0, c0)) + cuadricula.centro_de((f0 + k - 1, c0 + k - 1))) / 2

        self.play(
            LaggedStart(*[grupos[0][k - 1].animate.move_to(centro_bloque(izquierda[k], k)) for k in range(1, n + 1)], lag_ratio=0.2),
            LaggedStart(*[grupos[1][k - 1].animate.move_to(centro_bloque(derecha[k], k)) for k in range(1, n + 1)], lag_ratio=0.2),
            run_time=2.2,
        )
        laterales = set()
        for k in range(1, n + 1):
            for esquinas in (izquierda, derecha):
                f0, c0 = esquinas[k]
                laterales |= {(f0 + f, c0 + c) for f in range(k) for c in range(k)}
        comprobar_casillas(cuadricula, VGroup(grupos[0], grupos[1]), laterales)
        rotulo = self.cambiar_rotulo(rotulo, "Queda un hueco en el medio")
        self.wait(0.6)

        # 4. La tercera copia se deshace en capas en L, que se enderezan en filas.
        rotulo = self.cambiar_rotulo(rotulo, "La tercera se deshace en capas en L de 1, 3, 5 y 7 casillas")
        self.wait(0.8)
        rotulo = self.cambiar_rotulo(rotulo, "Cada capa se endereza y rellena una franja del hueco")
        for k in range(1, n + 1):
            i = n + 1 - k  # en la franja k caben las capas de 2i − 1 casillas
            movimientos = []
            for j in range(i, n + 1):
                capa = capas_en_l(j)[i - 1]
                destino = centro[(j, i)]
                movimientos.append(
                    AnimationGroup(
                        *[copias[2][j][celda].animate.move_to(cuadricula.centro_de(d)) for celda, d in zip(capa, destino)]
                    )
                )
            self.play(LaggedStart(*movimientos, lag_ratio=0.25), run_time=1.3)
        comprobar_casillas(cuadricula, VGroup(*grupos), rectangulo(alto, ancho))
        self.play(FadeOut(rotulo), FadeOut(marco), run_time=0.5)

        # 5. Las medidas del rectángulo y la cuenta.
        figura = VGroup(*grupos)
        llave_ancho = Brace(figura, DOWN, buff=0.12, color=TEXTO)
        llave_alto = Brace(figura, LEFT, buff=0.12, color=TEXTO)
        texto_ancho = MathTex(rf"2 \cdot {n} + 1 = {ancho}", font_size=40).next_to(llave_ancho, DOWN, buff=0.15)
        texto_alto = VGroup(
            MathTex(" + ".join(map(str, range(1, n + 1))), font_size=40),
            MathTex(f"= {alto}", font_size=40),
        ).arrange(DOWN, buff=0.15, aligned_edge=RIGHT)
        texto_alto.next_to(llave_alto, LEFT, buff=0.15)
        self.play(GrowFromCenter(llave_ancho), GrowFromCenter(llave_alto), FadeIn(texto_ancho), FadeIn(texto_alto))

        suma_tex = " + ".join(f"{k}^2" for k in range(1, n + 1))
        explicacion_1 = Text("Tres copias = el rectángulo", font_size=28)
        cuenta_1 = MathTex(rf"3 \cdot ({suma_tex}) = {ancho} \cdot {alto}", font_size=40)
        explicacion_2 = Text("Una copia = la tercera parte", font_size=28)
        cuenta_2 = MathTex(rf"{suma_tex} = \frac{{{ancho} \cdot {alto}}}{{3}} = {total}", font_size=40)
        columna = VGroup(
            VGroup(explicacion_1, cuenta_1).arrange(DOWN, buff=0.25),
            VGroup(explicacion_2, cuenta_2).arrange(DOWN, buff=0.25),
        ).arrange(DOWN, buff=0.7)
        columna.move_to(RIGHT * 3.3 + DOWN * 0.3)
        self.play(FadeIn(explicacion_1), Write(cuenta_1), run_time=1.5)
        self.wait(0.8)
        self.play(FadeIn(explicacion_2), Write(cuenta_2), run_time=1.5)
        self.wait(1.5)

        # 6. Para cualquier n: el rectángulo mide (2n + 1) × n(n + 1)/2.
        self.play(*[FadeOut(m) for m in (titulo, figura, llave_ancho, llave_alto, texto_ancho, texto_alto, columna)], run_time=0.8)
        paso = MathTex(r"3\,(1^2 + 2^2 + \cdots + n^2) = (2n+1) \cdot \frac{n(n+1)}{2}", font_size=52)
        general = MathTex(r"1^2 + 2^2 + \cdots + n^2 = \frac{n(n+1)(2n+1)}{6}", font_size=64)
        VGroup(paso, general).arrange(DOWN, buff=0.8)
        caja = SurroundingRectangle(general, color=ACENTO, buff=0.3, corner_radius=0.1)
        self.play(Write(paso), run_time=1.5)
        self.wait(0.5)
        self.play(Write(general), run_time=1.5)
        self.play(Create(caja))
        self.wait(2)
