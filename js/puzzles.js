// Puzzle configuration — edit this file to add/remove/modify puzzles.
// answerHash = SHA-256 of the lowercase, trimmed, diacritics-stripped correct answer.
// Generate a hash: echo -n 'youranswer' | shasum -a 256

const PUZZLES = [
  {
    id: "sifra-01",
    title: "Fotky",
    description: "",
    files: [],
    answerHash: "8faac9a708e71c90958128e54f74e444dae8f01a45728e4a0f85e0c46826025c"
  },
  {
    id: "sifra-02",
    title: "Něco málo o nás",
    description: "",
    files: [],
    answerHash: "e7393c0cf8ac5deacecb3d459ef451514abc0616fa8fa17a0f48934bec48ce88"
  },
  {
    id: "sifra-03",
    title: "Přibližně",
    description: "",
    files: [],
    answerHash: "b9ef95bdbedb1517540e01589aac224171d88a25aa65df7e55331b8332132242"
  },
  {
    id: "sifra-04",
    title: "Spousta červených sleďů",
    description: "",
    files: [],
    answerHash: "2355b71cf5683cb0c597810f042ded38d7ccfcea7a92ce9114ea22c37449682f"
  },
  {
    id: "sifra-05",
    title: "Má mě rád",
    description: "",
    files: [],
    answerHash: "29ad793b844b6cd2382ff5472e5882541836f6622c0247f8558dcaa40d975e0e"
  },
  {
    id: "sifra-06",
    title: "Ale fuj, pořád ňáká matika",
    description: "",
    files: [],
    answerHash: "6a80b23e74c1dd8342bce8129985ff422e11080a52479c7fddc3bbc6e5157159"
  }
];

function stripDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function checkAnswer(input, correctHash) {
  const normalized = stripDiacritics(input.trim().toLowerCase());
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex === correctHash;
}
