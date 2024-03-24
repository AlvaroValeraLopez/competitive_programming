import java.util.ArrayList;
import java.util.Scanner;

public class Escudos_del_ejercito_romano {

	private static Scanner sc = new Scanner(System.in);

	public static void main(String[] args) {
		while (ejecutar_programa())
			;
	}

	private static boolean ejecutar_programa() {

		int numero_soldados = sc.nextInt();

		if (numero_soldados == 0) {
			return false;
		} else {
			if (numero_soldados <= 10_000_000) {
				ArrayList<Integer> lista_escuadrones = organizar_escuadrones(numero_soldados);
				int escudos_totales = 0;
				for (int i = 0; i < lista_escuadrones.size(); i++) {
					escudos_totales += numero_escudos(lista_escuadrones.get(i));
				}
				System.out.println(escudos_totales);
			}
			return true;
		}
	}

	/**
	 * Este metodo nos divide todos los soldados en escuadrones cuadrados perfectos.
	 * 
	 * @param numero_soldados
	 *            El numero de soldados que tenemos que organizar.
	 * @return Un arrayList con el tamanio del lado del cuadrado en que se ha de
	 *         organizar el escuadron.
	 */
	private static ArrayList<Integer> organizar_escuadrones(int numero_soldados) {

		ArrayList<Integer> lista_escuadrones = new ArrayList<>();

		int soldados_escuadron = 0;

		while (numero_soldados != 0) {
			soldados_escuadron = (int) Math.floor(Math.sqrt(numero_soldados));
			numero_soldados -= Math.pow(soldados_escuadron, 2);
			lista_escuadrones.add(soldados_escuadron);
		}

		return lista_escuadrones;
	}

	private static int numero_escudos(int tamanio_formacion) {

		switch (tamanio_formacion) {
		case 1:
			return 5;
		default:
			return calcular_escudos(tamanio_formacion);
		}

	}

	private static int calcular_escudos(int tamanio_formacion) {

		int numero_soldados = (int) Math.pow(tamanio_formacion, 2);

		/* Parte superior e inferior */
		int escudos_superiores_inferiores = 12;

		/* Laterales de la formacion */
		int soldados_laterales = ((tamanio_formacion - 2) * 4);
		int escudos_laterales = soldados_laterales * 2;

		/* Centro de la formacion */
		int escudos_centrales = numero_soldados - (soldados_laterales + 4);

		return escudos_superiores_inferiores + escudos_laterales + escudos_centrales;
	}

}