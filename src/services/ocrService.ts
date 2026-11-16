import * as pdfjsLib from 'pdfjs-dist';
import { FieldConfig, FieldType, RecordData } from '../types';

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
          const contrast = (gray - 128) * 1.25 + 128;
          const clamped = Math.max(0, Math.min(255, contrast));
          d[i] = clamped;
          d[i + 1] = clamped;
          d[i + 2] = clamped;
        }
        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
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

export interface TableOcrResult {
  headers: string[];
  records: RecordData[];
}

// Chuyển đổi trang PDF thành hình ảnh dataUrl để phục vụ OCR quét bảng
export async function convertPdfPageToImage(file: File, pageNum: number = 1): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(Math.min(pageNum, pdf.numPages));
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không thể tạo canvas context');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}

// Mẫu nhận diện các đơn vị / cơ quan / chức vụ phổ biến trong bảng danh sách tiếng Việt
const UNIT_PATTERNS = [
  /TRƯỜNG/i,
  /BAN\s+/i,
  /BẠN\s+/i,
  /HÀNH\s+CHÍNH/i,
  /PHÒNG/i,
  /XÃ\s+ĐỘI/i,
  /CHI\s+BỘ/i,
  /CHỊ\s+BỘ/i,
  /ĐỊA\s+CHÍNH/i,
  /GV\s+/i,
  /CÔNG\s+TY/i,
  /ỦY\s+BAN/i,
  /UBND/i,
  /HỘI\s+NÔNG\s+DÂN/i,
  /ĐOÀN\s+THANH\s+NIÊN/i,
  /CÔNG\s+AN/i,
  /QUÂN\s+SỰ/i,
  /ĐẢNG\s+XÃ/i,
  /ĐĂNG\s+XÃ/i,
  /TTPHÁT/i,
  /QUỸ\s+ĐẤT/i,
  /QUỸ\s+ĐÁT/i
];

function isUnitText(text: string): boolean {
  return UNIT_PATTERNS.some(pat => pat.test(text));
}

function isAddressText(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('giồng') || lower.includes('giòng') || lower.includes('giông') || 
         lower.includes('ông đông') || lower.includes('ấp ') || lower.includes('thôn ') || 
         lower.includes('tổ ') || lower.includes('khu phố') || lower.includes('số nhà');
}

