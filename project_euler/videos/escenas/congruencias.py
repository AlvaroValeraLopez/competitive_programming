"""Congruencias: los números con el mismo resto módulo 7 caen en el mismo radio de una
espiral, los días de la semana avanzan como restos módulo 7, y para la última cifra de una
potencia basta con seguir los restos módulo 10.

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/congruencias.py Congruencias
"""

import numpy as np
from manim import (
    DOWN,
    LEFT,
    PI,
    RIGHT,
    UP,
    Circle,
    Create,
    Dot,
    FadeIn,
    FadeOut,
    Flash,
    LaggedStart,
    Line,
    MathTex,
    Rotate,
    SurroundingRectangle,
    Text,
    VGroup,
    VMobject,
    Write,
)

from euler_video.estilo import ACENTO, ACENTO_CLARO, AZUL, BLANCO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import primeros_de_mes

N = 7
HASTA = 27
CENTRO = np.array([-3.2, -0.35, 0.0])
ANIO = 1901
DIA_1_ENERO = 2  # martes: 1900 empezó en lunes y no fue bisiesto
NOMBRES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
X_PANEL = 2.6


def angulo(resto: int) -> float:
    """El radio de cada resto, empezando arriba y en el sentido de las agujas del reloj."""
    return PI / 2 - 2 * PI * resto / N


def punto(resto: int, radio: float) -> np.ndarray:
    return CENTRO + radio * np.array([np.cos(angulo(resto)), np.sin(angulo(resto)), 0.0])


