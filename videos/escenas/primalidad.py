"""Test de primalidad: los divisores van por parejas (d, n/d) y el menor de cada pareja
no pasa de √n, así que basta con probar hasta la raíz.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/primalidad.py Primalidad
"""

from math import atan, isqrt, sqrt

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    ArcBetweenPoints,
    Circle,
    Create,
    DashedLine,
    FadeIn,
    FadeOut,
    LaggedStart,
    MathTex,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import divisores, es_primo, pares_de_divisores

N_PAREJAS = 36
PRIMO, COMPUESTO = 97, 91
PASO = 1.3  # separación entre divisores consecutivos (en orden, no a escala)
Y_FILA = -1.6
ALTURA_MIN, SALTO = 1.1, 0.65  # altura del arco más interior y separación entre arcos


def decimal(x: float) -> str:
    return f"{x:.1f}".replace(".", "{,}")


class Primalidad(EscenaEuler):
    def construct(self) -> None:
        divs = divisores(N_PAREJAS)
        pares = pares_de_divisores(N_PAREJAS)
        raiz = isqrt(N_PAREJAS)
        assert raiz * raiz == N_PAREJAS
        assert all(d <= raiz <= e for d, e in pares)
        # Ordenados, el i-ésimo divisor por la izquierda se empareja con el i-ésimo por la derecha.
        assert pares == [(divs[i], divs[-1 - i]) for i in range(len(pares))]

        # 1. Los divisores de 36, en orden y emparejados.
        titulo = Text(f"Los divisores de {N_PAREJAS} van por parejas", font_size=32).to_edge(UP, buff=0.4)
        mitad = (len(divs) - 1) / 2
        numeros = VGroup(
            *[
                MathTex(str(d), font_size=40).move_to(np.array([(i - mitad) * PASO, Y_FILA, 0.0]))
                for i, d in enumerate(divs)
            ]
        )
        self.play(FadeIn(titulo, shift=0.2 * DOWN))
        self.play(LaggedStart(*[FadeIn(n, shift=0.1 * UP) for n in numeros], lag_ratio=0.1), run_time=1.2)

        arcos, etiquetas_par = VGroup(), VGroup()
        for i, (d, e) in enumerate(pares):
            izquierdo, derecho = numeros[i], numeros[len(divs) - 1 - i]
            if d == e:
                arco = Circle(radius=0.3, color=ACENTO, stroke_width=4).move_to(izquierdo)
                etiqueta = MathTex(rf"{d} \cdot {e}", font_size=26, color=TEXTO).next_to(arco, UP, buff=0.08)
            else:
                # Arcos igual de separados: un arco de cuerda c y altura h abarca 4·atan(2h/c).
                cuerda = (len(divs) - 1 - 2 * i) * PASO
                altura = ALTURA_MIN + SALTO * (len(pares) - 2 - i)
                arco = ArcBetweenPoints(
                    izquierdo.get_top() + 0.1 * UP, derecho.get_top() + 0.1 * UP,
                    angle=-4 * atan(2 * altura / cuerda), color=ACENTO, stroke_width=4,
                )  # fmt: skip
                etiqueta = MathTex(rf"{d} \cdot {e}", font_size=26, color=TEXTO)
                etiqueta.next_to(arco.get_top(), DOWN, buff=0.12)
            arcos.add(arco)
            etiquetas_par.add(etiqueta)
        for arco, etiqueta in zip(arcos, etiquetas_par):
            self.play(Create(arco), FadeIn(etiqueta), run_time=0.6)
        self.wait(0.4)

        centro = numeros[pares.index((raiz, raiz))]
        linea_raiz = DashedLine(centro.get_bottom() + 0.3 * DOWN, centro.get_bottom() + 0.7 * DOWN, color=ACENTO_CLARO)
        texto_raiz = MathTex(rf"\sqrt{{{N_PAREJAS}}} = {raiz}", font_size=34, color=ACENTO_CLARO)
        texto_raiz.next_to(linea_raiz, DOWN, buff=0.1)
        conclusion = Text(
            f"En cada pareja, el menor no pasa de √{N_PAREJAS}", font_size=28, color=ACENTO_CLARO
        ).to_edge(DOWN, buff=0.3)
        izquierdos = [numeros[divs.index(d)] for d, _ in pares]
        self.play(Create(linea_raiz), FadeIn(texto_raiz), *[n.animate.set_color(ACENTO_CLARO) for n in izquierdos])
        self.play(FadeIn(conclusion, shift=0.2 * UP))
        self.wait(1.5)

        # 2. Probar solo hasta la raíz: 97 es primo; 91 cae en el 7.
        self.play(*[FadeOut(m) for m in self.mobjects])
        titulo2 = Text("Basta con probar divisores hasta la raíz", font_size=32).to_edge(UP, buff=0.4)
        self.play(FadeIn(titulo2, shift=0.2 * DOWN))

        filas = VGroup()
        for n in (PRIMO, COMPUESTO):
            limite = isqrt(n)
            pruebas = []
            for d in range(2, limite + 1):
                pruebas.append((d, n % d))
                if n % d == 0:
                    break
            assert es_primo(n) == all(r for _, r in pruebas)
            cabecera = MathTex(rf"{n}:\ \sqrt{{{n}}} \approx {decimal(sqrt(n))}", font_size=36)
            fichas = VGroup()
            for d, resto in pruebas:
                color = AZUL if resto == 0 else GRIS
                ficha = VGroup(
                    MathTex(rf"\div {d}", font_size=34),
                    MathTex(rf"\text{{resto }} {resto}", font_size=26, color=BLANCO if resto == 0 else TEXTO),
                ).arrange(DOWN, buff=0.08)
                caja = SurroundingRectangle(ficha, color=color, buff=0.1, corner_radius=0.08)
                if resto == 0:
                    caja.set_fill(AZUL, opacity=0.25)
                fichas.add(VGroup(caja, ficha))
            fichas.arrange(RIGHT, buff=0.15)
            if es_primo(n):
                veredicto = Text(f"Ningún resto es 0: {n} es primo", font_size=30, color=ACENTO_CLARO)
                detalle = Text(f"{len(pruebas)} pruebas en vez de {n - 2}", font_size=24, color=TEXTO)
            else:
                d = pruebas[-1][0]
                veredicto = MathTex(rf"{n} = {d} \cdot {n // d}", font_size=34, color=AZUL)
                detalle = Text("Un divisor basta para descartarlo", font_size=24, color=TEXTO)
            fila = VGroup(cabecera, fichas, VGroup(veredicto, detalle).arrange(DOWN, buff=0.12, aligned_edge=LEFT)).arrange(
                DOWN, buff=0.3, aligned_edge=LEFT
            )
            filas.add(fila)
        filas.arrange(DOWN, buff=0.7, aligned_edge=LEFT).next_to(titulo2, DOWN, buff=0.5)

        for fila in filas:
            cabecera, fichas, final = fila
            self.play(Write(cabecera), run_time=0.8)
            self.play(LaggedStart(*[FadeIn(f, shift=0.1 * RIGHT) for f in fichas], lag_ratio=0.25), run_time=1.6)
            self.play(FadeIn(final, shift=0.2 * UP))
            self.wait(0.6)

        # 3. La regla.
        self.play(*[FadeOut(m) for m in self.mobjects])
        regla = VGroup(
            MathTex(r"n \text{ es primo}", font_size=56),
            MathTex(r"\Longleftrightarrow", font_size=56),
            MathTex(r"\text{ningún } d \text{ con } 2 \le d \le \sqrt{n} \text{ divide a } n", font_size=48),
        ).arrange(DOWN, buff=0.35)
        caja = SurroundingRectangle(regla, color=ACENTO, buff=0.4, corner_radius=0.1)
        coste = Text("Coste: unas √n divisiones", font_size=28, color=TEXTO).next_to(caja, DOWN, buff=0.4)
        self.play(Write(regla), run_time=2)
        self.play(Create(caja), FadeIn(coste, shift=0.2 * UP))
        self.wait(2)