// Làm sạch tên khách mời: xóa bỏ dấu ngoặc vuông [, ], dấu gạch |, I, số STT dính trước tên
export function cleanGuestName(raw: string): string {
  if (!raw) return '';
  let s = raw;
  // 1. Xóa các ký tự nhiễu biên khung / bảng scan như [, ], |, /, \, ~, `, ', ", {, }, (, ), :, ;, !, ?, *
  s = s.replace(/^[|/\\_.\-\s'",~`:;!?[\]{}()<>=+*#@$%^&]+/g, '').trim();
  s = s.replace(/[|/\\_.\-\s'",~`:;!?[\]{}()<>=+*#@$%^&]+$/g, '').trim();
  // 2. Xóa số thứ tự đầu chuỗi (vd: "30 ", "31. ", "32 - ", "26 |")
  s = s.replace(/^\d{1,3}[\s._|/\\-]+/g, '').trim();
  // 3. Xóa lại ký tự biên nếu xuất hiện sau STT
  s = s.replace(/^[|/\\_.\-\s'",~`:;!?[\]{}()<>=+*#@$%^&]+/g, '').trim();
  // 4. Xóa các ký tự đơn nhiễu do vạch kẻ dọc (I, l, 1) trước chữ cái viết hoa tiếng Việt
  s = s.replace(/^[I|l1]\s+(?=[A-ZÀ-ỸĐ])/g, '').trim();
  s = s.replace(/[|/\\_.\-\s'",~`:;!?[\]{}()<>=+*#@$%^&]+$/g, '').trim();
  // 5. Nếu toàn bộ chuỗi chỉ là số thì không thể là tên khách mời
  if (/^\d+$/.test(s)) return '';
  return s;
}

function cleanUnitText(unit: string): string {
  if (!unit) return '';
  let s = unit.replace(/^[|/\\_.\-\s'",~`:;!?[\]{}()<>=+*#@$%^&]+|[|/\\_.\-\s'",~`:;!?[\]{}()<>=+*#@$%^&]+$/g, '').trim();
  // Bỏ phần địa chỉ đuôi nếu vô tình bị dính vào qua | hoặc /
  s = s.replace(/[|/\\].*?(?:GIỒNG|GIÒNG|GIÔNG|ÔNG ĐÔNG).*$/i, '').trim();
  return s;
}

function cleanAddressText(address: string): string {
  if (!address) return '';
  let s = address.replace(/^[|/\\_.\-\s'",~`:;!?[\]{}()<>=+*#@$%^&]+|[|/\\_.\-\s'",~`:;!?[\]{}()<>=+*#@$%^&]+$/g, '').trim();
  return s;
}

function splitDelimitedCell(text: string): string[] {
  // Tách ô nếu có dấu phân cách / hoặc |
  const m = text.match(/^(.*?)\s*([|/])\s*(.*)$/);
  if (m && m[1].trim().length >= 3 && m[3].trim().length >= 2) {
    return [m[1].trim(), m[3].trim()];
  }
  // Tách nếu chứa từ khóa đơn vị ngay sau tên
  for (const pat of UNIT_PATTERNS) {
    const um = text.match(pat);
    if (um && um.index && um.index >= 4) {
      return [text.slice(0, um.index).trim(), text.slice(um.index).trim()];
    }
  }
  return [text];
}

// 3. Nhận diện cấu trúc bảng dữ liệu từ hình ảnh hoặc PDF (chuyển sang danh sách bản ghi)
export async function parseTableFromImage(
  source: string | File,
  onProgress?: (percent: number, status: string) => void
): Promise<TableOcrResult> {
  try {
    let imageSource = source;
    if (source instanceof File && (source.type === 'application/pdf' || source.name.toLowerCase().endsWith('.pdf'))) {
      if (onProgress) onProgress(10, 'Đang chuyển đổi trang PDF sang hình ảnh độ phân giải cao...');
      imageSource = await convertPdfPageToImage(source, 1);
    }

    const { createWorker, PSM } = await import('tesseract.js');
    if (onProgress) onProgress(20, 'Đang tiền xử lý ảnh và khử nhiễu bảng...');

    const { dataUrl: processedUrl } = await preprocessImageForOcr(imageSource, 2000);

    if (onProgress) onProgress(30, 'Đang tải bộ nhận diện quang học tiếng Việt...');
    let worker;
    try {
      worker = await createWorker('vie', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const p = Math.round(35 + m.progress * 55);
            onProgress(p, `Đang quét nhận diện chữ trong bảng: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    } catch (e) {
      console.warn('Lỗi tải model vie, fallback sang eng:', e);
      worker = await createWorker('eng', 1);
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    }

    if (onProgress) onProgress(50, 'Đang quét và phân tích tọa độ từng ô dữ liệu...');
    const ret = await worker.recognize(processedUrl, {}, { tsv: true });
    await worker.terminate();

    if (onProgress) onProgress(92, 'Đang gom hàng và phân tách các cột dữ liệu...');

    const tsvContent = ret.data.tsv || '';
    const lines = tsvContent.split('\n');
    const words: Array<{ left: number; top: number; width: number; height: number; right: number; conf: number; text: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('\t');
      if (parts.length < 12) continue;
      if (parseInt(parts[0], 10) !== 5) continue; // Level 5 là Word
      const left = parseInt(parts[6], 10);
      const top = parseInt(parts[7], 10);
      const width = parseInt(parts[8], 10);
      const height = parseInt(parts[9], 10);
      const conf = parseFloat(parts[10]);
      const text = parts[11]?.trim();

      if (!text || conf < 15) continue;
      words.push({ left, top, width, height, right: left + width, conf, text });
    }

    if (words.length === 0) {
      throw new Error('Không phát hiện được văn bản nào trong bảng ảnh!');
    }

    // 1. Gom các từ thành từng hàng theo tọa độ Y trung bình động (ngưỡng 20px)
    words.sort((a, b) => a.top - b.top);
    const rows: Array<{ centerY: number; words: typeof words }> = [];
    words.forEach(w => {
      const centerY = w.top + w.height / 2;
      let bestRow: { centerY: number; words: typeof words } | null = null;
      let minDiff = Infinity;

      for (const r of rows) {
        const diff = Math.abs(r.centerY - centerY);
        if (diff <= 20 && diff < minDiff) {
          minDiff = diff;
          bestRow = r;
        }
      }

      if (bestRow) {
        bestRow.words.push(w);
        const sumY = bestRow.words.reduce((sum, item) => sum + (item.top + item.height / 2), 0);
        bestRow.centerY = sumY / bestRow.words.length;
      } else {
        rows.push({ centerY, words: [w] });
      }
    });

    rows.sort((a, b) => a.centerY - b.centerY);

    // 2. Gom các từ trong mỗi hàng thành các ô (cells) dựa vào khoảng trống ngang (gap > 26px)
    const rawTableRows: string[][] = [];
    rows.forEach(r => {
      r.words.sort((a, b) => a.left - b.left);
      const cells: string[] = [];
      let currentCellWords: typeof words = [];

      r.words.forEach((w, i) => {
        if (i === 0) {
          currentCellWords.push(w);
        } else {
          const prev = r.words[i - 1];
          const gap = w.left - prev.right;
          if (gap > 26) {
            cells.push(currentCellWords.map(cw => cw.text).join(' '));
            currentCellWords = [w];
          } else {
            currentCellWords.push(w);
          }
        }
      });
      if (currentCellWords.length > 0) {
        cells.push(currentCellWords.map(cw => cw.text).join(' '));
      }

      if (cells.length >= 2) {
        rawTableRows.push(cells);
      }
    });

    if (rawTableRows.length === 0) {
      throw new Error('Không nhận diện được cấu trúc bảng trong ảnh. Vui lòng chụp rõ các cột hơn!');
    }

    // 3. Kiểm tra xem dòng đầu tiên có phải là tiêu đề (Header row) không
    let startIndex = 0;
    const firstRowText = rawTableRows[0].join(' ').toLowerCase();
    const hasHeaderKeywords = firstRowText.includes('stt') || 
                              firstRowText.includes('họ') || 
                              firstRowText.includes('tên') || 
                              firstRowText.includes('đơn vị') || 
                              firstRowText.includes('chức vụ') || 
                              firstRowText.includes('địa chỉ') || 
                              firstRowText.includes('ký nhận');

    let headers: string[] = ['STT', 'Họ và Tên', 'Đơn vị / Chức vụ', 'Địa chỉ'];

    if (hasHeaderKeywords) {
      headers = rawTableRows[0].map(c => cleanGuestName(c) || 'Cột');
      startIndex = 1;
    }

    // 4. Trích xuất và phân loại ngữ nghĩa từng ô dữ liệu
    const records: RecordData[] = [];

    for (let r = startIndex; r < rawTableRows.length; r++) {
      const rowCells = rawTableRows[r];

      // Tách thêm nếu ô chứa dấu gạch nối giữa Tên và Đơn vị
      const expandedCells: string[] = [];
      rowCells.forEach(cell => {
        const parts = splitDelimitedCell(cell);
        expandedCells.push(...parts);
      });

      let stt = '';
      let name = '';
      let unit = '';
      let address = '';

      expandedCells.forEach(rawCell => {
        const cell = rawCell.trim();
        if (!cell) return;

        // A. Ô chỉ chứa số -> Đây là STT, tuyệt đối không thể là tên khách mời
        if (/^\d{1,3}$/.test(cell)) {
          if (!stt) stt = cell;
          return;
        }

        // B. Ô chứa từ khóa đơn vị / cơ quan / chức vụ -> Thuộc cột Đơn vị
        if (isUnitText(cell)) {
          if (!unit) unit = cleanUnitText(cell);
          return;
        }

        // C. Ô chứa từ khóa địa chỉ -> Thuộc cột Địa chỉ
        if (isAddressText(cell)) {
          if (!address) address = cleanAddressText(cell);
          return;
        }

        // D. Ứng viên Họ và Tên khách mời
        const cleaned = cleanGuestName(cell);
        if (cleaned && !name && !/^\d+$/.test(cleaned)) {
          name = cleaned;
        }
      });

      if (!stt) stt = String(records.length + 1);

      // Bỏ qua dòng rác OCR nếu cả tên và đơn vị đều trống
      if (!name && !unit) continue;

      const record: RecordData = {
        'STT': stt,
        'Họ và Tên': name,
        'name': name,
        'Đơn vị / Chức vụ': unit,
        'don_vi': unit,
        'Địa chỉ': address,
        'address': address
      };

      records.push(record);
    }

    // 5. Tự động bù địa chỉ chung nếu một số dòng bị thiếu địa chỉ
    const addressCounts: Record<string, number> = {};
    records.forEach(rec => {
      if (rec['Địa chỉ']) {
        addressCounts[rec['Địa chỉ']] = (addressCounts[rec['Địa chỉ']] || 0) + 1;
      }
    });

    let commonAddress = '';
    let maxCount = 0;
    for (const [addr, count] of Object.entries(addressCounts)) {
      if (count > maxCount) {
        maxCount = count;
        commonAddress = addr;
      }
    }

    if (commonAddress) {
      records.forEach(rec => {
        if (!rec['Địa chỉ']) {
          rec['Địa chỉ'] = commonAddress;
          rec['address'] = commonAddress;
        }
      });
    }

    if (onProgress) onProgress(100, `Hoàn tất! Đã trích xuất ${records.length} dòng dữ liệu.`);

    return {
      headers,
      records
    };
  } catch (err) {
    console.error('Lỗi nhận diện bảng từ ảnh:', err);
    throw err;
  }
}
