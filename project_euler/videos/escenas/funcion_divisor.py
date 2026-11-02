"""Función divisor: los divisores de 72 = 2³ · 3² forman una tabla de 4 × 3, así que d(72) = 12.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/funcion_divisor.py FuncionDivisor
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Brace,
    Create,
    FadeIn,
    FadeOut,
    GrowFromCenter,
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
from euler_video.matematicas import divisores, factorizar, numero_divisores, tabla_divisores

N = 72
CELDA_X, CELDA_Y = 1.25, 0.85
ORIGEN_TABLA = np.array([-3.5, 1.15, 0.0])  # centro de la celda (0, 0)


def centro_celda(i: int, j: int) -> np.ndarray:
    return ORIGEN_TABLA + j * CELDA_X * RIGHT + i * CELDA_Y * DOWN


class FuncionDivisor(EscenaEuler):
    def construct(self) -> None:
        (p, a), (q, b) = factorizar(N)
        tabla = tabla_divisores(N)
        uno_a_uno = divisores(N)
        assert sorted(v for fila in tabla for v in fila) == uno_a_uno
        assert numero_divisores(N) == (a + 1) * (b + 1) == len(uno_a_uno)

        factorizacion = MathTex(rf"{N} = {p}^{{{a}}} \cdot {q}^{{{b}}}", font_size=64).to_edge(UP, buff=0.5)
        pregunta = Text(f"¿Cuántos divisores tiene {N}?", font_size=30).next_to(factorizacion, DOWN, buff=0.25)
        self.play(Write(factorizacion))
        self.play(FadeIn(pregunta, shift=0.2 * DOWN))
        self.wait(0.5)

        # Cabeceras: las potencias de cada primo que pueden aparecer en un divisor.
        filas = VGroup(*[MathTex(rf"{p}^{{{i}}}", font_size=40, color=ACENTO_CLARO) for i in range(a + 1)])
        columnas = VGroup(*[MathTex(rf"{q}^{{{j}}}", font_size=40, color=AZUL) for j in range(b + 1)])
        for i, m in enumerate(filas):
            m.move_to(centro_celda(i, 0) + CELDA_X * LEFT)
        for j, m in enumerate(columnas):
            m.move_to(centro_celda(0, j) + CELDA_Y * UP)
        self.play(FadeOut(pregunta), LaggedStart(*[FadeIn(m) for m in [*filas, *columnas]], lag_ratio=0.1))

        # Cada casilla es un divisor distinto: pⁱ · qʲ.
        fondos = VGroup()
        valores = VGroup()
        for i in range(a + 1):
            for j in range(b + 1):
                fondo = RoundedRectangle(
                    width=CELDA_X - 0.12,
                    height=CELDA_Y - 0.12,
                    corner_radius=0.1,
                    stroke_width=0,
                    fill_color=GRIS,
                    fill_opacity=0.35,
                ).move_to(centro_celda(i, j))
                fondos.add(fondo)
                valores.add(MathTex(str(tabla[i][j]), font_size=40).move_to(fondo))
        self.play(FadeIn(fondos, lag_ratio=0.05), run_time=0.8)
        for i in range(a + 1):
            fila = [valores[i * (b + 1) + j] for j in range(b + 1)]
            self.play(
                *[TransformFromCopy(VGroup(filas[i], columnas[j]), fila[j]) for j in range(b + 1)],
                run_time=0.8,
            )
        self.wait(0.5)

        # Contar la tabla: (a + 1) filas por (b + 1) columnas.
        llave_filas = Brace(VGroup(fondos, filas), LEFT, buff=0.15)
        llave_columnas = Brace(fondos, DOWN, buff=0.15)
        texto_filas = llave_filas.get_tex(rf"{a} + 1").set_color(ACENTO_CLARO)
        texto_columnas = llave_columnas.get_tex(rf"{b} + 1").set_color(AZUL)
        self.play(
            GrowFromCenter(llave_filas),
            GrowFromCenter(llave_columnas),
            FadeIn(texto_filas),
            FadeIn(texto_columnas),
        )

        cuenta = MathTex(
            rf"d({N}) = ({a} + 1)({b} + 1) = {(a + 1) * (b + 1)}",
            font_size=48,
        ).move_to(3.4 * RIGHT + 0.6 * UP)
        self.play(Write(cuenta))
        self.play(Create(SurroundingRectangle(cuenta, color=ACENTO, buff=0.2)))

        mitad = (len(uno_a_uno) + 1) // 2
        comprobacion = VGroup(
            Text("Probando uno a uno:", font_size=26),
            MathTex(", ".join(map(str, uno_a_uno[:mitad])) + ",", font_size=36),
            MathTex(", ".join(map(str, uno_a_uno[mitad:])), font_size=36),
            Text(f"{len(uno_a_uno)} divisores", font_size=26, color=ACENTO_CLARO),
        ).arrange(DOWN, buff=0.2)
        comprobacion.next_to(cuenta, DOWN, buff=0.8)
        self.play(FadeIn(comprobacion, shift=0.2 * UP))
        self.wait(1.5)

        # La regla general.
        self.play(*[FadeOut(m) for m in self.mobjects])
        general = MathTex(
            r"n = p_1^{e_1} \cdots p_r^{e_r}",
            r"\;\Longrightarrow\;",
            r"d(n) = (e_1 + 1) \cdots (e_r + 1)",
            font_size=56,
        )
        caja = SurroundingRectangle(general, color=ACENTO, buff=0.35, corner_radius=0.1)
        self.play(Write(general), run_time=2)
        self.play(Create(caja))
        self.wait(2)
