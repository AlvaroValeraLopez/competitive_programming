# Vídeos de «Euler, paso a paso»

Vídeos matemáticos generados con código usando [Manim Community](https://www.manim.community), la versión mantenida por la comunidad de la biblioteca con la que se hacen los vídeos de 3Blue1Brown.

## Cómo se garantiza que las matemáticas son exactas

1. **Ningún número se escribe a mano.** Todo lo que aparece en pantalla se calcula en el código a partir de `euler_video/matematicas.py`.
2. **Las matemáticas tienen tests.** `tests/` comprueba esas funciones contra cálculos independientes (por ejemplo, la fórmula de Gauss contra la suma directa, para n de 1 a 30).
3. **Las escenas se comprueban a sí mismas.** Después de mover piezas, `comprobar_casillas` verifica que cada cuadrado está exactamente en la casilla que dice la teoría; si no, el render se detiene con un error.
4. **No se renderiza sin tests.** `render.py` ejecuta los tests primero y no genera nada si alguno falla.

## Instalación (macOS)

```bash
brew install cairo pango ffmpeg pkgconf bzip2 expat
brew install --cask mactex-no-gui    # LaTeX, para las fórmulas (pide la contraseña)
uv sync
```

`pycairo` se compila al instalarlo y necesita encontrar con `pkg-config` algunas bibliotecas del sistema. En macOS recientes Homebrew no trae sus archivos `.pc`, y la instalación falla con `Package 'zlib' ... not found`. Para solucionarlo, crea un `bzip2.pc` mínimo en una carpeta cualquiera (por ejemplo `~/pkgconfig`):

```
prefix=/opt/homebrew/opt/bzip2
libdir=${prefix}/lib
includedir=${prefix}/include

Name: bzip2
Description: bzip2 compression library
Version: 1.0.8
Libs: -L${libdir} -lbz2
Cflags: -I${includedir}
```

y después instala con:

```bash
PKG_CONFIG_PATH="/opt/homebrew/opt/zlib/lib/pkgconfig:/opt/homebrew/opt/expat/lib/pkgconfig:$HOME/pkgconfig" uv sync
```

Solo hace falta la primera vez: uv guarda `pycairo` ya compilado.

## Uso

```bash
uv run pytest                                      # comprobar las matemáticas
uv run manim -pql escenas/suma_gauss.py SumaGauss  # vista previa rápida
uv run python render.py                            # tests + render en 1080p60 + copia a ../web/public/videos
```

## Estructura

```
euler_video/
├── estilo.py        # colores de la web, fuente y escena base (EscenaEuler)
├── matematicas.py   # los datos que muestran los vídeos (sin Manim, para tests rápidos)
└── componentes.py   # piezas visuales: Cuadricula, comprobar_casillas…
escenas/             # una escena por vídeo
tests/               # comprobaciones de las matemáticas
render.py            # tests → render → copia a la web
```

## Añadir un vídeo

1. Escribe en `euler_video/matematicas.py` las funciones que calculan lo que se va a mostrar.
2. Escribe sus tests en `tests/`.
3. Crea la escena en `escenas/`, heredando de `EscenaEuler` y construyendo todo a partir de esas funciones.
4. Regístrala en `VIDEOS` dentro de `render.py`.
5. En la web, insértala con `<Video archivo="nombre.mp4" titulo="…" />`.
