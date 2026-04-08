// Puzzle configuration — edit this file to add/remove/modify puzzles.
// answerHash = SHA-256 of the lowercase, trimmed correct answer.
// Generate a hash: echo -n 'youranswer' | shasum -a 256

const PUZZLES = [
  {
    id: "sifra-01",
    title: "Šifra 1: Zapomenutá zpráva",
    description: "Na staré mapě je ukrytá zpráva. Rozluštěte souřadnice a najděte heslo.",
    files: [
      { name: "Mapa.pdf", path: "assets/files/sifra-01-mapa.pdf" }
    ],
    answerHash: "4bc2ef0648cdf275032c83bb1e87dd554d47f4be293670042212c8a01cc2ccbe", // heslo1
    hint: "Podívejte se na první písmena..."
  },
  {
    id: "sifra-02",
    title: "Šifra 2: Tajná tabulka",
    description: "Tabulka skrývá vzorec. Najděte správnou kombinaci.",
    files: [
      { name: "Tabulka.pdf", path: "assets/files/sifra-02-tabulka.pdf" }
    ],
    answerHash: "274efeaa827a33d7e35be9a82cd6150b7caf98f379a4252aa1afce45664dcbe1", // heslo2
    hint: null
  },
  {
    id: "sifra-03",
    title: "Šifra 3: Skrytý obraz",
    description: "V obrázku se skrývá poslední klíč. Co vidíte, když se díváte pozorně?",
    files: [
      { name: "Obrazek.png", path: "assets/files/sifra-03-obrazek.png" }
    ],
    answerHash: "05af533c6614544a704c4cf51a45be5c10ff19bd10b7aa1dfe47efc0fd059ede", // heslo3
    hint: null
  }
];

async function checkAnswer(input, correctHash) {
  const normalized = input.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex === correctHash;
}
