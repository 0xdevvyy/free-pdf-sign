 
 
 // ===== Signature Modal =====
  const modal = document.getElementById('modal');
  const signatureCanvas = document.getElementById('signatureCanvas');
  const sCtx = signatureCanvas.getContext('2d');
  let drawing = false;

  signatureCanvas.addEventListener('mousedown', () => drawing = true);
  signatureCanvas.addEventListener('mouseup', () => { drawing = false; sCtx.beginPath(); });
  signatureCanvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const rect = signatureCanvas.getBoundingClientRect();
    sCtx.lineWidth = 2; sCtx.lineCap = 'round'; sCtx.strokeStyle = 'black';
    sCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    sCtx.stroke();
    sCtx.beginPath();
    sCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  });

  document.getElementById('clearSignature').onclick = () => sCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  document.getElementById('createSignatureBtn').onclick = () => { modal.classList.remove('hidden'); sCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height); };
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('saveSignature').onclick = () => {
    const dataUrl = signatureCanvas.toDataURL();
    addSignatureToList(dataUrl);
    modal.classList.add('hidden');
  };

  // ===== Signature List =====
  const signatureList = document.getElementById('signatureList');
  function addSignatureToList(dataUrl) {
    const div = document.createElement('div');
    div.className = "flex items-center justify-between bg-gray-50 border p-2 rounded";
    div.innerHTML = `<img src="${dataUrl}" class="h-10 cursor-pointer" /><button class="text-red-500 hover:text-red-700">x</button>`;
    const img = div.querySelector('img');
    img.onclick = () => placeSignatureOnPDF(dataUrl);
    div.querySelector('button').onclick = () => div.remove();
    signatureList.appendChild(div);
  }

  // ===== Place Signature =====
  function placeSignatureOnPDF(dataUrl) {
    document.querySelectorAll('.pdf-page').forEach(page => {
      page.addEventListener('click', function handleClick(e) {
        const rect = page.getBoundingClientRect();
        const x = e.clientX - rect.left - 75;
        const y = e.clientY - rect.top - 40;

        const sigBox = document.createElement('div');
        sigBox.className = 'signature-box';
        sigBox.style.left = `${x}px`;
        sigBox.style.top = `${y}px`;
        sigBox.innerHTML = `<img src="${dataUrl}" draggable="false"><div class="resizer"></div>`;
        page.appendChild(sigBox);
        undoStack.push(sigBox);

        let dragging = false, offsetX, offsetY;
        sigBox.addEventListener('mousedown', (ev) => {
          if (ev.target.classList.contains('resizer')) return;
          dragging = true;
          const boxRect = sigBox.getBoundingClientRect();
          offsetX = ev.clientX - boxRect.left;
          offsetY = ev.clientY - boxRect.top;
          ev.stopPropagation();
        });
        document.addEventListener('mouseup', () => dragging = false);
        document.addEventListener('mousemove', (ev) => {
          if (dragging) {
            const pageRect = page.getBoundingClientRect();
            sigBox.style.left = ev.clientX - pageRect.left - offsetX + 'px';
            sigBox.style.top = ev.clientY - pageRect.top - offsetY + 'px';
          }
        });

        const resizer = sigBox.querySelector('.resizer');
        let resizing = false, startWidth, startHeight, startX, startY;
        const aspect = 150 / 80;
        resizer.addEventListener('mousedown', (ev) => {
          resizing = true;
          startX = ev.clientX;
          startY = ev.clientY;
          startWidth = sigBox.offsetWidth;
          ev.stopPropagation();
        });
        document.addEventListener('mousemove', (ev) => {
          if (resizing) {
            const dx = ev.clientX - startX;
            let newWidth = startWidth + dx;
            sigBox.style.width = newWidth + 'px';
            sigBox.style.height = newWidth / aspect + 'px';
          }
        });
        document.addEventListener('mouseup', () => resizing = false);
        page.removeEventListener('click', handleClick);
      });
    });
  }

  // ===== Undo =====
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      const lastSig = undoStack.pop();
      if (lastSig && lastSig.parentNode) lastSig.parentNode.removeChild(lastSig);
    }
  });
