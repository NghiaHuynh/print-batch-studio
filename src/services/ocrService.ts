import * as pdfjsLib from 'pdfjs-dist';
import { FieldConfig, FieldType } from '../types';

export interface ExtractedTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  isBold?: boolean;
}

// 1. Nhận diện và trích xuất toàn bộ văn bản từ trang PDF sang các trường có thể chỉnh sửa
export async function extractTextFieldsFromPdf(
  file: File,
  pageNumber: number,
  stageWidth: number,
  stageHeight: number
): Promise<FieldConfig[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const validPageNum = Math.min(Math.max(1, pageNumber), pdf.numPages);
  const page = await pdf.getPage(validPageNum);

  // Tạo viewport khớp với kích thước của Stage hiện tại
  const unscaledViewport = page.getViewport({ scale: 1.0 });
  const scale = stageWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale });

  const textContent = await page.getTextContent();
  const rawItems: ExtractedTextItem[] = [];

  for (const item of textContent.items) {
    if (!('str' in item) || !item.str.trim()) continue;

    const tx = item.transform[4];
    const ty = item.transform[5];
    const [canvasX, canvasY] = viewport.convertToViewportPoint(tx, ty);

    // Kích thước font chữ theo viewport
    const fontHeight = Math.hypot(item.transform[0], item.transform[1]) * scale;
    const fontSize = Math.max(10, Math.min(72, Math.round(fontHeight)));

    const fontName = (item.fontName || '').toLowerCase();
    const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy');

    rawItems.push({
      text: item.str,
      x: Math.round(canvasX),
      y: Math.max(0, Math.round(canvasY - fontSize)),
      width: Math.round(item.width * scale),
      height: fontSize,
      fontSize: fontSize,
      fontFamily: determineBestFont(item.fontName),
      isBold
    });
  }

  // Gom các từ trên cùng một dòng (line clustering) thành câu hoàn chỉnh
  return clusterItemsIntoFields(rawItems, stageWidth, stageHeight);
}

