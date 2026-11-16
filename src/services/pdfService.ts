import * as pdfjsLib from 'pdfjs-dist';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { PDFDocument } from 'pdf-lib';
import { FieldConfig, RecordData } from '../types';

// Thiết lập worker cho PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

// Đọc trang đầu tiên của file PDF và chuyển thành ảnh PNG độ nét cao
export async function convertPdfPageToImage(file: File, pageNumber: number = 1, scale: number = 2.5): Promise<{ dataUrl: string; width: number; height: number; numPages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const validPageNum = Math.min(Math.max(1, pageNumber), numPages);
  const page = await pdf.getPage(validPageNum);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height,
    numPages
  };
}

// Sinh mã QR dưới dạng Data URL
export async function generateQrDataUrl(text: string, size: number = 120): Promise<string> {
  if (!text) return '';
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Lỗi sinh mã QR:', err);
    return '';
  }
}

// Sinh mã vạch Barcode dưới dạng Data URL
export function generateBarcodeDataUrl(text: string, format: string = 'CODE128', width: number = 2, height: number = 40): string {
  if (!text) return '';
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: format,
      width: width,
      height: height,
      displayValue: false,
      margin: 4
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Lỗi sinh mã vạch:', err);
    return '';
  }
}

// Xuất file PDF hàng loạt đa trang (Multi-page Batch PDF) bằng pdf-lib & canvas
export async function exportBatchPdf(
  templateImgUrl: string,
  stageWidth: number,
  stageHeight: number,
  fields: FieldConfig[],
  records: RecordData[],
  onProgress?: (current: number, total: number) => void,
  includeBackground: boolean = true
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Load ảnh nền mẫu một lần để nén vào PDF tối ưu dung lượng nếu có in nền
  let baseImg: HTMLImageElement | null = null;
  if (includeBackground && templateImgUrl) {
    baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      baseImg!.onload = resolve;
      baseImg!.onerror = reject;
      baseImg!.src = templateImgUrl;
    });
  }

  // Render từng bản ghi lên Canvas độ phân giải cao (2x DPI) rồi ghép vào trang PDF
  const renderScale = 2.0; // 2x cho bản in sắc nét
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(stageWidth * renderScale);
  canvas.height = Math.round(stageHeight * renderScale);
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (onProgress) onProgress(i + 1, records.length);

    // Xóa nền (mặc định trong suốt hoặc trắng)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!includeBackground) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (baseImg) {
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
    }

    // Vẽ từng trường dữ liệu
    for (const field of fields) {
      if (!field.visible) continue;
      const rawVal = record[field.key] || record[field.label] || '';
      if (!rawVal) continue;

      let displayText = rawVal;
      if (field.prefix) displayText = field.prefix + displayText;
      if (field.suffix) displayText = displayText + field.suffix;
      if (field.textTransform === 'uppercase') displayText = displayText.toUpperCase();
      if (field.textTransform === 'lowercase') displayText = displayText.toLowerCase();

      const posX = Math.round((field.x + 8) * renderScale);
      const posY = Math.round((field.y + 2) * renderScale);

      if (field.type === 'text') {
        ctx.fillStyle = field.color || '#000000';
        const fontStyle = field.fontStyle === 'italic' ? 'italic ' : '';
        const weight = field.fontWeight || '400';
        const fontSizePx = Math.round((field.fontSize || 16) * renderScale);
        ctx.font = `${fontStyle}${weight} ${fontSizePx}px ${field.fontFamily || 'sans-serif'}`;
        ctx.textBaseline = 'top';

        if (field.align === 'center') {
          ctx.textAlign = 'center';
          ctx.fillText(displayText, posX, posY);
        } else if (field.align === 'right') {
          ctx.textAlign = 'right';
          ctx.fillText(displayText, posX, posY);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(displayText, posX, posY);
        }
      } else if (field.type === 'qr') {
        const qrUrl = await generateQrDataUrl(rawVal, (field.qrSize || 100) * renderScale);
        if (qrUrl) {
          const qrImg = await loadImage(qrUrl);
          const w = (field.width || field.qrSize || 100) * renderScale;
          const h = (field.height || field.qrSize || 100) * renderScale;
          ctx.drawImage(qrImg, posX, posY, w, h);
        }
      } else if (field.type === 'barcode') {
        const bcUrl = generateBarcodeDataUrl(rawVal, field.barcodeFormat || 'CODE128', 2 * renderScale, 40 * renderScale);
        if (bcUrl) {
          const bcImg = await loadImage(bcUrl);
          const w = (field.width || 180) * renderScale;
          const h = (field.height || 50) * renderScale;
          ctx.drawImage(bcImg, posX, posY, w, h);
        }
      }
    }

    // Chuyển trang Canvas này thành ảnh JPEG nén chất lượng 0.95
    const pageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const pageImage = await pdfDoc.embedJpg(pageDataUrl);

    // Thêm trang mới vào PDF với kích thước chuẩn
    const pdfPage = pdfDoc.addPage([stageWidth, stageHeight]);
    pdfPage.drawImage(pageImage, {
      x: 0,
      y: 0,
      width: stageWidth,
      height: stageHeight
    });
  }

  return await pdfDoc.save();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
