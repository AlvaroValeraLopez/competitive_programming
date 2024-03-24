import java.util.Scanner;

public class Ultimo_digito_del_factorial {

	public static void main(String[] args) {

		Scanner sc = new Scanner(System.in);

		int numero_ejecuciones = sc.nextInt();

		for (int i = 0; i < numero_ejecuciones; i++) {
			int numero = sc.nextInt();
			switch (numero) {
			case 0:
			case 1:
				System.out.println("1");
				break;
			case 2:
				System.out.println("2");
				break;
			case 3:
				System.out.println("6");
				break;
			case 4:
				System.out.println("4");
				break;
			default:
				System.out.println("0");
			}

		}

		sc.close();

	}
}
