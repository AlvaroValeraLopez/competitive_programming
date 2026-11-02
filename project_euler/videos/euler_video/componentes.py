"""Piezas visuales reutilizables.

Todo se coloca a partir de datos de `matematicas`, nunca con coordenadas
escritas a mano, y se puede comprobar después dónde ha quedado cada pieza.
"""

import numpy as np
from manim import DOWN, LEFT, ORIGIN, RIGHT, UP, Mobject, Square, VGroup

from .estilo import FONDO
from .matematicas import Celda

TOLERANCIA = 1e-6


class Cuadricula:
    """Una cuadrícula de filas × columnas casillas: sabe dónde está cada casilla en pantalla."""

    def __init__(self, filas: int, columnas: int, lado: float = 0.8, centro=ORIGIN) -> None:
        self.filas = filas
        self.columnas = columnas
        self.lado = lado
        self.centro = np.array(centro, dtype=float)
        self.esquina = self.centro + (columnas * lado / 2) * LEFT + (filas * lado / 2) * UP

    def centro_de(self, celda: Celda) -> np.ndarray:
        f, c = celda
        return self.esquina + (c + 0.5) * self.lado * RIGHT + (f + 0.5) * self.lado * DOWN

    def celda_en(self, punto) -> Celda:
        """La casilla cuyo centro está en `punto`. Falla si el punto no cae justo en un centro."""
        relativo = np.array(punto, dtype=float) - self.esquina
        c = relativo[0] / self.lado - 0.5
        f = -relativo[1] / self.lado - 0.5
        celda = (round(f), round(c))
        if abs(f - celda[0]) > TOLERANCIA or abs(c - celda[1]) > TOLERANCIA:
            raise ValueError(f"El punto {punto} no está en el centro de ninguna casilla")
        return celda

    def casillas(self, celdas: set[Celda], color, opacidad: float = 1.0) -> VGroup:
        """Un cuadrado por casilla, ordenados por fila y columna."""
        grupo = VGroup()
        for celda in sorted(celdas):
            cuadrado = Square(
                side_length=self.lado,
                fill_color=color,
                fill_opacity=opacidad,
                stroke_color=FONDO,
                stroke_width=4,
            )
            cuadrado.move_to(self.centro_de(celda))
            grupo.add(cuadrado)
        return grupo


def comprobar_casillas(cuadricula: Cuadricula, grupo: Mobject, esperadas: set[Celda]) -> None:
    """Comprueba que los cuadrados de `grupo` ocupan exactamente las casillas `esperadas`.

    Se usa dentro de las escenas, después de mover piezas, para que un vídeo
    no pueda mostrar una figura que no encaja.
    """
    ocupadas = [cuadricula.celda_en(m.get_center()) for m in grupo.family_members_with_points()]
    if len(ocupadas) != len(set(ocupadas)):
        raise AssertionError("Hay dos cuadrados en la misma casilla")
    if set(ocupadas) != esperadas:
        sobran = sorted(set(ocupadas) - esperadas)
        faltan = sorted(esperadas - set(ocupadas))
        raise AssertionError(f"Las casillas no encajan. Sobran: {sobran}. Faltan: {faltan}")
