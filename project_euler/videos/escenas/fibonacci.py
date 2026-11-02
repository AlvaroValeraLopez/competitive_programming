"""Fibonacci: cuadrados de lados 1, 1, 2, 3, 5, 8, 13, 21 pegados en espiral.

Cada cuadrado se apoya en el lado largo del rectángulo que forman los anteriores, y ese
lado está hecho de los dos últimos cuadrados: es la recurrencia. Después, uno de cada tres
lados es par, las proporciones del rectángulo se acercan a la razón áurea y el área de los
cuadrados es la del rectángulo.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/fibonacci.py Fibonacci
"""

from fractions import Fraction

import numpy as np
from manim import (
    DOWN,
    LEFT,
    RIGHT,
    UP,
    AnimationGroup,
    Brace,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    GrowFromCenter,
    LaggedStart,
    MathTex,
    Square,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import espiral_fibonacci, fibonacci

CUANTOS = 8
CENTRO = np.array([-2.35, -0.35, 0.0])  # centro de la zona de la figura
ANCHO, ALTO = 6.4, 5.0  # tamaño máximo de la figura
UNIDAD_MAX = 1.1
X_PANEL = 1.9  # borde izquierdo del panel de la derecha


def decimal(q: Fraction) -> str:
    """q con tres decimales y coma; con «=» si es exacto y «≈» si no."""
    redondeado = round(q.numerator / q.denominator, 3)
    texto = f"{redondeado:.3f}".rstrip("0").rstrip(".").replace(".", "{,}")
    return ("= " if Fraction(str(redondeado)) == q else r"\approx ") + texto


class Fibonacci(EscenaEuler):
    def construct(self) -> None:
        f = fibonacci(CUANTOS + 1)
        cuadrados_int = espiral_fibonacci(CUANTOS)
        lados = [lado for _, _, lado in cuadrados_int]
        assert lados == f[1 : CUANTOS + 1]

        titulo = Text("Cada cuadrado mide lo que los dos anteriores juntos", font_size=30).to_edge(UP, buff=0.35)
        self.play(FadeIn(titulo, shift=0.2 * DOWN))

        # Encuadre: la figura de los k primeros cuadrados, centrada y tan grande como quepa.
        def encuadre(k: int) -> tuple[float, np.ndarray]:
            xs = [x for x, _, _ in cuadrados_int[:k]] + [x + l for x, _, l in cuadrados_int[:k]]
            ys = [y for _, y, _ in cuadrados_int[:k]] + [y + l for _, y, l in cuadrados_int[:k]]
            ancho, alto = max(xs) - min(xs), max(ys) - min(ys)
            unidad = min(UNIDAD_MAX, ANCHO / ancho, ALTO / alto)
            return unidad, np.array([(max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2, 0.0])

        def en_pantalla(p: np.ndarray, unidad: float, centro_int: np.ndarray) -> np.ndarray:
            return CENTRO + unidad * (p - centro_int)

        def tamano_etiqueta(lado: int, unidad: float) -> float:
            return min(64.0, 40 * lado * unidad)

        cuadrados = VGroup()
        etiquetas: list[MathTex] = []
        serie = VGroup()
        unidad, centro_int = encuadre(1)
        ecuacion = None
        for k, (x, y, lado) in enumerate(cuadrados_int, start=1):
            nueva_unidad, nuevo_centro = encuadre(k)
            factor = nueva_unidad / unidad
            desplazamiento = nueva_unidad * (centro_int - nuevo_centro)
            animaciones = []
            if k > 1:
                # Una animación por cuadrado: se reencuadra y, si es uno de los dos anteriores, se resalta.
                for i, previo in enumerate(cuadrados):
                    resaltado = k >= 3 and i in (k - 2, k - 3)
                    animaciones.append(
                        previo.animate.scale(factor, about_point=CENTRO)
                        .shift(desplazamiento)
                        .set_stroke(AZUL if resaltado else ACENTO_CLARO, width=6 if resaltado else 3)
                    )
                for (_, _, l), etiqueta in zip(cuadrados_int, etiquetas):
                    visible = tamano_etiqueta(l, nueva_unidad) >= 16
                    animaciones.append(
                        etiqueta.animate.scale(factor, about_point=CENTRO).shift(desplazamiento).set_opacity(1 if visible else 0)
                    )
            unidad, centro_int = nueva_unidad, nuevo_centro

            centro_cuadrado = en_pantalla(np.array([x + lado / 2, y + lado / 2, 0.0]), unidad, centro_int)
            cuadrado = Square(side_length=lado * unidad, color=ACENTO_CLARO, stroke_width=3, fill_color=ACENTO, fill_opacity=0.35)
            cuadrado.move_to(centro_cuadrado)
            etiqueta = MathTex(str(lado), font_size=tamano_etiqueta(lado, unidad)).move_to(centro_cuadrado)
            if tamano_etiqueta(lado, unidad) < 16:
                etiqueta.set_opacity(0)
            termino = MathTex(str(lado) + ("," if k < CUANTOS else r",\ \dots"), font_size=40)
            serie.add(termino)
            serie.arrange(RIGHT, buff=0.18, aligned_edge=DOWN).move_to(np.array([X_PANEL, 2.55, 0]), aligned_edge=LEFT)

            # Los dos cuadrados anteriores forman el lado en el que se apoya el nuevo.
            if k >= 3:
                assert lado == lados[k - 2] + lados[k - 3]
                nueva_ecuacion = MathTex(
                    str(lado), "=", str(lados[k - 2]), "+", str(lados[k - 3]), font_size=48
                ).move_to(np.array([X_PANEL + 2.2, 1.4, 0]))
                nueva_ecuacion[0].set_color(ACENTO_CLARO)
                nueva_ecuacion[2].set_color(AZUL)
                nueva_ecuacion[4].set_color(AZUL)
                self.play(*animaciones, *([FadeOut(ecuacion)] if ecuacion else []), run_time=0.8)
                self.play(FadeIn(cuadrado), FadeIn(etiqueta), FadeIn(termino), FadeIn(nueva_ecuacion), run_time=0.7)
                self.play(
                    cuadrados[k - 2].animate.set_stroke(ACENTO_CLARO, width=3),
                    cuadrados[k - 3].animate.set_stroke(ACENTO_CLARO, width=3),
                    run_time=0.3,
                )
                ecuacion = nueva_ecuacion
            else:
                self.play(*animaciones, FadeIn(cuadrado), FadeIn(etiqueta), FadeIn(termino), run_time=0.8)
            cuadrados.add(cuadrado)
            etiquetas.append(etiqueta)
        self.play(FadeOut(ecuacion), run_time=0.4)

        # Sin huecos ni solapes: el área de los cuadrados es la del rectángulo que los encierra.
        figura = VGroup(cuadrados, *etiquetas)
        assert abs(cuadrados.width * cuadrados.height - sum((l * unidad) ** 2 for l in lados)) < 1e-6 * cuadrados.width * cuadrados.height

        # 1. Uno de cada tres es par.
        rotulo = Text("Uno de cada tres es par", font_size=30).move_to(titulo)
        pares = [k for k, lado in enumerate(lados) if lado % 2 == 0]
        assert [k + 1 for k in pares] == [n for n in range(1, CUANTOS + 1) if n % 3 == 0]
        marcas = VGroup(
            *[
                Dot(radius=0.07, color=AZUL if lado % 2 == 0 else GRIS).next_to(termino[0][0], DOWN, buff=0.18)
                for lado, termino in zip(lados, serie)
            ]
        )
        self.play(FadeOut(titulo), FadeIn(rotulo))
        self.play(
            LaggedStart(*[FadeIn(m, scale=0.5) for m in marcas], lag_ratio=0.1),
            *[cuadrados[k].animate.set_fill(AZUL, opacity=0.6) for k in pares],
            *[serie[k].animate.set_color(AZUL) for k in pares],
            run_time=1.5,
        )
        self.wait(1.2)

        # 2. Las proporciones del rectángulo se acercan a la razón áurea.
        llave_ancho = Brace(cuadrados, DOWN, buff=0.1, color=TEXTO)
        llave_alto = Brace(cuadrados, LEFT, buff=0.1, color=TEXTO)
        largo, corto = f[CUANTOS + 1], f[CUANTOS]
        assert round(cuadrados.width / unidad) == largo and round(cuadrados.height / unidad) == corto
        texto_ancho = llave_ancho.get_tex(str(largo)).scale(0.8)
        texto_alto = llave_alto.get_tex(str(corto)).scale(0.8)
        rotulo_2 = Text("Su forma se acerca a la razón áurea", font_size=30).move_to(titulo)
        self.play(FadeOut(rotulo), FadeIn(rotulo_2), GrowFromCenter(llave_ancho), GrowFromCenter(llave_alto), FadeIn(texto_ancho), FadeIn(texto_alto))

        filas = VGroup()
        for n in range(1, CUANTOS + 1):
            q = Fraction(f[n + 1], f[n])
            filas.add(MathTex(rf"{f[n + 1]} / {f[n]} {decimal(q)}", font_size=34))
        filas.arrange_in_grid(rows=4, cols=2, col_alignments="ll", buff=(0.6, 0.16), flow_order="dr")
        filas.move_to(np.array([X_PANEL, 0.25, 0]), aligned_edge=LEFT)
        phi = (1 + 5**0.5) / 2
        aurea = MathTex(r"\varphi = \frac{1 + \sqrt{5}}{2} \approx " + f"{phi:.3f}".replace(".", "{,}"), font_size=40, color=ACENTO_CLARO)
        aurea.next_to(filas, DOWN, buff=0.45).align_to(filas, LEFT)
        self.play(LaggedStart(*[FadeIn(fila, shift=0.1 * RIGHT) for fila in filas], lag_ratio=0.25), run_time=2.4)
        self.play(Write(aurea))
        self.wait(1.5)

        # 3. El área de los cuadrados es la del rectángulo.
        self.play(*[FadeOut(m) for m in (rotulo_2, serie, marcas, filas, aurea, llave_ancho, llave_alto, texto_ancho, texto_alto)])
        assert sum(l * l for l in lados) == corto * largo
        rotulo_3 = Text("El área de los cuadrados es la del rectángulo", font_size=30).move_to(titulo)
        suma = MathTex(" + ".join(f"{l}^2" for l in lados), font_size=36)
        igual = MathTex(rf"= {corto} \cdot {largo}", font_size=44)
        general = MathTex(r"F_1^2 + F_2^2 + \cdots + F_n^2 = F_n \cdot F_{n+1}", font_size=48)
        bloque = VGroup(VGroup(suma, igual).arrange(DOWN, buff=0.2), general).arrange(DOWN, buff=0.7)
        self.play(FadeIn(rotulo_3), figura.animate.scale(0.7).move_to(np.array([-3.7, -0.25, 0])))
        bloque.next_to(figura, RIGHT, buff=0.6)
        if bloque.get_right()[0] > 6.9:
            bloque.scale_to_fit_width(6.9 - bloque.get_left()[0])
        self.play(Write(suma), run_time=1.5)
        self.play(Write(igual))
        self.wait(0.6)
        caja = SurroundingRectangle(general, color=ACENTO, buff=0.2, corner_radius=0.08)
        self.play(Write(general), run_time=1.2)
        self.play(Create(caja))
        self.wait(2)
