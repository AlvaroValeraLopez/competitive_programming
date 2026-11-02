"""Estilo común de todos los vídeos.

Los colores son los del modo oscuro de la web (variables CSS definidas en
web/src/styles/tema.css), así los vídeos encajan con las páginas en las que se
insertan.
"""

from manim import UP, Animation, FadeIn, FadeOut, MathTex, ManimColor, Scene, Tex, Text

FONDO = ManimColor("#211D2F")  # --sl-color-black (fondo de página)
ACENTO = ManimColor("#604FCD")  # --sl-color-accent
ACENTO_CLARO = ManimColor("#B0A8E3")  # --sl-color-accent-high
AZUL = ManimColor("#7097FF")  # --sl-color-text-accent (enlaces)
GRIS = ManimColor("#6A6781")  # --sl-color-gray-4
TEXTO = ManimColor("#CBC9D9")  # --sl-color-gray-2
BLANCO = ManimColor("#FFFFFF")  # --sl-color-white

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
