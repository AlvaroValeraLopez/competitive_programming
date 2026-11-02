"""Lo que afirma el vídeo de la suma de Gauss, comprobado antes de renderizarlo."""

import re
from pathlib import Path

import numpy as np
import pytest
from manim import PI, ORIGIN

from euler_video import estilo
from euler_video.componentes import Cuadricula, comprobar_casillas
from euler_video.estilo import ACENTO
from euler_video.matematicas import (
    complemento_escalera,
    escalera,
    girar_180,
    rectangulo,
    triangular,
)

TAMANOS = range(1, 31)


@pytest.mark.parametrize("n", TAMANOS)
def test_la_formula_coincide_con_la_suma_directa(n):
    assert triangular(n) == sum(range(1, n + 1))


@pytest.mark.parametrize("n", TAMANOS)
def test_la_escalera_tiene_tantas_casillas_como_la_suma(n):
    assert len(escalera(n)) == triangular(n)


@pytest.mark.parametrize("n", TAMANOS)
def test_cada_fila_de_la_escalera_es_un_termino_de_la_suma(n):
    for f in range(n):
        assert sum(1 for fila, _ in escalera(n) if fila == f) == f + 1


@pytest.mark.parametrize("n", TAMANOS)
def test_escalera_y_complemento_llenan_el_rectangulo_sin_solaparse(n):
    a, b = escalera(n), complemento_escalera(n)
    assert a.isdisjoint(b)
    assert a | b == rectangulo(n, n + 1)


@pytest.mark.parametrize("n", TAMANOS)
def test_el_complemento_es_la_escalera_girada_media_vuelta(n):
    assert girar_180(escalera(n), n, n + 1) == complemento_escalera(n)


@pytest.mark.parametrize("n", [1, 2, 5, 12])
def test_el_giro_en_pantalla_coloca_la_copia_en_el_complemento(n):
    """Lo mismo que hace la escena: girar los cuadrados con Manim alrededor del centro del rectángulo."""
    cuadricula = Cuadricula(filas=n, columnas=n + 1, lado=0.75, centro=np.array([-3.0, -0.6, 0.0]))
    copia = cuadricula.casillas(escalera(n), ACENTO)
    copia.rotate(PI, about_point=cuadricula.centro)
    comprobar_casillas(cuadricula, copia, complemento_escalera(n))


def test_la_comprobacion_detecta_una_figura_que_no_encaja():
    cuadricula = Cuadricula(filas=3, columnas=4, centro=ORIGIN)
    copia = cuadricula.casillas(escalera(3), ACENTO)
    copia.shift(0.01 * np.array([1.0, 0.0, 0.0]))
    with pytest.raises(ValueError):
        comprobar_casillas(cuadricula, copia, complemento_escalera(3))


TEMA_WEB = Path(__file__).resolve().parents[2] / "web" / "src" / "styles" / "tema.css"

# Color del vídeo -> variable CSS del modo oscuro de la web.
VARIABLES_WEB = {
    "FONDO": "--sl-color-black",  # el fondo de página en modo oscuro
    "ACENTO": "--sl-color-accent",
    "ACENTO_CLARO": "--sl-color-accent-high",
    "AZUL": "--sl-color-text-accent",
    "GRIS": "--sl-color-gray-4",
    "TEXTO": "--sl-color-gray-2",
    "BLANCO": "--sl-color-white",
}


def colores_modo_oscuro() -> dict[str, str]:
    """Las variables `--sl-color-*: #rrggbb` del bloque `:root` (modo oscuro) de tema.css."""
    bloque = re.search(r"^:root \{(.*?)^\}", TEMA_WEB.read_text(), re.S | re.M).group(1)
    return {nombre: valor.upper() for nombre, valor in re.findall(r"(--sl-color-[\w-]+):\s*(#[0-9a-fA-F]{6});", bloque)}


@pytest.mark.parametrize("nombre, variable", VARIABLES_WEB.items())
def test_los_colores_son_exactamente_los_de_la_web(nombre, variable):
    """Si cambia la paleta de la web, este test falla hasta actualizar la de los vídeos."""
    assert getattr(estilo, nombre).to_hex().upper() == colores_modo_oscuro()[variable]


def test_la_fuente_de_los_rotulos_esta_instalada():
    """Si falta, Pango usaría otra sin avisar y el vídeo saldría distinto."""
    import manimpango

    assert estilo.FUENTE in manimpango.list_fonts()
