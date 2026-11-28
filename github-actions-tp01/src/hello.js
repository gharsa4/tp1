export function salutation(nom) {
  const propre = String(nom || "").trim();
  return propre ? "Bonjour " + propre + " !" : "Bonjour !";
}
