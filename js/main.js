const pdfInput = document.getElementById('pdfInput');
  const dropArea = document.getElementById('dropArea');
  const pdfViewer = document.getElementById('pdfViewer');
  let pdfDoc = null;
  const undoStack = [];

  // ===== Upload PDF =====
  dropArea.addEventListener('click', () => pdfInput.click());
  dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('bg-gray-100'); });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('bg-gray-100'));
  dropArea.addEventListener('drop', e => {
    e.preventDefault(); dropArea.classList.remove('bg-gray-100');
    handlePDFFile(e.dataTransfer.files[0]);
  });
  pdfInput.addEventListener('change', e => handlePDFFile(e.target.files[0]));

  function handlePDFFile(file) {
    if (file.type !== "application/pdf") return alert("Please upload a PDF file.");
    const reader = new FileReader();
    reader.onload = e => {
      const typedArray = new Uint8Array(e.target.result);
      pdfjsLib.getDocument(typedArray).promise.then(pdf => {
        pdfDoc = pdf; renderAllPages();
      });
    };
    reader.readAsArrayBuffer(file);
  }

  async function renderAllPages() {
    pdfViewer.innerHTML = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const wrapper = document.createElement('div');
      wrapper.className = "pdf-page";
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      wrapper.appendChild(canvas);
      pdfViewer.appendChild(wrapper);
      await page.render({ canvasContext: context, viewport }).promise;
    }
  }
