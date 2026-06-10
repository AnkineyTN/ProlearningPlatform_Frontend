export type ExportFormat = 'html' | 'md' | 'txt';

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

export function exportNoteAsHtml(title: string, editorHtml: string) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 40px 20px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #0066cc; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="content">${editorHtml}</div>
    <p style="text-align:center;color:#999;font-size:12px;margin-top:40px;">Generated from Prolearning Platform</p>
</body>
</html>`;
  triggerDownload(htmlContent, `${title || 'note'}.html`, 'text/html');
}

export function exportNoteAsMarkdown(title: string, markdown: string) {
  triggerDownload(`# ${title}\n\n${markdown}`, `${title || 'note'}.md`, 'text/markdown');
}

export function exportNoteAsText(title: string, text: string) {
  const separator = '='.repeat(Math.min(title.length, 60));
  triggerDownload(`${title}\n${separator}\n\n${text}`, `${title || 'note'}.txt`, 'text/plain');
}