// 2. Nhận diện văn bản từ hình ảnh (PNG, JPG, WebP) bằng Tesseract OCR
export async function extractTextFieldsFromImage(
  imageSource: string | File,
  stageWidth: number,
  stageHeight: number,
  onProgress?: (percent: number, status: string) => void
): Promise<FieldConfig[]> {
  try {
    const { createWorker } = await import('tesseract.js');
    if (onProgress) onProgress(10, 'Đang chuẩn bị bộ giải mã OCR...');

    // Lấy kích thước ảnh gốc để quy đổi tọa độ chính xác về Stage
    const img = new Image();
    const imgUrl = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgUrl;
    });

    const imgWidth = img.naturalWidth || stageWidth;
    const imgHeight = img.naturalHeight || stageHeight;
    const scaleX = stageWidth / imgWidth;
    const scaleY = stageHeight / imgHeight;

    const worker = await createWorker('vie+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          const p = Math.round(15 + m.progress * 75);
          onProgress(p, `Đang nhận diện chữ: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const res = await worker.recognize(imgUrl);
    await worker.terminate();

    if (typeof imageSource !== 'string') {
      URL.revokeObjectURL(imgUrl);
    }

    if (onProgress) onProgress(95, 'Đang tạo các trường văn bản kéo thả...');

    const rawItems: ExtractedTextItem[] = [];

    // Duyệt qua blocks -> paragraphs -> lines
    if (res.data.blocks) {
      for (const block of res.data.blocks) {
        for (const paragraph of block.paragraphs) {
          for (const line of paragraph.lines) {
            const text = line.text.trim();
            if (!text || text.length < 2) continue;

            const bbox = line.bbox;
            const x = Math.round(bbox.x0 * scaleX);
            const y = Math.round(bbox.y0 * scaleY);
            const height = Math.round((bbox.y1 - bbox.y0) * scaleY);
            const fontSize = Math.max(12, Math.min(64, Math.round(height * 0.85)));

            rawItems.push({
              text,
              x,
              y,
              width: Math.round((bbox.x1 - bbox.x0) * scaleX),
              height,
              fontSize,
              fontFamily: "'Inter', sans-serif",
              isBold: false
            });
          }
        }
      }
    }

    return clusterItemsIntoFields(rawItems, stageWidth, stageHeight);
  } catch (err) {
    console.warn('Lỗi OCR hình ảnh:', err);
    throw err;
  }
}

// Gom các mảnh từ rời rạc trên cùng một dòng thành các dòng văn bản liền mạch
function clusterItemsIntoFields(
  rawItems: ExtractedTextItem[],
  stageWidth: number,
  stageHeight: number
): FieldConfig[] {
  if (rawItems.length === 0) return [];

  // Sắp xếp theo chiều dọc Y trước, chiều ngang X sau
  rawItems.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= 6) return a.x - b.x;
    return a.y - b.y;
  });

  const clustered: ExtractedTextItem[] = [];
  let current = { ...rawItems[0] };

  for (let i = 1; i < rawItems.length; i++) {
    const item = rawItems[i];
    const isSameLine = Math.abs(item.y - current.y) <= 8;
    const isNearX = item.x >= current.x && (item.x - (current.x + current.width)) <= 35;

    if (isSameLine && isNearX) {
      // Nối từ vào dòng hiện tại
      current.text += ' ' + item.text;
      current.width = (item.x + item.width) - current.x;
      current.fontSize = Math.max(current.fontSize, item.fontSize);
      if (item.isBold) current.isBold = true;
    } else {
      clustered.push(current);
      current = { ...item };
    }
  }
  clustered.push(current);

  // Chuyển đổi mảng clustered thành mảng FieldConfig của ứng dụng
  const fields: FieldConfig[] = clustered.map((item, index) => {
    const cleanText = item.text.replace(/\s+/g, ' ').trim();
    
    // Tự động phân tích xem dòng chữ có chứa placeholder hoặc biến động không
    const keyInfo = detectFieldKey(cleanText, index);

    // Xác định xem nên canh giữa hay canh trái (nếu x gần tâm canvas)
    const centerX = stageWidth / 2;
    const itemCenterX = item.x + item.width / 2;
    const isCentered = Math.abs(itemCenterX - centerX) < 60;

    return {
      id: `detected_${Date.now()}_${index}`,
      key: keyInfo.key,
      label: keyInfo.label,
      type: keyInfo.type,
      visible: true,
      x: Math.max(10, Math.min(item.x, stageWidth - 100)),
      y: Math.max(10, Math.min(item.y, stageHeight - 30)),
      fontSize: item.fontSize,
      fontFamily: item.fontFamily,
      fontWeight: item.isBold ? '700' : '500',
      color: '#0f172a',
      align: isCentered ? 'center' : 'left',
      prefix: keyInfo.prefix || '',
      suffix: keyInfo.suffix || '',
      qrSize: 100,
      barcodeFormat: 'CODE128'
    };
  });

  return fields;
}

// Phân tích thông minh tiêu đề và key trường
function detectFieldKey(text: string, index: number): { label: string; key: string; type: FieldType; prefix?: string; suffix?: string } {
  const lower = text.toLowerCase();

  // Nhận diện Họ tên
  if (lower.includes('họ và tên') || lower.includes('họ tên') || lower.includes('kính gửi') || lower.includes('ông/bà') || lower.includes('học viên')) {
    let prefix = '';
    if (lower.startsWith('kính gửi:')) prefix = 'Kính gửi: ';
    else if (lower.startsWith('kính gửi')) prefix = 'Kính gửi ';
    return { label: text, key: 'name', type: 'text', prefix };
  }

  // Nhận diện Chức vụ / Đơn vị
  if (lower.includes('chức vụ') || lower.includes('đơn vị') || lower.includes('công tác') || lower.includes('vị trí')) {
    return { label: text, key: 'title', type: 'text' };
  }

  // Nhận diện Địa chỉ
  if (lower.includes('địa chỉ') || lower.includes('nơi ở') || lower.includes('quê quán')) {
    return { label: text, key: 'address', type: 'text' };
  }

  // Nhận diện Điện thoại
  if (lower.includes('điện thoại') || lower.includes('sđt') || lower.includes('hotline') || lower.includes('phone')) {
    return { label: text, key: 'phone', type: 'text' };
  }

  // Nhận diện Mã số / Barcode / QR
  if (lower.includes('mã qr') || lower.includes('qr code')) {
    return { label: text, key: 'qr_code', type: 'qr' };
  }
  if (lower.includes('mã vạch') || lower.includes('barcode') || lower.includes('vận đơn')) {
    return { label: text, key: 'tracking_code', type: 'barcode' };
  }
  if (lower.includes('mã số') || lower.includes('số hiệu') || lower.includes('mã sv') || lower.includes('số:')) {
    return { label: text, key: 'code', type: 'text' };
  }

  // Nhận diện Ngày tháng
  if (lower.includes('ngày') && (lower.includes('tháng') || lower.includes('năm'))) {
    return { label: text, key: 'date', type: 'text' };
  }

  // Mặc định tạo key từ chữ
  const cleanKey = text.slice(0, 20).toLowerCase().replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || `field_${index + 1}`;
  return { label: text, key: cleanKey, type: 'text' };
}

function determineBestFont(pdfFontName: string = ''): string {
  const lower = pdfFontName.toLowerCase();
  if (lower.includes('times') || lower.includes('georgia') || lower.includes('serif')) {
    return "'Playfair Display', serif";
  }
  if (lower.includes('courier') || lower.includes('mono') || lower.includes('code')) {
    return "'Space Mono', monospace";
  }
  if (lower.includes('roboto')) {
    return "'Roboto', sans-serif";
  }
  return "'Inter', sans-serif";
}
