import React, { useEffect, useState } from 'react';
import { FieldConfig, RecordData } from '../types';
import { generateQrDataUrl, generateBarcodeDataUrl } from '../services/pdfService';

interface PrintContainerProps {
  templateDataUrl: string;
  stageWidth: number;
  stageHeight: number;
  fields: FieldConfig[];
  records: RecordData[];
  printBackground?: boolean;
}

export const PrintContainer: React.FC<PrintContainerProps> = ({
  templateDataUrl,
  stageWidth,
  stageHeight,
  fields,
  records,
  printBackground = true
}) => {
  const [codeCache, setCodeCache] = useState<Record<string, string>>({});

  // Sinh trước QR và Barcode cho tất cả các bản ghi để sẵn sàng in
  useEffect(() => {
    const generateAllCodes = async () => {
      const newCache: Record<string, string> = {};
      for (const field of fields) {
        if (!field.visible) continue;
        if (field.type === 'qr') {
          for (const rec of records) {
            const val = rec[field.key] || rec[field.label] || '';
            const key = `qr_${field.id}_${val}`;
            if (val && !newCache[key]) {
              newCache[key] = await generateQrDataUrl(val, field.qrSize || 100);
            }
          }
        } else if (field.type === 'barcode') {
          for (const rec of records) {
            const val = rec[field.key] || rec[field.label] || '';
            const key = `bc_${field.id}_${val}`;
            if (val && !newCache[key]) {
              newCache[key] = generateBarcodeDataUrl(val, field.barcodeFormat || 'CODE128');
            }
          }
        }
      }
      setCodeCache(newCache);
    };

    if (records.length > 0 && fields.some(f => f.type === 'qr' || f.type === 'barcode')) {
      generateAllCodes();
    }
  }, [fields, records]);

  return (
    <div id="print-container">
      {records.map((record, index) => (
        <div
          key={index}
          className="print-page"
          style={{
            width: `${stageWidth}px`,
            height: `${stageHeight}px`
          }}
        >
          {/* Ảnh phôi nền (ẩn nếu người dùng chọn chỉ in chữ lên phôi giấy có sẵn) */}
          {printBackground && templateDataUrl && (
            <img src={templateDataUrl} alt="Phôi in" className="bg-template" />
          )}

          {/* Các trường dữ liệu */}
          {fields.map((field) => {
            if (!field.visible) return null;
            const rawVal = record[field.key] ?? (field.defaultValue !== undefined ? field.defaultValue : (record[field.label] || ''));
            if (!rawVal) return null;

            let displayText = rawVal;
            if (field.prefix) displayText = field.prefix + displayText;
            if (field.suffix) displayText = displayText + field.suffix;
            if (field.textTransform === 'uppercase') displayText = displayText.toUpperCase();
            if (field.textTransform === 'lowercase') displayText = displayText.toLowerCase();

            return (
              <div
                key={field.id}
                className="print-field"
                style={{
                  left: `${field.x + 8}px`,
                  top: `${field.y + 2}px`,
                  fontSize: `${field.fontSize}px`,
                  fontFamily: field.fontFamily,
                  fontWeight: field.fontWeight,
                  color: field.color,
                  fontStyle: field.fontStyle || 'normal',
                  textAlign: field.align,
                  lineHeight: 1.45,
                  whiteSpace: field.width ? 'pre-wrap' : 'pre',
                  width: field.width ? `${field.width}px` : undefined,
                  maxWidth: field.width ? `${field.width}px` : undefined
                }}
              >
                {field.type === 'text' && (
                  <span>{displayText}</span>
                )}

                {field.type === 'qr' && codeCache[`qr_${field.id}_${rawVal}`] && (
                  <img
                    src={codeCache[`qr_${field.id}_${rawVal}`]}
                    alt="QR"
                    style={{
                      width: `${field.width || field.qrSize || 100}px`,
                      height: `${field.height || field.qrSize || 100}px`
                    }}
                  />
                )}

                {field.type === 'barcode' && codeCache[`bc_${field.id}_${rawVal}`] && (
                  <div>
                    <img
                      src={codeCache[`bc_${field.id}_${rawVal}`]}
                      alt="Barcode"
                      style={{
                        width: `${field.width || 180}px`,
                        height: `${field.height || 50}px`
                      }}
                    />
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', textAlign: 'center' }}>
                      {rawVal}
                    </div>
                  </div>
                )}

                {field.type === 'seal' && (
                  <div
                    className="rounded-full flex flex-col items-center justify-center text-center p-1 border-2"
                    style={{
                      width: `${field.width || 82}px`,
                      height: `${field.height || field.width || 82}px`,
                      borderColor: field.color || '#dc2626',
                      transform: 'rotate(-5deg)',
                      backgroundColor: 'rgba(239, 68, 68, 0.04)',
                      boxShadow: 'inset 0 0 0 1px rgba(220, 38, 38, 0.35)'
                    }}
                  >
                    <div
                      className="w-full h-full rounded-full border border-dashed flex flex-col items-center justify-center p-1"
                      style={{ borderColor: field.color || '#dc2626' }}
                    >
                      <span
                        style={{
                          fontSize: `${field.fontSize || 9.5}px`,
                          fontFamily: field.fontFamily || "'Times New Roman', Times, serif",
                          fontWeight: field.fontWeight || '700',
                          color: field.color || '#dc2626',
                          lineHeight: 1.15,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {displayText}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
