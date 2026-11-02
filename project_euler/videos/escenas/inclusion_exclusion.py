"""Inclusión-exclusión: contar los múltiplos de 3 o de 5 del 1 al 30 sin contar dos veces los comunes.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/inclusion_exclusion.py InclusionExclusion
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
    Indicate,
    Intersection,
    LaggedStart,
    MathTex,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.componentes import comprobar_region
from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, EscenaEuler
from euler_video.matematicas import multiplos, tamano_union

A_DIVISOR, B_DIVISOR, HASTA = 3, 5, 30
RADIO = 2.3
CENTRO_A = np.array([-1.6, -0.5, 0.0])
CENTRO_B = np.array([1.6, -0.5, 0.0])


def rejilla(valores: list[int], centro: np.ndarray, columnas: int, paso_x: float, paso_y: float) -> VGroup:
    """Coloca los números en filas de `columnas`, centradas en `centro`."""
    grupo = VGroup()
    filas = (len(valores) + columnas - 1) // columnas
    for i, valor in enumerate(valores):
        f, c = divmod(i, columnas)
        x = (c - (columnas - 1) / 2) * paso_x
        y = ((filas - 1) / 2 - f) * paso_y
        grupo.add(MathTex(str(valor), font_size=40).move_to(centro + np.array([x, y, 0.0])))
    return grupo


class InclusionExclusion(EscenaEuler):
    def construct(self) -> None:
        a = set(multiplos(A_DIVISOR, HASTA))
        b = set(multiplos(B_DIVISOR, HASTA))
        solo_a, solo_b, ambos = sorted(a - b), sorted(b - a), sorted(a & b)
        union = tamano_union(a, b)
        assert union == len(a | b)

        pregunta = Text(
            f"¿Cuántos números del 1 al {HASTA} son múltiplos de {A_DIVISOR} o de {B_DIVISOR}?",
            font_size=32,
        ).to_edge(UP, buff=0.45)
        self.play(FadeIn(pregunta, shift=0.2 * DOWN))

        # Los dos conjuntos y sus elementos, cada uno en su región.
        circulo_a = Circle(radius=RADIO, color=ACENTO, stroke_width=5).move_to(CENTRO_A)
        circulo_b = Circle(radius=RADIO, color=AZUL, stroke_width=5).move_to(CENTRO_B)
        nombre_a = Text(f"Múltiplos de {A_DIVISOR}", font_size=26, color=ACENTO_CLARO)
        nombre_a.next_to(circulo_a, UP, buff=0.15).shift(0.8 * LEFT)
        nombre_b = Text(f"Múltiplos de {B_DIVISOR}", font_size=26, color=AZUL)
        nombre_b.next_to(circulo_b, UP, buff=0.15).shift(0.8 * RIGHT)

        numeros_a = rejilla(solo_a, CENTRO_A + 1.05 * LEFT, columnas=2, paso_x=0.8, paso_y=0.68)
        numeros_b = rejilla(solo_b, CENTRO_B + 1.05 * RIGHT, columnas=2, paso_x=0.8, paso_y=0.75)
        numeros_ambos = rejilla(ambos, (CENTRO_A + CENTRO_B) / 2, columnas=1, paso_x=0, paso_y=0.85)
        for valor, m in zip(solo_a, numeros_a):
            comprobar_region(f"El {valor}", m, dentro=[circulo_a], fuera=[circulo_b])
        for valor, m in zip(solo_b, numeros_b):
            comprobar_region(f"El {valor}", m, dentro=[circulo_b], fuera=[circulo_a])
        for valor, m in zip(ambos, numeros_ambos):
            comprobar_region(f"El {valor}", m, dentro=[circulo_a, circulo_b], fuera=[])

        # El recuento, a la derecha.
        cuenta_a = MathTex(rf"|A| = {len(a)}", font_size=40)
        cuenta_b = MathTex(rf"|B| = {len(b)}", font_size=40)
        suma = MathTex(rf"{len(a)} + {len(b)} = {len(a) + len(b)}", font_size=40)
        resta = MathTex(rf"{len(a) + len(b)} - {len(a & b)} = {union}", font_size=40, color=ACENTO_CLARO)
        recuento = VGroup(cuenta_a, cuenta_b, suma, resta).arrange(DOWN, aligned_edge=LEFT, buff=0.35)
        recuento.move_to(5.5 * RIGHT + 0.3 * UP)

        self.play(Create(circulo_a), FadeIn(nombre_a))
        self.play(
            LaggedStart(*[FadeIn(m, scale=0.6) for m in [*numeros_a, *numeros_ambos]], lag_ratio=0.12),
            run_time=1.5,
        )
        self.play(Write(cuenta_a))

        self.play(Create(circulo_b), FadeIn(nombre_b))
        self.play(LaggedStart(*[FadeIn(m, scale=0.6) for m in numeros_b], lag_ratio=0.15))
        self.play(*[Indicate(m, color=AZUL, scale_factor=1.3) for m in numeros_ambos])
        self.play(Write(cuenta_b))
        self.play(Write(suma))
        self.wait(0.5)

        # Los comunes se han contado dos veces: hay que restarlos una vez.
        lente = Intersection(circulo_a, circulo_b, fill_color=ACENTO_CLARO, fill_opacity=0.25, stroke_width=0)
        aviso = Text(
            f"{' y '.join(map(str, ambos))} se han contado dos veces",
            font_size=26,
            color=ACENTO_CLARO,
        ).next_to(VGroup(circulo_a, circulo_b), DOWN, buff=0.3)
        self.play(FadeIn(lente), FadeIn(aviso, shift=0.2 * UP))
        self.play(*[Indicate(m, color=ACENTO_CLARO, scale_factor=1.3) for m in numeros_ambos])
        self.play(Write(resta))
        self.play(Create(SurroundingRectangle(resta, color=ACENTO, buff=0.15)))
        self.wait(1)

        # La fórmula general, comprobada contando uno a uno.
        self.play(*[FadeOut(m) for m in self.mobjects])
        formula = MathTex(r"|A \cup B| = |A| + |B| - |A \cap B|", font_size=64)
        aplicada = MathTex(rf"= {len(a)} + {len(b)} - {len(a & b)} = {union}", font_size=48)
        uno_a_uno = Text(
            "Contando uno a uno: " + ", ".join(map(str, sorted(a | b))),
            font_size=24,
        )
        VGroup(formula, aplicada, uno_a_uno).arrange(DOWN, buff=0.7)
        caja = SurroundingRectangle(formula, color=ACENTO, buff=0.3, corner_radius=0.1)
        self.play(Write(formula), run_time=1.5)
        self.play(Create(caja))
        self.play(Write(aplicada))
        self.play(FadeIn(uno_a_uno, shift=0.2 * UP))
        self.wait(2)
