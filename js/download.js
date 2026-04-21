document.getElementById('downloadBtn').addEventListener('click', async () => {
  const existingPdfBytes = await pdfDoc.getData();

  const pdfLibDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
  const pages = pdfLibDoc.getPages();

  const pageElements = document.querySelectorAll('.pdf-page');

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    const pageEl = pageElements[i];
    const canvas = pageEl.querySelector('canvas');

    // actual rendered canvas size
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const sigBoxes = pageEl.querySelectorAll('.signature-box');

    for (const box of sigBoxes) {
      const img = box.querySelector('img');

      // Use offset (NOT getBoundingClientRect)
      const offsetX = box.offsetLeft;
      const offsetY = box.offsetTop;

      // Convert using real canvas scale
      const x = (offsetX / canvasWidth) * width;
      const y = height - ((offsetY / canvasHeight) * height);

      const w = (box.offsetWidth / canvasWidth) * width;
      const h = (box.offsetHeight / canvasHeight) * height;

      const pngImage = await pdfLibDoc.embedPng(img.src);

      page.drawImage(pngImage, {
        x: x,
        y: y - h,
        width: w,
        height: h,
      });
    }
  }

  const pdfBytes = await pdfLibDoc.save();

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');

  link.href = URL.createObjectURL(blob);
  link.download = 'signed_document.pdf';
  link.click();
});