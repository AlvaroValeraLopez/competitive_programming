import java.util.Arrays;
import java.util.Scanner;

public class KaprekarRoutine {

	private static int kaprekarIterations(int number) {
		final int KAPREKAR_CONSTANT = 6174;
		int iterations = 0;

		while (number != KAPREKAR_CONSTANT) {
			iterations++;
			String numberStr = String.format("%04d", number);
			char[] ascDigits = numberStr.toCharArray();
			char[] descDigits = numberStr.toCharArray();
			Arrays.sort(ascDigits);
			Arrays.sort(descDigits);
			reverse(descDigits);
			
			int ascNumber = Integer.parseInt(new String(ascDigits));
			int descNumber = Integer.parseInt(new String(descDigits));
			
			number = descNumber - ascNumber;
			if (number == 0) {
				return 8;
			}
		}
		return iterations;
	}

	// Método para invertir un arreglo de caracteres.
	private static void reverse(char[] array) {
		for(int i = 0; i < array.length / 2; i++) {
			char temp = array[i];
			array[i] = array[array.length - i - 1];
			array[array.length - i - 1] = temp;
		}
	}

	public static void main(String[] args) {
		Scanner scanner = new Scanner(System.in);
		int testCases = scanner.nextInt();
		
		for (int i = 0; i < testCases; i++) {
			int number = scanner.nextInt();
			if (number == 6174) {
				System.out.println(0);
			} else {
				System.out.println(kaprekarIterations(number));
			}
		}
		scanner.close();
	}
}