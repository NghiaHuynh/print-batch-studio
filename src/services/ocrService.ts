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

// Tiền xử lý ảnh trên canvas trước khi OCR (thu nhỏ nếu ảnh quá lớn & tăng tương phản)
async function preprocessImageForOcr(
  imageSource: string | File,
  maxDimension = 1500
): Promise<{ dataUrl: string; scaleX: number; scaleY: number; origW: number; origH: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const tempUrl = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);

    img.onload = () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      // Thu nhỏ nếu ảnh chụp điện thoại quá lớn (4000x3000px) để tránh tràn RAM WebAssembly
      const maxSide = Math.max(origW, origH);
      const scale = maxSide > maxDimension ? maxDimension / maxSide : 1.0;
      const targetW = Math.round(origW * scale);
      const targetH = Math.round(origH * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ dataUrl: tempUrl, scaleX: 1, scaleY: 1, origW, origH });
        return;
      }

      // Vẽ ảnh lên canvas
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Tăng cường tương phản và chuyển xám để chữ in rõ nét hơn
      try {
        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          // Kéo dãn độ tương phản
          const contrast = (gray - 128) * 1.35 + 128;
          const clamped = Math.max(0, Math.min(255, contrast));
          d[i] = clamped;
          d[i + 1] = clamped;
          d[i + 2] = clamped;
        }
        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve({
          dataUrl,
          scaleX: origW / targetW,
          scaleY: origH / targetH,
          origW,
          origH
        });
      } catch {
        resolve({ dataUrl: tempUrl, scaleX: 1, scaleY: 1, origW, origH });
      } finally {
        if (typeof imageSource !== 'string') URL.revokeObjectURL(tempUrl);
      }
    };

    img.onerror = () => {
      if (typeof imageSource !== 'string') URL.revokeObjectURL(tempUrl);
      reject(new Error('Không thể đọc file ảnh!'));
    };

    img.src = tempUrl;
  });
}

export interface OcrDetectionResult {
  fields: FieldConfig[];
  isDaiDoanKet: boolean;
  extractedRecord: Record<string, string>;
  rawText: string;
}

// Bộ lọc chuỗi rác do OCR đọc sai ảnh nghiêng/bóng đổ (ví dụ: "mêSih DÂN TO SR", "x hue wo pen = Lea ngày", "| in x iy")
function isGarbledText(text: string): boolean {
  if (text.length < 3) return true;
  // Quá nhiều ký tự đặc biệt
  const specialChars = (text.match(/[|={}[\]_~<>\\/]/g) || []).length;
  if (specialChars >= 2 && specialChars / text.length > 0.15) return true;

  const lower = text.toLowerCase();
  // Từ khóa rác điển hình do camera quét chữ in mờ / bóng đổ
  const badPatterns = ['wo pen', 'dinar', 'or a me', 'mêsih', 'se fon', 'conghoaki', 'baetap', 'hnorame'];
  if (badPatterns.some(p => lower.includes(p))) return true;

  return false;
}

