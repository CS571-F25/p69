// Utility functions for trick calculations and formatting

export function calculatePassTotal(tricks) {
  return tricks.reduce((sum, trick) => sum + trick.points, 0);
}

export function formatTrickList(pass1, pass2, pass1SkiCount, pass2SkiCount) {
  const pass1Total = calculatePassTotal(pass1);
  const pass2Total = calculatePassTotal(pass2);
  const grandTotal = pass1Total + pass2Total;

  const skiLabel = (count) => count != null ? `, ${count} ski${count !== 1 ? 's' : ''}` : '';

  let text = "TRICK PASS\n";
  text += "══════════\n\n";

  if (pass1.length > 0) {
    text += `Pass 1 (${pass1Total} pts${skiLabel(pass1SkiCount)})\n`;
    text += pass1.map((t, i) => `  ${i + 1}. ${t.abbr} - ${t.points}`).join("\n");
    text += "\n";
  }

  if (pass2.length > 0) {
    text += `\nPass 2 (${pass2Total} pts${skiLabel(pass2SkiCount)})\n`;
    text += pass2.map((t, i) => `  ${i + 1}. ${t.abbr} - ${t.points}`).join("\n");
    text += "\n";
  }

  text += `\n──────────\nTOTAL: ${grandTotal} pts`;

  return text;
}
