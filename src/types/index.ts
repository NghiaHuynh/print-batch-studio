export type FieldType = 'text' | 'qr' | 'barcode';

export interface FieldConfig {
  id: string;
  key: string;              // Key liên kết với cột dữ liệu (vd: 'name', 'code', 'phone')
  label: string;            // Tên hiển thị thân thiện (vd: 'Họ và Tên', 'Mã Định Danh')
  type: FieldType;
  visible: boolean;
  x: number;
  y: number;
  width?: number;           // Dùng cho QR, Barcode hoặc Text cố định độ rộng
  height?: number;
  
  // Thuộc tính văn bản (Text typography)
  fontSize: number;
  fontFamily: string;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800';
  color: string;
  align: 'left' | 'center' | 'right';
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  prefix?: string;          // Tiền tố tự động thêm trước (vd: 'Kính gửi: ', 'MS: ')
  suffix?: string;          // Hậu tố tự động thêm sau (vd: ' VNĐ', ' đ')
  
  // Thuộc tính cho QR Code / Barcode
  qrSize?: number;          // Kích thước vuông (px)
  barcodeFormat?: 'CODE128' | 'EAN13' | 'UPC';
}

export type RecordData = Record<string, string>;

export interface PaperSize {
  name: string;
  label: string;
  width: number;  // px chuẩn màn hình 96 DPI hoặc tỷ lệ thiết kế
  height: number;
  aspectRatio: number;
}

export interface TemplateInfo {
  name: string;
  type: 'image' | 'pdf' | 'preset';
  numPages: number;
  currentPage: number;
  originalWidth: number;
  originalHeight: number;
  opacity: number;          // 0.1 - 1.0 (Độ mờ phôi nền khi thiết kế)
  printBackground: boolean; // true: in cả phôi, false: chỉ in nội dung đè lên phôi có sẵn
}

export interface ProjectData {
  version: string;
  title: string;
  createdAt: string;
  templateDataUrl: string;
  stageWidth: number;
  stageHeight: number;
  paperSizeName: string;
  templateInfo?: TemplateInfo;
  fields: FieldConfig[];
  records: RecordData[];
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  category: 'invitation' | 'certificate' | 'idcard' | 'envelope';
  width: number;
  height: number;
  fields: FieldConfig[];
  defaultRecords: RecordData[];
  generateBackground: () => string; // Trả về dataUrl PNG
}