class Congruencias(EscenaEuler):
    def construct(self) -> None:
        # 1. La espiral: los congruentes módulo 7 caen en el mismo radio.
        titulo = Text("Congruentes módulo 7: el mismo resto", font_size=32).to_edge(UP, buff=0.4)
        radio = lambda k: 0.85 + 0.55 * (k // N) + 0.55 * (k % N) / N
        radios = VGroup(*[Line(CENTRO, punto(r, 3.15), color=GRIS, stroke_width=1.5) for r in range(N)])
        espiral = VMobject(color=GRIS, stroke_width=2, stroke_opacity=0.45).set_points_smoothly([punto(k % N, radio(k)) for k in range(HASTA + 1)])
        numeros = VGroup(
            *[MathTex(str(k), font_size=30).move_to(punto(k % N, radio(k))) for k in range(HASTA + 1)]
        )
        self.play(FadeIn(titulo, shift=0.2 * DOWN), Create(radios), run_time=0.8)
        self.play(Create(espiral), LaggedStart(*[FadeIn(n, scale=0.6) for n in numeros], lag_ratio=0.08), run_time=3)
        resto = 3
        clase = [k for k in range(HASTA + 1) if k % N == resto]
        assert all((b - a) % N == 0 for a, b in zip(clase, clase[1:]))
        texto = MathTex(r" \equiv ".join(map(str, clase)) + r" \pmod 7", font_size=40, color=ACENTO_CLARO)
        explicacion = Text("Su diferencia es múltiplo de 7", font_size=26)
        panel = VGroup(texto, explicacion).arrange(DOWN, buff=0.3).move_to(np.array([X_PANEL, -0.2, 0]))
        self.play(
            radios[resto].animate.set_stroke(ACENTO_CLARO, width=4),
            *[numeros[k].animate.set_color(ACENTO_CLARO).scale(1.25) for k in clase],
            FadeIn(panel, shift=0.2 * UP),
        )
        self.wait(1.5)

        # 2. Los días de la semana avanzan módulo 7: los días 1 de cada mes de 1901.
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=0.8)
        titulo = Text(f"Los días 1 de cada mes de {ANIO}", font_size=32).to_edge(UP, buff=0.4)
        reloj = Circle(radius=2.1, color=GRIS, stroke_width=3).move_to(CENTRO)
        dias = VGroup(*[Text(CORTOS[w], font_size=26, color=TEXTO).move_to(punto(w, 2.65)) for w in range(N)])
        marcas = VGroup(*[Dot(punto(w, 2.1), radius=0.06, color=GRIS) for w in range(N)])
        dias[0].set_color(AZUL)
        marcador = Dot(punto(DIA_1_ENERO, 2.1), radius=0.16, color=ACENTO_CLARO)
        self.play(FadeIn(titulo, shift=0.2 * DOWN), Create(reloj), FadeIn(dias), FadeIn(marcas), run_time=1)
        inicio = MathTex(r"\text{1 de enero: } \text{" + NOMBRES[DIA_1_ENERO] + "}", font_size=36)
        inicio.move_to(np.array([X_PANEL, 1.4, 0]))
        self.play(FadeIn(marcador, scale=0.5), FadeIn(inicio))

        filas = primeros_de_mes(ANIO, DIA_1_ENERO)
        domingos = 0
        contador = MathTex(r"\text{domingos: } 0", font_size=36, color=AZUL).move_to(np.array([X_PANEL, -2.0, 0]))
        self.play(FadeIn(contador))
        paso = None
        for i, (mes, dia, longitud) in enumerate(filas):
            assert punto(dia, 2.1) is not None
            if i == len(filas) - 1:
                break
            avance = longitud % N
            siguiente_mes, siguiente_dia, _ = filas[i + 1]
            assert (dia + avance) % N == siguiente_dia
            nuevo_paso = VGroup(
                MathTex(rf"\text{{{mes}: }} {longitud} \text{{ días}} \equiv {avance}", font_size=36),
                MathTex(rf"\text{{1 de {siguiente_mes}: {NOMBRES[siguiente_dia]}}}", font_size=36, color=ACENTO_CLARO),
            ).arrange(DOWN, buff=0.25).move_to(np.array([X_PANEL, 0.0, 0]))
            despacio = i < 3
            self.play(*([FadeOut(paso)] if paso else []), FadeIn(nuevo_paso[0]), run_time=0.5 if despacio else 0.25)
            if avance:
                self.play(Rotate(marcador, angle=-2 * PI * avance / N, about_point=CENTRO), run_time=0.8 if despacio else 0.4)
            self.play(FadeIn(nuevo_paso[1]), run_time=0.4 if despacio else 0.2)
            assert np.allclose(marcador.get_center(), punto(siguiente_dia, 2.1), atol=1e-6)
            if siguiente_dia == 0:
                domingos += 1
                nuevo_contador = MathTex(rf"\text{{domingos: }} {domingos}", font_size=36, color=AZUL).move_to(contador)
                self.play(Flash(marcador, color=AZUL), FadeOut(contador), FadeIn(nuevo_contador), run_time=0.6)
                contador = nuevo_contador
            if despacio:
                self.wait(0.4)
            paso = nuevo_paso
        assert domingos == sum(1 for _, dia, _ in filas if dia == 0)
        self.wait(1)

        # 3. La última cifra de una potencia: restos módulo 10.
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=0.8)
        titulo = Text("Solo importan los restos", font_size=32).to_edge(UP, buff=0.4)
        potencias = VGroup()
        for k in range(1, 5):
            assert (7**k) % 10 == pow(7, k, 10)
            potencias.add(MathTex(rf"7^{k} = {7**k} \equiv {pow(7, k, 10)} \pmod{{10}}", font_size=40))
        potencias.arrange(DOWN, buff=0.25, aligned_edge=LEFT).move_to(np.array([0, 0.9, 0]))
        assert pow(7, 4, 10) == 1 and pow(7, 100, 10) == 1
        conclusion = MathTex(r"7^{100} = \left(7^4\right)^{25} \equiv 1^{25} = 1 \pmod{10}", font_size=44, color=ACENTO_CLARO)
        definicion = MathTex(r"a \equiv b \pmod n \iff n \mid a - b", font_size=48)
        VGroup(conclusion, definicion).arrange(DOWN, buff=0.6).next_to(potencias, DOWN, buff=0.6)
        self.play(FadeIn(titulo, shift=0.2 * DOWN), LaggedStart(*[FadeIn(p, shift=0.2 * RIGHT) for p in potencias], lag_ratio=0.3), run_time=2)
        self.play(Write(conclusion), run_time=1.2)
        self.play(Write(definicion), Create(SurroundingRectangle(definicion, color=ACENTO, buff=0.2, corner_radius=0.08)))
        self.wait(2)
