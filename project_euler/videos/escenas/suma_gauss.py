"""Suma de Gauss: dos escaleras de 1 + 2 + ... + n casillas forman un rectángulo de n × (n + 1).

Vista previa rápida (baja calidad):

    uv run manim -pql escenas/suma_gauss.py SumaGauss
"""

from manim import (
    DOWN,
    LEFT,
    PI,
    RIGHT,
    UP,
    Create,
    FadeIn,
    FadeOut,
    GrowFromCenter,
    LaggedStart,
    MathTex,
    Rotate,
    SurroundingRectangle,
    Text,
    VGroup,
    Write,
    Brace,
)

from euler_video.componentes import Cuadricula, comprobar_casillas
from euler_video.estilo import ACENTO, ACENTO_CLARO, GRIS, TEXTO, EscenaEuler
from euler_video.matematicas import complemento_escalera, escalera, triangular

N = 5


class SumaGauss(EscenaEuler):
    def construct(self) -> None:
        n = N
        total = triangular(n)
        terminos = [str(k) for k in range(1, n + 1)]
        suma_tex = " + ".join(terminos)

        # 1. La suma que queremos calcular.
        partes = []
        for k, termino in enumerate(terminos):
            if k:
                partes.append("+")
            partes.append(termino)
        suma = MathTex(*partes, font_size=64).to_edge(UP, buff=0.6)
        self.play(Write(suma), run_time=1.5)

        # 2. Cada término k es una fila de k casillas: la escalera.
        cuadricula = Cuadricula(filas=n, columnas=n + 1, lado=0.75, centro=LEFT * 3 + DOWN * 0.6)
        filas = VGroup(
            *[cuadricula.casillas({(f, c) for c in range(f + 1)}, ACENTO) for f in range(n)]
        )
        for f, fila in enumerate(filas):
            self.play(
                suma[2 * f].animate.set_color(ACENTO_CLARO),
                LaggedStart(*[FadeIn(cuadrado, shift=0.2 * RIGHT) for cuadrado in fila], lag_ratio=0.15),
                run_time=0.7,
            )
        comprobar_casillas(cuadricula, filas, escalera(n))

        rotulo = Text("¿Cuántas casillas hay?", font_size=34).move_to(RIGHT * 3.6 + UP * 0.6)
        self.play(FadeIn(rotulo, shift=0.2 * UP))
        self.wait(0.8)

        # 3. Una copia, girada media vuelta, completa un rectángulo de n × (n + 1).
        copia = filas.copy()
        rotulo = self.cambiar_rotulo(rotulo, "Copiamos la escalera…", copia.animate.set_fill(GRIS))
        rotulo = self.cambiar_rotulo(rotulo, "…y la giramos media vuelta")
        self.play(Rotate(copia, angle=PI, about_point=cuadricula.centro), run_time=2)
        comprobar_casillas(cuadricula, copia, complemento_escalera(n))
        self.wait(0.5)

        # 4. Las medidas del rectángulo.
        rectangulo = VGroup(filas, copia)
        llave_ancho = Brace(rectangulo, DOWN, buff=0.15, color=TEXTO)
        llave_alto = Brace(rectangulo, LEFT, buff=0.15, color=TEXTO)
        ancho = llave_ancho.get_tex(str(n + 1))
        alto = llave_alto.get_tex(str(n))
        self.play(
            FadeOut(rotulo),
            GrowFromCenter(llave_ancho),
            GrowFromCenter(llave_alto),
            FadeIn(ancho),
            FadeIn(alto),
        )
        self.wait(0.5)

        # 5. La cuenta: dos escaleras son el rectángulo, una escalera es la mitad.
        explicacion_1 = Text("Dos escaleras = el rectángulo", font_size=30)
        cuenta_1 = MathTex(rf"2 \cdot ({suma_tex}) = {n} \cdot {n + 1}", font_size=44)
        explicacion_2 = Text("Una escalera = la mitad", font_size=30)
        cuenta_2 = MathTex(rf"{suma_tex} = \frac{{{n} \cdot {n + 1}}}{{2}} = {total}", font_size=44)
        columna = VGroup(
            VGroup(explicacion_1, cuenta_1).arrange(DOWN, buff=0.25),
            VGroup(explicacion_2, cuenta_2).arrange(DOWN, buff=0.25),
        ).arrange(DOWN, buff=0.7)
        columna.move_to(RIGHT * 3.6 + DOWN * 0.4)

        self.play(FadeIn(explicacion_1), Write(cuenta_1), run_time=1.5)
        self.wait(1)
        self.play(FadeIn(explicacion_2), Write(cuenta_2), run_time=1.5)
        self.wait(1.5)

        # 6. Lo mismo vale para cualquier n.
        self.play(
            *[FadeOut(m) for m in (suma, filas, copia, llave_ancho, llave_alto, ancho, alto, columna)],
            run_time=0.8,
        )
        general = MathTex(r"1 + 2 + \cdots + n = \frac{n(n+1)}{2}", font_size=80)
        caja = SurroundingRectangle(general, color=ACENTO, buff=0.35, corner_radius=0.1)
        self.play(Write(general), run_time=1.5)
        self.play(Create(caja))
        self.wait(2)
