import java.util.Scanner;

public class Ceros_del_factorial {

	public static void main(String[] args) {

		Scanner sc = new Scanner(System.in);

		int numeroEjecuciones = sc.nextInt();

		for (int i = 0; i < numeroEjecuciones; i++) {
			System.out.println(numeroCeros(sc));
		}

		sc.close();
	}

	private static int numeroCeros(Scanner sc) {

		int numeroCeros = 0;

		int numeroEvaluado = sc.nextInt();
		while (numeroEvaluado >= 5) {
			
			numeroEvaluado /= 5;
			numeroCeros += numeroEvaluado;
		}

		return numeroCeros;

	}
}
