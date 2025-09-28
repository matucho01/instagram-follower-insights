import { PDFDocument, StandardFonts } from "pdf-lib";
import { PdfReportOptions, UsernameEntry } from "../types";

const addTextBlock = (
  page: import("pdf-lib").PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  maxWidth?: number
) => {
  const wrapped = maxWidth ? wrapText(text, size, maxWidth) : [text];
  let cursorY = y;
  for (const line of wrapped) {
    page.drawText(line, { x, y: cursorY, size });
    cursorY -= size + 4;
  }
  return cursorY;
};

const wrapText = (text: string, size: number, maxWidth: number): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length * size * 0.5 > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const formatPreview = (entries: UsernameEntry[], limit = 15): string => {
  const slice = entries.slice(0, limit).map((entry) => `@${entry.username}`);
  let text = slice.join(", ");
  if (entries.length > limit) {
    text += ` … (+${entries.length - limit})`;
  }
  return text || "—";
};

export const buildSummaryPdf = async (
  options: PdfReportOptions
): Promise<Uint8Array> => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.setFont(bold);
  page.drawText(options.title, { x: 48, y: 780, size: 24 });
  page.setFont(font);
  page.drawText(`Exported: ${new Date().toLocaleString(options.locale ?? "en-US")}`, {
    x: 48,
    y: 750,
    size: 10,
  });

  const metricY = addTextBlock(
    page,
    `Following: ${options.summary.followingCount}\nFollowers: ${options.summary.followersCount}\nMutuals: ${options.summary.mutualCount}\nNot following back: ${options.summary.notFollowingBackCount}\nFans you don't follow: ${options.summary.fansYouDontFollowCount}\nReciprocity: ${(options.summary.reciprocityRate * 100).toFixed(2)}%`,
    48,
    700,
    12
  );

  let y = metricY - 16;
  y = addTextBlock(page, `Mutuals sample: ${formatPreview(options.mutualsPreview)}`, 48, y, 11, 480);
  y = addTextBlock(
    page,
    `Following but not followed back: ${formatPreview(options.notFollowingBackPreview)}`,
    48,
    y - 16,
    11,
    480
  );
  addTextBlock(
    page,
    `Fans you don't follow: ${formatPreview(options.fansPreview)}`,
    48,
    y - 48,
    11,
    480
  );

  page.setFont(font);
  page.drawText("Privacy note: files processed locally only.", { x: 48, y: 48, size: 9 });

  return await doc.save();
};
