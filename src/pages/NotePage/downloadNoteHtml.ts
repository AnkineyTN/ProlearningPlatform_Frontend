export type ExportFormat = 'html' | 'md' | 'txt' | 'pdf';

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function buildNoteHtml(title: string, editorHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 40px 20px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #0066cc; }
        img { max-width: 100%; }
        @page { margin: 16mm; }
        @media print {
            body { max-width: none; padding: 0; }
            .content { background-color: transparent; padding: 0; border-left: none; }
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="content">${editorHtml}</div>
    <p style="text-align:center;color:#999;font-size:12px;margin-top:40px;">Generated from Prolearning Platform</p>
</body>
</html>`;
}

export function exportNoteAsHtml(title: string, editorHtml: string) {
  triggerDownload(
    buildNoteHtml(title, editorHtml),
    `${title || 'note'}.html`,
    'text/html',
  );
}

export function exportNoteAsMarkdown(title: string, markdown: string) {
  triggerDownload(`# ${title}\n\n${markdown}`, `${title || 'note'}.md`, 'text/markdown');
}

export function exportNoteAsText(title: string, text: string) {
  const separator = '='.repeat(Math.min(title.length, 60));
  triggerDownload(`${title}\n${separator}\n\n${text}`, `${title || 'note'}.txt`, 'text/plain');
}

/**
 * Opens the browser print dialog on a hidden iframe holding the rendered note,
 * so the user can pick "Save as PDF". Keeps text selectable (vector, not a
 * rasterized canvas) and lets the browser handle pagination — no PDF library
 * needed.
 */
export function exportNoteAsPdf(title: string, editorHtml: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(buildNoteHtml(title || 'note', editorHtml));
  doc.close();

  let removed = false;
  const cleanup = () => {
    if (removed) return;
    removed = true;
    iframe.remove();
  };
  win.onafterprint = cleanup;
  // Safety net for browsers that skip afterprint on cancel.
  setTimeout(cleanup, 120_000);

  const images = Array.from(doc.images);
  void Promise.allSettled(
    images.map((img) =>
      typeof img.decode === 'function' ? img.decode() : Promise.resolve(),
    ),
  ).then(() => {
    win.focus();
    win.print();
  });
}
