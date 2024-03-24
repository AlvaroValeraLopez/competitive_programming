import java.util.ArrayList;
import java.util.Scanner;

public class Ventas {

	private static Scanner sc = new Scanner(System.in);
	private static ArrayList<Double> ganancias_semanales = new ArrayList<>();

	public static void main(String[] args) {

		while (ejecutar_programa())
			;
	}

	private static boolean ejecutar_programa() {

		double ganancias_dia = 0;

		ganancias_semanales.clear();

		for (int i = 0; i < 6; i++) {
			ganancias_dia = Double.parseDouble(sc.nextLine());
			if (ganancias_dia == -1) {
				return false;
			} else {
				ganancias_semanales.add(ganancias_dia);
			}
		}
		String[] lista_datos = estudiar_ganancias_semanales();

		for (int i = 0; i < lista_datos.length; i++) {
			System.out.print(lista_datos[i]);
		}
		return true;
	}

	private static String[] estudiar_ganancias_semanales() {

		String[] salida = new String[3];

		double minimo = 100000000;
		int posicion_minimo = 0;
		double maximo = 0;
		int posicion_maximo = 0;
		double ganancias_totales = 0;

		for (int i = 0; i < ganancias_semanales.size(); i++) {

			if (ganancias_semanales.get(i) > maximo) {
				maximo = ganancias_semanales.get(i);
				posicion_maximo = i;
			}
			if (ganancias_semanales.get(i) < minimo) {
				minimo = ganancias_semanales.get(i);
				posicion_minimo = i;
			}
			ganancias_totales += ganancias_semanales.get(i);
		}

		salida[0] = que_dia_es(posicion_maximo);
		salida[1] = que_dia_es(posicion_minimo);

		double ganancia_media = (ganancias_totales / 6);

		if (ganancia_media < ganancias_semanales.get(5)) {
			salida[2] = "SI\n";
		} else if (ganancia_media > ganancias_semanales.get(5)) {
			salida[2] = "NO\n";
		} else {
			salida[2] = "EMPATE\n";
		}

		return salida;
	}

	private static String que_dia_es(int id_dia) {

		switch (id_dia) {
		case 0:
			return "MARTES ";
		case 1:
			return "MIERCOLES ";
		case 2:
			return "JUEVES ";
		case 3:
			return "VIERNES ";
		case 4:
			return "SABADO ";
		case 5:
			return "DOMINGO ";
		default:
			return "-1";
		}
	}
}