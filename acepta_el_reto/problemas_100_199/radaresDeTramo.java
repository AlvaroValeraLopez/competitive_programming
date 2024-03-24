import java.util.Scanner;

public class Radares_de_tramo {

	private static Scanner sc = new Scanner(System.in);

	public static void main(String[] args) {

		while (ejecutar_programa())
			;
	}

	private static boolean ejecutar_programa() {

		String informacion = sc.nextLine();

		if (informacion.equals("0 0 0")) {
			return false;
		} else {
			System.out.println(comprobar_trayecto(informacion));
			return true;
		}
	}

	private static String comprobar_trayecto(String informacion) {

		String[] datos_desfragmentados = informacion.split(" ");

		double distancia = Double.parseDouble(datos_desfragmentados[0]); /* En metros */
		double velocidad_maxima = Double.parseDouble(datos_desfragmentados[1]); /* En km/h */
		double tiempo = Double.parseDouble(datos_desfragmentados[2]); /* En segundos */

		if (distancia <= 0 || velocidad_maxima <= 0 || tiempo <= 0) {
			return "ERROR";
		} else {
			/* Parseamos las variables */
			distancia = distancia / 1000; /* En km */
			tiempo = tiempo / 3600; /* En horas */

			/* Calculamos la velocidad media */
			double velocidad_media = distancia / tiempo;

			if (trayecto_ok(velocidad_media, velocidad_maxima)) {
				return "OK";
			} else {
				if (multa(velocidad_media, velocidad_maxima)) {
					return "MULTA";
				} else {
					return "PUNTOS";
				}
			}
		}

	}

	private static boolean trayecto_ok(double velocidad_media, double velocidad_maxima) {

		if (velocidad_media <= velocidad_maxima) {
			return true;
		} else {
			return false;
		}
	}

	private static boolean multa(double velocidad_media, double velocidad_maxima) {

		velocidad_maxima *= 1.20;

		if (velocidad_media < velocidad_maxima) {
			return true;
		} else {
			return false;
		}

	}
}
