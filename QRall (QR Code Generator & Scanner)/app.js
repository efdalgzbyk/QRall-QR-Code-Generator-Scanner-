const qrInput = document.getElementById("qr-input");
const qrResult = document.getElementById("qr-result");
const downloadBtn = document.getElementById("download-btn");
const copyBtn = document.getElementById("copy-btn");
const historyList = document.getElementById("history-list");

let lastGeneratedText = "";
let qrHistory = JSON.parse(localStorage.getItem("qrHistory") || "[]");

function updateHistoryUI() {
  historyList.innerHTML = "";
  qrHistory.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.text} - ${new Date(item.date).toLocaleString()}`;
    historyList.appendChild(li);
  });
}

function saveHistory(text) {
  qrHistory.unshift({ text, date: new Date().toISOString() });
  localStorage.setItem("qrHistory", JSON.stringify(qrHistory));
  updateHistoryUI();
}

function clearHistory() {
  qrHistory = [];
  localStorage.removeItem("qrHistory");
  updateHistoryUI();
}

function generateQR() {
  const input = qrInput.value.trim();
  qrResult.innerHTML = "";
  downloadBtn.style.display = "none";
  copyBtn.style.display = "none";

  if (!input) {
    alert("Lütfen bir metin girin.");
    return;
  }

  QRCode.toCanvas(input, { width: 200 }, (err, canvas) => {
    if (err) {
      alert("QR kodu oluşturulamadı.");
      return;
    }
    qrResult.appendChild(canvas);

    const dataUrl = canvas.toDataURL("image/png");
    downloadBtn.href = dataUrl;
    downloadBtn.style.display = "inline-block";

    lastGeneratedText = input;
    copyBtn.style.display = "inline-block";

    saveHistory(input);
  });
}

function copyLastText() {
  navigator.clipboard.writeText(lastGeneratedText).then(() => {
    alert("Metin kopyalandı!");
  }).catch(() => {
    alert("Kopyalama başarısız.");
  });
}

updateHistoryUI();

// QR ve Barkod Okuma (kamera)
const startScanBtn = document.getElementById('start-scan');
const stopScanBtn = document.getElementById('stop-scan');
const readerDiv = document.getElementById('reader');
const scanResult = document.getElementById('scan-result');

let html5QrcodeScanner;

startScanBtn.addEventListener('click', () => {
  scanResult.innerText = "";
  startScanBtn.style.display = 'none';
  stopScanBtn.style.display = 'inline-block';

  html5QrcodeScanner = new Html5Qrcode("reader");

  html5QrcodeScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E
      ]
    },
    (decodedText, decodedResult) => {
      scanResult.innerText = `Tarama Sonucu: ${decodedText} (Tip: ${decodedResult.format.formatName})`;

      html5QrcodeScanner.stop().then(() => {
        startScanBtn.style.display = 'inline-block';
        stopScanBtn.style.display = 'none';
        readerDiv.innerHTML = "";
      }).catch(err => {
        console.error('Taramayı durdurma hatası:', err);
      });
    },
    (errorMessage) => {
      // Başarısız okuma durumları buraya düşer, loglayabilirsin.
    }
  ).catch(err => {
    alert(`Kamera açma hatası: ${err}`);
    startScanBtn.style.display = 'inline-block';
    stopScanBtn.style.display = 'none';
  });
});

stopScanBtn.addEventListener('click', () => {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().then(() => {
      startScanBtn.style.display = 'inline-block';
      stopScanBtn.style.display = 'none';
      readerDiv.innerHTML = "";
      scanResult.innerText = "Tarama durduruldu.";
    }).catch(err => {
      console.error('Taramayı durdurma hatası:', err);
    });
  }
});