// 2. Nhận diện văn bản từ hình ảnh (PNG, JPG, WebP) bằng Tesseract OCR
export async function extractTextFieldsFromImage(
  imageSource: string | File,
  stageWidth: number,
  stageHeight: number,
  onProgress?: (percent: number, status: string) => void
): Promise<OcrDetectionResult> {
  try {
    const { createWorker } = await import('tesseract.js');
    if (onProgress) onProgress(10, 'Đang chuẩn bị bộ giải mã OCR & tiền xử lý ảnh...');

    // Tiền xử lý ảnh (thu nhỏ & tăng tương phản)
    const { dataUrl: processedUrl, scaleX, scaleY, origW, origH } = await preprocessImageForOcr(imageSource);

    // Tỷ lệ quy đổi từ ảnh gốc sang Canvas hiện tại
    const stageScaleX = stageWidth / origW;
    const stageScaleY = stageHeight / origH;

    if (onProgress) onProgress(20, 'Đang tải bộ từ điển tiếng Việt (vie)...');

    // Khởi tạo worker với cơ chế dự phòng linh hoạt
    let worker;
    try {
      worker = await createWorker('vie+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const p = Math.round(25 + m.progress * 65);
            onProgress(p, `Đang nhận diện chữ tiếng Việt: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
    } catch (workerErr) {
      console.warn('Không tải được gói vie+eng từ CDN, chuyển sang bộ dự phòng eng...', workerErr);
      if (onProgress) onProgress(25, 'Đang dùng bộ nhận diện dự phòng...');
      worker = await createWorker('eng', 1);
    }

    if (onProgress) onProgress(40, 'Đang quét và nhận diện cấu trúc dòng chữ...');

    // QUAN TRỌNG: Phải truyền { blocks: true } ở tham số thứ 3 để Tesseract v5 trả về chi tiết blocks/lines/words
    const res = await worker.recognize(processedUrl, {}, { blocks: true });
    await worker.terminate();

    if (onProgress) onProgress(92, 'Đang phân tích cấu trúc văn bản và lọc bỏ rác OCR...');

    const allText = res.data.text || '';
    const isDaiDoanKet = (allText.includes('ĐẠI ĐOÀN KẾT') || allText.includes('ĐOÀN KẾT') || allText.includes('MTTQ')) && 
                         (allText.includes('THƯ MỜI') || allText.includes('Ban vận động') || allText.includes('Giồng Ông Đông') || allText.includes('Đại Phước'));

    const extractedRecord: Record<string, string> = {};

    // Trích xuất họ tên người nhận từ ảnh
    const nameMatch = allText.match(/(?:Ông\s*\(bà\)|Ông\/bà|Kính mời Ông|Kính gửi Ông|Kính gửi)\s*:\s*([^\n\r]+)/i);
    if (nameMatch && nameMatch[1]) {
      extractedRecord.name = nameMatch[1].replace(/[-_.*]/g, '').trim();
    }

    // Trích xuất địa chỉ
    const addrMatch = allText.match(/(?:Địa chỉ)\s*:\s*([^\n\r]+)/i);
    if (addrMatch && addrMatch[1]) {
      extractedRecord.address = addrMatch[1].replace(/[-_.*]/g, '').trim();
    }

    // Trích xuất số thư mời
    const noMatch = allText.match(/(?:Số)\s*([0-9]+\/[A-Z-]+)/i);
    if (noMatch && noMatch[1]) {
      extractedRecord.letter_no = noMatch[1].trim();
    } else if (allText.includes('01/TM-BVĐ')) {
      extractedRecord.letter_no = '01/TM-BVĐ';
    }

    // Trích xuất thời gian
    const timeMatch = allText.match(/(?:Thời gian:\s*|Vào lúc\s*)([^\n\r]+)/i);
    if (timeMatch && timeMatch[1]) {
      extractedRecord.time = timeMatch[1].replace(/[-_.*]/g, '').trim();
    }

    // Trích xuất địa điểm
    const locMatch = allText.match(/(?:Địa điểm\s*:\s*)([^\n\r]+)/i);
    if (locMatch && locMatch[1]) {
      extractedRecord.location = locMatch[1].replace(/[-_.*]/g, '').trim();
    }

    const rawItems: ExtractedTextItem[] = [];

    // Duyệt qua blocks -> paragraphs -> lines -> words
    // Hỗ trợ chia cột thông minh cho tài liệu 2 trang / gấp đôi (như thiệp mời, bằng khen)
    if (res.data.blocks) {
      for (const block of res.data.blocks) {
        for (const paragraph of block.paragraphs) {
          for (const line of paragraph.lines) {
            if (!line.words || line.words.length === 0) continue;

            let currentCluster = [line.words[0]];

            for (let i = 1; i < line.words.length; i++) {
              const prevWord = line.words[i - 1];
              const currWord = line.words[i];
              // Khoảng cách theo tọa độ ảnh gốc
              const gap = (currWord.bbox.x0 - prevWord.bbox.x1) * scaleX;

              // Nếu khoảng trống giữa 2 từ > 45px -> Đây là 2 cột riêng biệt (trang trái & trang phải của thiệp gấp)
              if (gap > 45) {
                pushClusterToItems(currentCluster, rawItems, scaleX, scaleY, stageScaleX, stageScaleY);
                currentCluster = [currWord];
              } else {
                currentCluster.push(currWord);
              }
            }

            if (currentCluster.length > 0) {
              pushClusterToItems(currentCluster, rawItems, scaleX, scaleY, stageScaleX, stageScaleY);
            }
          }
        }
      }
    }

    const fields = clusterItemsIntoFields(rawItems, stageWidth, stageHeight);

    return {
      fields,
      isDaiDoanKet,
      extractedRecord,
      rawText: allText
    };
  } catch (err) {
    console.warn('Lỗi OCR hình ảnh:', err);
    throw err;
  }
}

// Đóng gói cụm từ thành ExtractedTextItem với tọa độ quy đổi chính xác
function pushClusterToItems(
  cluster: any[],
  targetList: ExtractedTextItem[],
  procScaleX: number,
  procScaleY: number,
  stageScaleX: number,
  stageScaleY: number
) {
  const text = cluster.map(w => w.text).join(' ').trim();
  // Bỏ qua ký tự rác hoặc lỗi OCR
  if (!text || text.length < 2 || isGarbledText(text)) return;

  const minX = Math.min(...cluster.map(w => w.bbox.x0)) * procScaleX;
  const minY = Math.min(...cluster.map(w => w.bbox.y0)) * procScaleY;
  const maxX = Math.max(...cluster.map(w => w.bbox.x1)) * procScaleX;
  const maxY = Math.max(...cluster.map(w => w.bbox.y1)) * procScaleY;

  const canvasX = Math.round(minX * stageScaleX);
  const canvasY = Math.round(minY * stageScaleY);
  const canvasWidth = Math.round((maxX - minX) * stageScaleX);
  const canvasHeight = Math.round((maxY - minY) * stageScaleY);

  // Giới hạn cỡ chữ trong khoảng 13px - 17px, tuyệt đối không để quá to đè lấn nhau
  const isHeading = text.toUpperCase() === text && text.length > 4 && text.length < 35;
  const fontSize = isHeading ? 17 : 14;

  targetList.push({
    text,
    x: canvasX,
    y: canvasY,
    width: canvasWidth,
    height: canvasHeight,
    fontSize,
    fontFamily: "'Inter', sans-serif",
    isBold: isHeading
  });
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
    if (Math.abs(a.y - b.y) <= 8) return a.x - b.x;
    return a.y - b.y;
  });

  const clustered: ExtractedTextItem[] = [];
  let current = { ...rawItems[0] };

  for (let i = 1; i < rawItems.length; i++) {
    const item = rawItems[i];
    const isSameLine = Math.abs(item.y - current.y) <= 8;
    // Không nối nếu khoảng cách ngang quá xa (chia 2 cột)
    const isNearX = item.x >= current.x && (item.x - (current.x + current.width)) <= 35;

    if (isSameLine && isNearX) {
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

    // Xác định xem nên canh giữa hay canh trái
    const centerX = stageWidth / 2;
    const itemCenterX = item.x + item.width / 2;
    const isCentered = Math.abs(itemCenterX - centerX) < 50;

    return {
      id: `detected_${Date.now()}_${index}`,
      key: keyInfo.key,
      label: keyInfo.label,
      defaultValue: cleanText,
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

  // 1. Nhận diện Họ tên / Kính mời / Ông (bà)
  if (
    lower.includes('ông (bà)') ||
    lower.includes('ông/bà') ||
    lower.includes('ông:') ||
    lower.includes('bà:') ||
    lower.includes('kính mời') ||
    lower.includes('kính gửi') ||
    lower.includes('họ và tên') ||
    lower.includes('họ tên') ||
    lower.includes('học viên')
  ) {
    let prefix = '';
    let label = 'Họ và Tên Khách Mời';
    if (text.includes('- Ông (bà):') || text.includes('Ông (bà):')) {
      prefix = '- Ông (bà): ';
      label = 'Ông (bà)';
    } else if (lower.startsWith('kính gửi:')) {
      prefix = 'Kính gửi: ';
      label = 'Kính gửi';
    } else if (lower.startsWith('kính mời:')) {
      prefix = 'Kính mời: ';
      label = 'Kính mời';
    }
    return { label, key: 'name', type: 'text', prefix };
  }

  // 2. Nhận diện Địa chỉ
  if (lower.includes('địa chỉ') || lower.includes('nơi ở') || lower.includes('quê quán') || lower.includes('trú tại')) {
    let prefix = '';
    if (text.includes('- Địa chỉ:') || text.includes('Địa chỉ:')) {
      prefix = '- Địa chỉ: ';
    }
    return { label: 'Địa Chỉ Khách Mời', key: 'address', type: 'text', prefix };
  }

  // 3. Nhận diện Thời gian / Vào lúc
  if (lower.includes('thời gian') || lower.includes('vào lúc') || lower.includes('hồi:') || lower.includes('khai mạc:')) {
    let prefix = '';
    if (text.includes('Thời gian:')) prefix = 'Thời gian: ';
    return { label: 'Thời Gian Tổ Chức', key: 'time', type: 'text', prefix };
  }

  // 4. Nhận diện Địa điểm / Tại
  if (lower.includes('địa điểm') || lower.includes('tại hội trường') || lower.includes('tại nhà') || lower.includes('tại trụ sở')) {
    let prefix = '';
    if (text.includes('Địa điểm:')) prefix = 'Địa điểm: ';
    return { label: 'Địa Điểm Tổ Chức', key: 'location', type: 'text', prefix };
  }

  // 5. Nhận diện Số hiệu văn bản / Số thư mời
  if (lower.includes('/tm') || lower.includes('số:') || lower.startsWith('số ') || lower.includes('số hiệu')) {
    let prefix = '';
    if (text.includes('Số:')) prefix = 'Số: ';
    else if (text.startsWith('Số ')) prefix = 'Số: ';
    return { label: 'Số Thư Mời / Công Văn', key: 'letter_no', type: 'text', prefix };
  }

  // 6. Nhận diện Chức vụ / Đơn vị
  if (lower.includes('chức vụ') || lower.includes('đơn vị') || lower.includes('công tác') || lower.includes('vị trí')) {
    return { label: text, key: 'title', type: 'text' };
  }

  // 7. Nhận diện Điện thoại
  if (lower.includes('điện thoại') || lower.includes('sđt') || lower.includes('hotline') || lower.includes('phone')) {
    return { label: text, key: 'phone', type: 'text' };
  }

  // 8. Nhận diện Mã số / Barcode / QR
  if (lower.includes('mã qr') || lower.includes('qr code')) {
    return { label: text, key: 'qr_code', type: 'qr' };
  }
  if (lower.includes('mã vạch') || lower.includes('barcode') || lower.includes('vận đơn')) {
    return { label: text, key: 'tracking_code', type: 'barcode' };
  }
  if (lower.includes('mã số') || lower.includes('mã sv')) {
    return { label: text, key: 'code', type: 'text' };
  }

  // 9. Nhận diện Ngày tháng
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
