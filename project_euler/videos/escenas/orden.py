"""Orden multiplicativo: en la división de 1 entre 7, los restos saltan multiplicando por 10
y recorren un ciclo, que es el periodo del decimal; módulo 13, los doce restos se reparten en
ciclos de la misma longitud, y por eso el orden divide a p − 1.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/orden.py OrdenMultiplicativo
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    PI,
    RIGHT,
    UP,
    Arrow,
    Circle,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    GrowArrow,
    MathTex,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import ciclo_multiplicativo, ciclos_multiplicativos, division_larga

CENTRO = np.array([-3.3, -0.4, 0.0])
RADIO = 2.25
X_PANEL = 2.7


def posicion(resto: int, n: int) -> np.ndarray:
    a = PI / 2 - 2 * PI * resto / n
    return CENTRO + RADIO * np.array([np.cos(a), np.sin(a), 0.0])


def circulo_de_restos(n: int) -> tuple[VGroup, list[Dot], list[MathTex]]:
    puntos = [Dot(posicion(r, n), radius=0.09, color=GRIS) for r in range(n)]
    etiquetas = [
        MathTex(str(r), font_size=32, color=TEXTO).move_to(CENTRO + (RADIO + 0.42) / RADIO * (posicion(r, n) - CENTRO))
        for r in range(n)
    ]
    circulo = Circle(radius=RADIO, color=GRIS, stroke_width=2, stroke_opacity=0.5).move_to(CENTRO)
    return VGroup(circulo, *puntos, *etiquetas), puntos, etiquetas


def flecha(a: int, b: int, n: int, color) -> Arrow:
    return Arrow(posicion(a, n), posicion(b, n), buff=0.14, color=color, stroke_width=4, tip_length=0.2, max_tip_length_to_length_ratio=0.2)


class OrdenMultiplicativo(EscenaEuler):
    def construct(self) -> None:
        # 1. Dividir 1 entre 7: los restos saltan multiplicando por 10.
        d = 7
        titulo = Text("Dividir 1 entre 7: el resto se multiplica por 10", font_size=30).to_edge(UP, buff=0.4)
        rueda, puntos, etiquetas = circulo_de_restos(d)
        self.play(FadeIn(titulo, shift=0.2 * DOWN), FadeIn(rueda), run_time=1)
        ciclo = ciclo_multiplicativo(10, d, 1)
        pasos = division_larga(d, len(ciclo))
        assert [r for r, _, _ in pasos] == ciclo and pasos[-1][2] == 1
        self.play(puntos[1].animate.set_color(ACENTO_CLARO).scale(1.6), etiquetas[1].animate.set_color(ACENTO_CLARO))

        ancla = np.array([X_PANEL - 1.3, 1.9, 0])

        def decimal_con(cifras: list[int], final: str = "") -> MathTex:
            partes = [r"\tfrac{1}{7} = 0{,}"] + [str(c) for c in cifras] + ([final] if final else [])
            tex = MathTex(*partes, font_size=48).move_to(ancla, aligned_edge=LEFT)
            for parte in tex[1 : 1 + len(cifras)]:
                parte.set_color(ACENTO_CLARO)
            return tex

        decimal = decimal_con([])
        escritas: list[int] = []
        self.play(FadeIn(decimal))
        cuenta = None
        for k, (antes, cifra, despues) in enumerate(pasos):
            assert 10 * antes == cifra * d + despues
            nueva_cuenta = VGroup(
                MathTex(rf"10 \cdot {antes} = {10 * antes} = {cifra} \cdot {d} + {despues}", font_size=38),
                MathTex(rf"\text{{cifra }} {cifra},\ \text{{resto }} {despues}", font_size=34, color=ACENTO_CLARO),
            ).arrange(DOWN, buff=0.2).move_to(np.array([X_PANEL, 0.2, 0]))
            despacio = k < 2
            self.play(
                *([FadeOut(cuenta)] if cuenta else []),
                FadeIn(nueva_cuenta),
                GrowArrow(flecha(antes, despues, d, ACENTO_CLARO)),
                run_time=0.9 if despacio else 0.6,
            )
            escritas.append(cifra)
            nuevo_decimal = decimal_con(escritas)
            self.play(
                FadeOut(decimal),
                FadeIn(nuevo_decimal),
                puntos[despues].animate.set_color(ACENTO_CLARO).scale(1.6 if despues != 1 else 1),
                etiquetas[despues].animate.set_color(ACENTO_CLARO),
                run_time=0.5,
            )
            if despacio:
                self.wait(0.5)
            decimal = nuevo_decimal
            cuenta = nueva_cuenta
        assert "".join(map(str, escritas)) == "142857"
        cierre = VGroup(
            Text("El resto vuelve a 1: se repite todo", font_size=26),
            MathTex(rf"\text{{periodo}} = {len(ciclo)} = \operatorname{{ord}}_{{7}}(10)", font_size=40, color=ACENTO_CLARO),
        ).arrange(DOWN, buff=0.25).move_to(np.array([X_PANEL, -1.7, 0]))
        self.play(FadeIn(cierre, shift=0.2 * UP), FadeOut(decimal), FadeIn(decimal_con(escritas, r"\dots")))
        self.wait(1.5)

        # 2. Módulo 13: los doce restos se reparten en ciclos iguales.
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=0.8)
        p = 13
        titulo = Text("Módulo 13: los restos se reparten en ciclos iguales", font_size=30).to_edge(UP, buff=0.4)
        rueda, puntos, etiquetas = circulo_de_restos(p)
        ciclos = ciclos_multiplicativos(10, p)
        assert sorted(r for c in ciclos for r in c) == list(range(1, p)) and len({len(c) for c in ciclos}) == 1
        self.play(FadeIn(titulo, shift=0.2 * DOWN), FadeIn(rueda), run_time=1)
        colores = [ACENTO_CLARO, AZUL]
        textos = [
            MathTex(r"\tfrac{1}{13} = 0{,}\overline{" + "".join(str(c) for _, c, _ in division_larga(p, len(ciclos[0]))) + "}", font_size=44),
            MathTex(r"\tfrac{2}{13} = 0{,}\overline{" + "".join(str(c) for _, c, _ in division_larga(p, len(ciclos[1]), numerador=2)) + "}", font_size=44),
        ]
        for i, (ciclo, color) in enumerate(zip(ciclos, colores)):
            texto = VGroup(
                textos[i].set_color(color),
                MathTex(r" \to ".join(map(str, ciclo + [ciclo[0]])), font_size=34, color=color),
            ).arrange(DOWN, buff=0.2).move_to(np.array([X_PANEL, 1.3 - 1.7 * i, 0]))
            self.play(
                *[puntos[r].animate.set_color(color).scale(1.6) for r in ciclo],
                *[etiquetas[r].animate.set_color(color) for r in ciclo],
                FadeIn(texto[0]),
                run_time=0.8,
            )
            self.play(
                *[GrowArrow(flecha(a, b, p, color)) for a, b in zip(ciclo, ciclo[1:] + ciclo[:1])],
                FadeIn(texto[1]),
                run_time=1.6,
            )
            self.wait(0.8)
        largo = len(ciclos[0])
        conclusion = MathTex(
            rf"{p - 1} = {len(ciclos)} \cdot {largo} \;\Longrightarrow\; \operatorname{{ord}}_{{{p}}}(10) = {largo} \text{{ divide a }} {p - 1}",
            font_size=36, color=BLANCO,
        ).move_to(np.array([X_PANEL, -2.5, 0]))  # fmt: skip
        assert (p - 1) == len(ciclos) * largo
        self.play(Write(conclusion), run_time=1.2)
        self.wait(1.5)

        # 3. Las dos ideas.
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=0.8)
        ideas = VGroup(
            MathTex(r"\text{periodo de } \tfrac{1}{d} = \operatorname{ord}_d(10)", font_size=52),
            MathTex(r"\operatorname{ord}_p(a) \text{ divide a } p - 1", font_size=52, color=ACENTO_CLARO),
            Text("Cada resto da vueltas en un ciclo de la misma longitud", font_size=28),
        ).arrange(DOWN, buff=0.5)
        self.play(Write(ideas[0]), run_time=1.2)
        self.play(Create(SurroundingRectangle(ideas[0], color=ACENTO, buff=0.2, corner_radius=0.08)))
        self.play(Write(ideas[1]), FadeIn(ideas[2], shift=0.2 * UP), run_time=1.2)
        self.wait(2)

