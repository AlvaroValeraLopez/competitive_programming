import java.util.Scanner;

public class CesarCipher {

	private static final String VOWELS = "aeiouAEIOU";

	private static String decodeMessage(String encodedMessage, int shift) {
		StringBuilder decoded = new StringBuilder();
		for (char c : encodedMessage.toCharArray()) {
			if (Character.isLetter(c)) {
				char base = (Character.isUpperCase(c) ? 'A' : 'a');
				int offset = (c - base + shift) % 26;
				if (offset < 0) offset += 26;
				decoded.append((char) (base + offset));
			} else {
				decoded.append(c);
			}
		}
		return decoded.toString();
	}

	private static int countVowels(String message) {
		int vowelCount = 0;
		for (char c : message.toCharArray()) {
			if (VOWELS.indexOf(c) >= 0) {
				vowelCount++;
			}
		}
		return vowelCount;
	}

	public static void main(String[] args) {
		Scanner scanner = new Scanner(System.in);

		while (scanner.hasNextLine()) {
			String line = scanner.nextLine();
			if (line.trim().isEmpty()) continue;

			char encodedP = line.charAt(0);
			int shift = encodedP - 'p';

			String decodedMessage = decodeMessage(line.substring(1), -shift);

			if ("FIN".equals(decodedMessage.trim())) {
				break; // Terminar si el mensaje decodificado es "FIN"
			}

			System.out.println(countVowels(decodedMessage));
		}

		scanner.close();
	}
}
