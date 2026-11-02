"""Estilo común de todos los vídeos.

Los colores son los del modo oscuro de la web (variables CSS de Starlight),
así los vídeos encajan con las páginas en las que se insertan.
"""

import colorsys
import math

from manim import UP, Animation, FadeIn, FadeOut, MathTex, ManimColor, Scene, Tex, Text


def hsl(h: float, s: float, l: float) -> ManimColor:
    """Color a partir de tono (grados), saturación y luminosidad (porcentajes), como en CSS.

    Redondea a enteros de 0 a 255 igual que el navegador, para obtener exactamente
    el mismo color que la web. Manim truncaría (22,95 → 22) y `round()` de Python
    redondea los medios al par (178,5 → 178); el navegador da 23 y 179.
    """
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return ManimColor.from_rgb(tuple(math.floor(x * 255 + 0.5) for x in (r, g, b)))


FONDO = hsl(224, 10, 10)  # --sl-color-bg
ACENTO = hsl(224, 100, 60)  # --sl-color-accent
ACENTO_CLARO = hsl(224, 100, 85)  # --sl-color-text-accent
GRIS = hsl(224, 7, 36)  # --sl-color-gray-4
TEXTO = hsl(224, 6, 77)  # --sl-color-gray-2
BLANCO = hsl(0, 0, 100)  # --sl-color-white

# Fuente sin serifa para los rótulos, parecida a la de la web. Las fórmulas van
# en LaTeX (Computer Modern), como en un libro.
FUENTE = "Helvetica Neue"


class EscenaEuler(Scene):
    """Escena base: fondo y colores de texto de la web, y utilidades comunes."""

    def setup(self) -> None:
        self.camera.background_color = FONDO
        MathTex.set_default(color=BLANCO)
        Tex.set_default(color=BLANCO)
        Text.set_default(color=TEXTO, font=FUENTE)

    def cambiar_rotulo(self, viejo: Text, texto: str, *otras: Animation) -> Text:
        """Sustituye un rótulo por otro en el mismo sitio.

        Primero sale el viejo y después entra el nuevo, para que nunca se
        superpongan. `otras` son animaciones que acompañan a la entrada.
        """
        nuevo = Text(texto, font_size=viejo.font_size).move_to(viejo)
        self.play(FadeOut(viejo, shift=0.25 * UP), run_time=0.3)
        self.play(FadeIn(nuevo, shift=0.25 * UP), *otras, run_time=0.6)
        return nuevo
