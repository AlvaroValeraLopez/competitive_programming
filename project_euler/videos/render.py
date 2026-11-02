"""Comprueba las matemáticas, renderiza los vídeos y los copia a la web.

    uv run python render.py                  # todos los vídeos, calidad alta
    uv run python render.py suma-de-gauss    # solo uno
    uv run python render.py --calidad baja   # vista previa rápida, sin copiar a la web

Si algún test falla, no se renderiza nada.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
DESTINO_WEB = RAIZ.parent / "web" / "public" / "videos"

# nombre del vídeo en la web -> (archivo de la escena, clase de la escena)
VIDEOS = {
    "suma-de-gauss": ("escenas/suma_gauss.py", "SumaGauss"),
    "inclusion-exclusion": ("escenas/inclusion_exclusion.py", "InclusionExclusion"),
    "funcion-divisor": ("escenas/funcion_divisor.py", "FuncionDivisor"),
    "coeficientes-binomiales": ("escenas/coeficientes_binomiales.py", "CoeficientesBinomiales"),
    "mcd-y-mcm": ("escenas/mcd_mcm.py", "McdMcm"),
    "test-de-primalidad": ("escenas/primalidad.py", "Primalidad"),
    "factorizacion-en-primos": ("escenas/factorizacion.py", "Factorizacion"),
    "criba-de-eratostenes": ("escenas/criba.py", "Criba"),
    "suma-de-cuadrados": ("escenas/suma_cuadrados.py", "SumaCuadrados"),
    "fibonacci": ("escenas/fibonacci.py", "Fibonacci"),
    "ternas-pitagoricas": ("escenas/ternas_pitagoricas.py", "TernasPitagoricas"),
}

CALIDADES = {"baja": "l", "media": "m", "alta": "h"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("videos", nargs="*", help=f"vídeos a renderizar (por defecto, todos): {', '.join(VIDEOS)}")
    parser.add_argument("--calidad", choices=CALIDADES, default="alta")
    args = parser.parse_args()
    nombres = args.videos or list(VIDEOS)
    if desconocidos := [n for n in nombres if n not in VIDEOS]:
        parser.error(f"vídeos desconocidos: {', '.join(desconocidos)}")

    print("Comprobando las matemáticas…")
    if subprocess.run([sys.executable, "-m", "pytest", "-q"], cwd=RAIZ).returncode != 0:
        sys.exit("Los tests fallan: no se renderiza nada.")

    for nombre in nombres:
        archivo, escena = VIDEOS[nombre]
        print(f"\nRenderizando {nombre}…")
        comando = [
            sys.executable, "-m", "manim", "render",
            f"-q{CALIDADES[args.calidad]}",
            "--media_dir", "build",
            "-o", nombre,
            archivo, escena,
        ]  # fmt: skip
        if subprocess.run(comando, cwd=RAIZ).returncode != 0:
            sys.exit(f"Error al renderizar {nombre}.")

        resultado = max((RAIZ / "build" / "videos").rglob(f"{nombre}.mp4"), key=lambda p: p.stat().st_mtime)
        if args.calidad == "alta":
            DESTINO_WEB.mkdir(parents=True, exist_ok=True)
            shutil.copy2(resultado, DESTINO_WEB / resultado.name)
            print(f"Copiado a {DESTINO_WEB / resultado.name}")
        else:
            print(f"Vista previa en {resultado}")


if __name__ == "__main__":
    main()
