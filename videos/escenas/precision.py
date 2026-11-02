"""Precisión arbitraria: por encima de 2⁵³ un Number ya no guarda todos los enteros, y una
lista de cifras con llevadas suma números de cualquier tamaño, columna a columna.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/precision.py PrecisionArbitraria
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    Circle,
    Create,
    CurvedArrow,
    Dot,
    FadeIn,
    FadeOut,
    LaggedStart,
    Line,
    MathTex,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import como_doble, suma_con_llevadas

BASE = 2**53
DESDE, HASTA = -2, 6  # enteros 2^53 + k que se dibujan en la recta
PASO_RECTA = 1.35
A = 2**63
X_UNIDADES = 4.9  # columna de las unidades en la suma
PASO = 0.5
Y_LLEVADA, Y_A, Y_B, Y_RAYA, Y_SUMA = 1.75, 1.05, 0.35, -0.05, -0.6
CODIGO = "Menlo"


def x_recta(k: int) -> float:
    return (k - (DESDE + HASTA) / 2) * PASO_RECTA


def etiqueta_k(k: int) -> str:
    if k == 0:
        return "2^{53}"
    return rf"2^{{53}} {'+' if k > 0 else '-'} {abs(k)}"


class PrecisionArbitraria(EscenaEuler):
    def construct(self) -> None:
        # 1. Por encima de 2^53, un Number no guarda todos los enteros.
        titulo = Text("Un Number solo guarda unas 16 cifras", font_size=32).to_edge(UP, buff=0.4)
        y = 0.3
        recta = Line(np.array([x_recta(DESDE) - 0.6, y, 0]), np.array([x_recta(HASTA) + 0.6, y, 0]), color=GRIS)
        marcas = VGroup(
            *[
                MathTex(etiqueta_k(k), font_size=24, color=TEXTO).move_to(np.array([x_recta(k), y - 0.55 - 0.35 * (k % 2), 0]))
                for k in range(DESDE, HASTA + 1)
            ]
        )
        self.play(FadeIn(titulo, shift=0.2 * DOWN), Create(recta), FadeIn(marcas), run_time=1.2)

        hasta_base = VGroup(*[Dot(np.array([x_recta(k), y, 0]), radius=0.1, color=ACENTO_CLARO) for k in range(DESDE, 1)])
        rotulo = Text("Hasta 2⁵³, todos los enteros son exactos", font_size=28).to_edge(DOWN, buff=0.5)
        self.play(LaggedStart(*[FadeIn(p, scale=0.5) for p in hasta_base], lag_ratio=0.2), FadeIn(rotulo))
        self.wait(0.6)

        rotulo = self.cambiar_rotulo(rotulo, "Por encima, solo caben los pares; los demás se redondean")
        for k in range(1, HASTA + 1):
            destino = como_doble(BASE + k) - BASE
            punto = np.array([x_recta(k), y, 0])
            if destino == k:
                self.play(FadeIn(Dot(punto, radius=0.1, color=ACENTO_CLARO), scale=0.5), run_time=0.4)
            else:
                assert k % 2 == 1 and destino % 2 == 0
                hueco = Circle(radius=0.1, color=GRIS, stroke_width=3).move_to(punto)
                flecha = CurvedArrow(
                    punto + 0.15 * UP, np.array([x_recta(destino), y, 0]) + 0.15 * UP,
                    angle=-1.2 if destino > k else 1.2, color=AZUL, stroke_width=3, tip_length=0.15,
                )  # fmt: skip
                self.play(Create(hueco), Create(flecha), run_time=0.6)
        codigo = Text("2 ** 53 + 1 === 2 ** 53   // true", font=CODIGO, font_size=26, color=BLANCO)
        codigo.move_to(np.array([0, 2.2, 0]))
        self.play(FadeIn(codigo, shift=0.2 * DOWN))
        self.wait(1.5)

        # 2. Con una lista de cifras no hay límite: sumamos como en el colegio.
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=0.8)
        columnas = suma_con_llevadas(A, A)
        total = A + A
        assert sum(escrita * 10**i for i, (_, _, _, escrita, _) in enumerate(columnas)) == total == 2**64
        titulo = Text("Con una lista de cifras, sin límite", font_size=32).to_edge(UP, buff=0.4)

        def x_col(i: int) -> float:
            return X_UNIDADES - i * PASO

        def cifras(numero: int, y: float, color) -> VGroup:
            texto = str(numero)[::-1]
            return VGroup(*[MathTex(c, font_size=40, color=color).move_to(np.array([x_col(i), y, 0])) for i, c in enumerate(texto)])

        fila_a, fila_b = cifras(A, Y_A, BLANCO), cifras(A, Y_B, BLANCO)
        mas = MathTex("+", font_size=40).move_to(np.array([x_col(len(columnas) - 1) - 0.1, Y_B, 0]))
        raya = Line(np.array([x_col(len(columnas) - 1) - 0.4, Y_RAYA, 0]), np.array([X_UNIDADES + 0.3, Y_RAYA, 0]), color=GRIS)
        etiquetas = VGroup(
            MathTex("2^{63}", font_size=32, color=TEXTO).next_to(fila_a, RIGHT, buff=0.45),
            MathTex("2^{63}", font_size=32, color=TEXTO).next_to(fila_b, RIGHT, buff=0.45),
        )
        self.play(FadeIn(titulo, shift=0.2 * DOWN), Write(fila_a), Write(fila_b), FadeIn(mas), Create(raya), FadeIn(etiquetas), run_time=1.5)
        rotulo = Text("De derecha a izquierda: se escribe la cifra y se lleva la decena", font_size=26).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(rotulo))

        resultado = VGroup()
        llevadas = VGroup()
        cuenta = None
        marco = None
        for i, (x, y_, entra, escrita, sale) in enumerate(columnas):
            despacio = i < 4
            if i < len(fila_a):
                enmarcado = VGroup(fila_a[i], fila_b[i])
            else:  # la última columna solo escribe la llevada
                enmarcado = Dot(np.array([x_col(i), (Y_A + Y_B) / 2, 0]), radius=0.25).set_opacity(0)
            nuevo_marco = SurroundingRectangle(enmarcado, color=ACENTO, buff=0.1, corner_radius=0.06)
            nueva_cuenta = MathTex(
                rf"{x} + {y_} + {entra} = {x + y_ + entra}", font_size=40, color=TEXTO
            ).move_to(np.array([0, -1.75, 0]))
            cifra = MathTex(str(escrita), font_size=40, color=ACENTO_CLARO).move_to(np.array([x_col(i), Y_SUMA, 0]))
            animaciones = [FadeIn(cifra, shift=0.15 * DOWN)]
            if marco is None:
                animaciones += [Create(nuevo_marco), FadeIn(nueva_cuenta)]
            else:
                animaciones += [FadeOut(marco), FadeIn(nuevo_marco), FadeOut(cuenta), FadeIn(nueva_cuenta)]
            if sale:
                llevada = MathTex("1", font_size=28, color=AZUL).move_to(np.array([x_col(i + 1), Y_LLEVADA, 0]))
                animaciones.append(FadeIn(llevada, shift=0.15 * LEFT))
                llevadas.add(llevada)
            self.play(*animaciones, run_time=0.9 if despacio else 0.3)
            if despacio:
                self.wait(0.4)
            marco, cuenta = nuevo_marco, nueva_cuenta
            resultado.add(cifra)
        assert "".join(c.get_tex_string() for c in reversed(resultado)) == str(total)
        self.play(FadeOut(marco), FadeOut(cuenta), run_time=0.4)
        etiqueta_suma = MathTex("2^{64}", font_size=32, color=ACENTO_CLARO).next_to(resultado, RIGHT, buff=0.45)
        rotulo = self.cambiar_rotulo(rotulo, "La llevada nunca pasa de 1: como mucho, 9 + 9 + 1 = 19", FadeIn(etiqueta_suma))
        self.wait(1.5)

        # 3. La idea.
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=0.8)
        resumen = VGroup(
            MathTex(r"N = \sum_{i} d_i \cdot 10^i", font_size=56),
            Text("Un número grande es una lista de cifras", font_size=30),
            Text("Sumar dos números de k cifras cuesta k pasos", font_size=30, color=ACENTO_CLARO),
        ).arrange(DOWN, buff=0.45)
        caja = SurroundingRectangle(resumen[0], color=ACENTO, buff=0.25, corner_radius=0.1)
        self.play(Write(resumen[0]), run_time=1.2)
        self.play(Create(caja), FadeIn(resumen[1], shift=0.2 * UP))
        self.play(FadeIn(resumen[2], shift=0.2 * UP))
        self.wait(2)
