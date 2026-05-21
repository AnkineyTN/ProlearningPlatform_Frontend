export function downloadNoteAsHtml(title: string, editorHtml: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                max-width: 900px;
                margin: 0 auto;
                padding: 40px 20px;
                color: #333;
            }
            h1 {
                color: #1a1a1a;
                border-bottom: 2px solid #0066cc;
                padding-bottom: 10px;
            }
            .content {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #0066cc;
            }
        </style>
    </head>
    <body>
        <h1>${title}</h1>
        <div class="content">
            ${editorHtml}
        </div>
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 40px;">
            Generated from Prolearning Platform
        </p>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'note'}.html`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
