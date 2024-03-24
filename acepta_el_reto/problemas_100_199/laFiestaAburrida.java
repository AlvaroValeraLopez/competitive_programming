import java.util.Scanner;

public class LaFiestaAburrida {

	static Scanner sc = new Scanner(System.in);

	public static void main(String[] args) {

		int desconocidos = Integer.parseInt(sc.nextLine());
		for (int i = 0; i < desconocidos; i++) {
			saludo();
		}
	}

	public static String[] nombres() {

		String nombre = sc.nextLine();
		String listaNombre [] = nombre.split("Soy");
		return listaNombre;
	}
	
	public static void saludo(){
		String listaNombre [] = nombres();
		for(int i =1; i<listaNombre.length;i++){
			System.out.println("Hola,"+listaNombre[i]+".");
		}
	}
}
