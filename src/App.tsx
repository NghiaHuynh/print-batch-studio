import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { FieldConfig, FieldType, RecordData, PresetTemplate, ProjectData, TemplateInfo } from './types';
import { PRESET_TEMPLATES } from './services/templatePresets';
import { convertPdfPageToImage, exportBatchPdf } from './services/pdfService';
import { extractTextFieldsFromPdf, extractTextFieldsFromImage } from './services/ocrService';
import { exportProjectFile, importProjectFile } from './services/projectService';
import { Header } from './components/Header';
import { FieldsSidebar } from './components/FieldsSidebar';
import { CanvasArea } from './components/CanvasArea';
import { InspectorSidebar } from './components/InspectorSidebar';
import { DataModal } from './components/DataModal';
import { PrintContainer } from './components/PrintContainer';

interface HistoryState {
  fields: FieldConfig[];
  templateDataUrl: string;
  stageWidth: number;
  stageHeight: number;
  templateInfo: TemplateInfo;
}

export const App: React.FC = () => {
  // Preset mặc định ban đầu: Thiệp Mời Hội Nghị VIP
  const initialPreset = PRESET_TEMPLATES[0];

  const [templateDataUrl, setTemplateDataUrl] = useState<string>('');
  const [stageWidth, setStageWidth] = useState<number>(initialPreset.width);
  const [stageHeight, setStageHeight] = useState<number>(initialPreset.height);
  const [fields, setFields] = useState<FieldConfig[]>(initialPreset.fields);
  const [records, setRecords] = useState<RecordData[]>(initialPreset.defaultRecords);
  
  // Thông tin cấu trúc phôi mẫu
  const [templateInfo, setTemplateInfo] = useState<TemplateInfo>({
    name: initialPreset.name,
    type: 'preset',
    numPages: 1,
    currentPage: 1,
    originalWidth: initialPreset.width,
    originalHeight: initialPreset.height,
    opacity: 1.0,
    printBackground: true
  });
  const [activePdfFile, setActivePdfFile] = useState<File | null>(null);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(initialPreset.fields[0]?.id || null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  // Export PDF State
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  // Tự động nhận diện văn bản (OCR / PDF Text Extraction)
  const [isDetectingText, setIsDetectingText] = useState<boolean>(false);
  const [detectProgress, setDetectProgress] = useState<{ percent: number; status: string } | null>(null);

  // Loading overlay khi xử lý file nặng
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Khởi tạo phôi nền mặc định
  useEffect(() => {
    const defaultBg = initialPreset.generateBackground();
    setTemplateDataUrl(defaultBg);
  }, []);

  // Ghi nhận lịch sử (History record) trước mỗi thay đổi lớn
  const pushHistory = useCallback(() => {
    setUndoStack(prev => [
      ...prev.slice(-25),
      { fields, templateDataUrl, stageWidth, stageHeight, templateInfo }
    ]);
    setRedoStack([]);
  }, [fields, templateDataUrl, stageWidth, stageHeight, templateInfo]);

  // Hoàn tác (Undo)
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { fields, templateDataUrl, stageWidth, stageHeight, templateInfo }]);
    setUndoStack(prev => prev.slice(0, -1));

    setFields(previous.fields);
    setTemplateDataUrl(previous.templateDataUrl);
    setStageWidth(previous.stageWidth);
    setStageHeight(previous.stageHeight);
    setTemplateInfo(previous.templateInfo);
    showToast('Đã hoàn tác thao tác!', 'info');
  }, [undoStack, fields, templateDataUrl, stageWidth, stageHeight, templateInfo, showToast]);

  // Làm lại (Redo)
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { fields, templateDataUrl, stageWidth, stageHeight, templateInfo }]);
    setRedoStack(prev => prev.slice(0, -1));

    setFields(next.fields);
    setTemplateDataUrl(next.templateDataUrl);
    setStageWidth(next.stageWidth);
    setStageHeight(next.stageHeight);
    setTemplateInfo(next.templateInfo);
    showToast('Đã làm lại thao tác!', 'info');
  }, [redoStack, fields, templateDataUrl, stageWidth, stageHeight, templateInfo, showToast]);

  // Bắt phím tắt Ctrl+Z, Ctrl+Y, Ctrl+P
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (cmdKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (cmdKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleExecutePrint();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Áp dụng Mẫu có sẵn (Preset)
  const handleSelectPreset = (preset: PresetTemplate) => {
    pushHistory();
    const bgUrl = preset.generateBackground();
    setTemplateDataUrl(bgUrl);
    setStageWidth(preset.width);
    setStageHeight(preset.height);
    setFields(preset.fields);
    setRecords(preset.defaultRecords);
    setSelectedFieldId(preset.fields[0]?.id || null);
    setPreviewIndex(0);
    setActivePdfFile(null);
    setTemplateInfo({
      name: preset.name,
      type: 'preset',
      numPages: 1,
      currentPage: 1,
      originalWidth: preset.width,
      originalHeight: preset.height,
      opacity: 1.0,
      printBackground: true
    });
    showToast(`Đã tải mẫu: ${preset.name}!`);
  };

  // Tải lên phôi hình ảnh hoặc PDF (Bảo toàn tỷ lệ cấu trúc gốc & hỗ trợ chỉnh sửa)
  const handleUploadTemplate = async (file: File) => {
    setIsLoadingFile(true);
    pushHistory();

    try {
      if (file.type === 'application/pdf') {
        const res = await convertPdfPageToImage(file, 1, 2.5);
        
        // Chuẩn hóa kích thước vừa khung nhìn nhưng BẢO TOÀN TUYỆT ĐỐI tỷ lệ aspect ratio
        const ratio = res.height / res.width;
        let newW = res.width;
        let newH = res.height;

        if (res.width >= res.height) {
          // Khổ ngang (Landscape)
          newW = Math.min(res.width, 920);
          newH = Math.round(newW * ratio);
        } else {
          // Khổ dọc (Portrait)
          newH = Math.min(res.height, 750);
          newW = Math.round(newH / ratio);
        }

        setTemplateDataUrl(res.dataUrl);
        setStageWidth(newW);
        setStageHeight(newH);
        setActivePdfFile(file);
        setTemplateInfo({
          name: file.name,
          type: 'pdf',
          numPages: res.numPages,
          currentPage: 1,
          originalWidth: res.width,
          originalHeight: res.height,
          opacity: 1.0,
          printBackground: true
        });

        // Tự động gom các trường vào vùng an toàn của phôi mới
        setFields(prev => prev.map(f => ({
          ...f,
          x: Math.min(Math.max(20, f.x), newW - 120),
          y: Math.min(Math.max(20, f.y), newH - 40)
        })));

        showToast(`Đã nạp file PDF "${file.name}" chuẩn cấu trúc (${newW}×${newH}px, ${res.numPages} trang). Nhấp đúp vào phôi để đặt trường mới!`);
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const ratio = img.naturalHeight / img.naturalWidth;
            let newW = img.naturalWidth;
            let newH = img.naturalHeight;

            if (img.naturalWidth >= img.naturalHeight) {
              newW = Math.min(img.naturalWidth, 920);
              newH = Math.round(newW * ratio);
            } else {
              newH = Math.min(img.naturalHeight, 750);
              newW = Math.round(newH / ratio);
            }

            const dataUrl = e.target?.result as string;
            setTemplateDataUrl(dataUrl);
            setStageWidth(newW);
            setStageHeight(newH);
            setActivePdfFile(null);
            setTemplateInfo({
              name: file.name,
              type: 'image',
              numPages: 1,
              currentPage: 1,
              originalWidth: img.naturalWidth,
              originalHeight: img.naturalHeight,
              opacity: 1.0,
              printBackground: true
            });

            // Tự động gom các trường vào vùng an toàn
            setFields(prev => prev.map(f => ({
              ...f,
              x: Math.min(Math.max(20, f.x), newW - 120),
              y: Math.min(Math.max(20, f.y), newH - 40)
            })));

            showToast(`Đã nạp ảnh phôi "${file.name}" giữ nguyên cấu trúc (${newW}×${newH}px). Nhấp đúp vào phôi để đặt trường mới!`);
            setIsLoadingFile(false);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        return;
      } else {
        showToast('Vui lòng chọn file Ảnh (PNG, JPG, WebP) hoặc file PDF!', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Có lỗi xảy ra khi đọc file phôi!', 'error');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Đổi trang PDF khi phôi là file PDF nhiều trang
  const handleChangePdfPage = async (page: number) => {
    if (!activePdfFile) return;
    try {
      setIsLoadingFile(true);
      const res = await convertPdfPageToImage(activePdfFile, page, 2.5);
      setTemplateDataUrl(res.dataUrl);
      setTemplateInfo(prev => ({ ...prev, currentPage: page }));
      showToast(`Đã chuyển sang trang ${page} của file PDF!`);
    } catch (err) {
      console.error(err);
      showToast('Không thể chuyển trang PDF!', 'error');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Cập nhật vị trí kéo thả trường
  const handleUpdateFieldPosition = (id: string, x: number, y: number) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, x, y } : f));
  };

  // Cập nhật thuộc tính của trường từ Inspector
  const handleUpdateField = (id: string, updates: Partial<FieldConfig>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Bật/tắt hiển thị trường
  const handleToggleFieldVisibility = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  };

  // Xóa trường
  const handleDeleteField = (id: string) => {
    pushHistory();
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
    showToast('Đã xóa trường!');
  };

  // Thêm trường mới từ sidebar
  const handleAddField = (type: FieldType, label: string, key: string) => {
    pushHistory();
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      key,
      label,
      type,
      visible: true,
      x: Math.round(stageWidth / 2) - 80,
      y: Math.round(stageHeight / 2) - 20,
      fontSize: 18,
      fontFamily: "'Inter', sans-serif",
      fontWeight: '600',
      color: '#0f172a',
      align: 'left',
      qrSize: 100,
      barcodeFormat: 'CODE128'
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
    showToast(`Đã thêm trường "${label}"!`);
  };

  // Thêm trường tại tọa độ chính xác (khi double-click trên phôi)
  const handleAddFieldAtPosition = (type: FieldType, label: string, key: string, x: number, y: number) => {
    pushHistory();
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      key,
      label,
      type,
      visible: true,
      x,
      y,
      fontSize: 18,
      fontFamily: "'Inter', sans-serif",
      fontWeight: '600',
      color: '#0f172a',
      align: 'left',
      qrSize: 100,
      barcodeFormat: 'CODE128'
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
    showToast(`Đã đặt trường "${label}" tại (${x}, ${y})!`);
  };

  // Cập nhật kích thước phôi
  const handleUpdateStageDimensions = (newW: number, newH: number) => {
    pushHistory();
    setStageWidth(newW);
    setStageHeight(newH);
    setFields(prev => prev.map(f => ({
      ...f,
      x: Math.min(f.x, newW - 80),
      y: Math.min(f.y, newH - 30)
    })));
    showToast(`Đã đổi kích thước phôi thành ${newW} × ${newH}px!`);
  };

  // Căn giữa phôi theo chiều ngang
  const handleCenterHorizontally = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (!field) return;
    pushHistory();
    
    const estimatedWidth = field.type === 'qr' ? (field.qrSize || 100) :
                           field.type === 'barcode' ? (field.width || 180) :
                           Math.max(80, (field.label.length || 8) * (field.fontSize * 0.55));
    const centerX = Math.max(0, Math.round((stageWidth - estimatedWidth) / 2));
    handleUpdateFieldPosition(id, centerX, field.y);
    showToast('Đã căn giữa trường theo chiều ngang!');
  };

  // Tự động tạo các trường từ danh sách tiêu đề cột của file Excel
  const handleAutoCreateFieldsFromHeaders = (headers: string[]) => {
    pushHistory();
    let currentY = 160;
    const newFields: FieldConfig[] = [...fields];

    headers.forEach((h, idx) => {
      const lower = h.toLowerCase();
      const isQr = lower.includes('qr') || lower.includes('mã qr');
      const isBarcode = lower.includes('barcode') || lower.includes('mã vạch') || lower.includes('vận đơn');

      const key = h.toLowerCase().replace(/[^a-z0-9]/gi, '_');
      if (newFields.some(f => f.key === key)) return;

      newFields.push({
        id: `auto_${Date.now()}_${idx}`,
        key,
        label: h,
        type: isQr ? 'qr' : isBarcode ? 'barcode' : 'text',
        visible: true,
        x: 100,
        y: currentY,
        fontSize: 16,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        qrSize: 100,
        barcodeFormat: 'CODE128'
      });
      currentY = (currentY + 45) % (stageHeight - 80);
    });

    setFields(newFields);
    showToast(`Đã đồng bộ các trường theo file Excel!`);
  };

  // Lưu dự án (.pbproject)
  const handleSaveProject = () => {
    const projectData: ProjectData = {
      version: '2.0',
      title: templateInfo.name || 'Dự án in biểu mẫu',
      createdAt: new Date().toISOString(),
      templateDataUrl,
      stageWidth,
      stageHeight,
      paperSizeName: 'Custom',
      templateInfo,
      fields,
      records
    };
    exportProjectFile(projectData);
    showToast('Đã lưu file dự án (.pbproject) thành công!');
  };

  // Mở dự án (.pbproject)
  const handleLoadProject = async (file: File) => {
    try {
      setIsLoadingFile(true);
      const data = await importProjectFile(file);
      pushHistory();
      setTemplateDataUrl(data.templateDataUrl);
      setStageWidth(data.stageWidth);
      setStageHeight(data.stageHeight);
      setFields(data.fields);
      setRecords(data.records || []);
      if (data.templateInfo) setTemplateInfo(data.templateInfo);
      setSelectedFieldId(data.fields[0]?.id || null);
      setPreviewIndex(0);
      showToast(`Đã tải dự án "${data.title}" thành công!`);
    } catch (err: any) {
      showToast(err.message || 'Không thể mở file dự án!', 'error');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Xuất file PDF hàng loạt đa trang
  const handleExportBatchPdf = async () => {
    if (records.length === 0) {
      showToast('Danh sách in đang rỗng! Vui lòng thêm dữ liệu trước.', 'error');
      setIsDataModalOpen(true);
      return;
    }

    try {
      setIsExportingPdf(true);
      setExportProgress({ current: 0, total: records.length });

      const pdfBytes = await exportBatchPdf(
        templateDataUrl,
        stageWidth,
        stageHeight,
        fields,
        records,
        (current, total) => setExportProgress({ current, total }),
        templateInfo.printBackground
      );

      // Tải về file PDF
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PrintBatch_In_Hang_Loat_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Bắn pháo hoa ăn mừng hoàn thành xuất sắc
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast(`Xuất thành công file PDF với ${records.length} trang in (${templateInfo.printBackground ? 'kèm phôi' : 'chỉ nội dung điền'})!`);
    } catch (err: any) {
      console.error(err);
      showToast('Có lỗi xảy ra khi tạo file PDF hàng loạt.', 'error');
    } finally {
      setIsExportingPdf(false);
      setExportProgress(null);
    }
  };

  // In trực tiếp bằng trình duyệt
  const handleExecutePrint = () => {
    if (records.length === 0) {
      showToast('Danh sách in đang rỗng!', 'error');
      setIsDataModalOpen(true);
      return;
    }

    showToast('Đang khởi động hộp thoại in của trình duyệt...');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Tự động nhận diện chữ từ phôi và chuyển thành các trường văn bản chỉnh sửa được
  const handleAutoDetectText = async () => {
    if (!templateDataUrl) {
      showToast('Chưa có phôi mẫu để nhận diện!', 'error');
      return;
    }

    try {
      setIsDetectingText(true);
      setDetectProgress({ percent: 20, status: 'Đang trích xuất cấu trúc văn bản từ phôi mẫu...' });

      let detected: FieldConfig[] = [];

      if (activePdfFile) {
        // Nhận diện từ file PDF với PDF.js (chính xác tuyệt đối)
        detected = await extractTextFieldsFromPdf(
          activePdfFile,
          templateInfo.currentPage || 1,
          stageWidth,
          stageHeight
        );
      } else {
        // Nhận diện từ ảnh bằng Tesseract OCR
        detected = await extractTextFieldsFromImage(
          templateDataUrl,
          stageWidth,
          stageHeight,
          (percent, status) => setDetectProgress({ percent, status })
        );
      }

      if (detected.length === 0) {
        showToast('Không tìm thấy văn bản rõ ràng nào trên phôi!', 'info');
        return;
      }

      pushHistory();
      setFields(detected);
      setSelectedFieldId(detected[0]?.id || null);

      // Tự động hạ độ mờ phôi nền để các trường chữ hiển thị nổi bật dễ chỉnh sửa
      setTemplateInfo(prev => ({ ...prev, opacity: 0.35 }));

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });

      showToast(`Đã nhận diện thành công ${detected.length} trường văn bản! Bạn có thể nhấp vào từng chữ để chỉnh sửa trực tiếp.`);
    } catch (err: any) {
      console.error(err);
      showToast('Có lỗi xảy ra khi nhận diện văn bản trên mẫu.', 'error');
    } finally {
      setIsDetectingText(false);
      setDetectProgress(null);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;
  const currentRecord = records[previewIndex] || {};
  const availableColumns = Array.from(new Set(records.flatMap(r => Object.keys(r)))).filter(Boolean);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* 1. Header chính của ứng dụng */}
      <Header
        recordCount={records.length}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        isExportingPdf={isExportingPdf}
        exportProgress={exportProgress}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onUploadTemplate={handleUploadTemplate}
        onSelectPreset={handleSelectPreset}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onExportBatchPdf={handleExportBatchPdf}
        onExecutePrint={handleExecutePrint}
      />

      {/* 2. Không gian làm việc 3 cột: Trường dữ liệu -> Canvas trực quan -> Bảng thuộc tính */}
      <div id="app-ui" className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <FieldsSidebar
          fields={fields}
          selectedFieldId={selectedFieldId}
          records={records}
          previewIndex={previewIndex}
          onSelectField={setSelectedFieldId}
          onToggleFieldVisibility={handleToggleFieldVisibility}
          onDeleteField={handleDeleteField}
          onAddField={handleAddField}
          onPrevRecord={() => setPreviewIndex(prev => (prev - 1 + records.length) % Math.max(1, records.length))}
          onNextRecord={() => setPreviewIndex(prev => (prev + 1) % Math.max(1, records.length))}
          onSetPreviewIndex={setPreviewIndex}
        />

        <CanvasArea
          templateDataUrl={templateDataUrl}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
          fields={fields}
          selectedFieldId={selectedFieldId}
          currentRecord={currentRecord}
          templateInfo={templateInfo}
          availableColumns={availableColumns}
          onSelectField={setSelectedFieldId}
          onUpdateFieldPosition={handleUpdateFieldPosition}
          onUploadTemplate={handleUploadTemplate}
          onLoadProject={handleLoadProject}
          onAddFieldAtPosition={handleAddFieldAtPosition}
          onChangePdfPage={handleChangePdfPage}
          onUpdateTemplateInfo={(updates) => setTemplateInfo(prev => ({ ...prev, ...updates }))}
          onUpdateStageDimensions={handleUpdateStageDimensions}
          onAutoDetectText={handleAutoDetectText}
          isDetectingText={isDetectingText}
        />

        <InspectorSidebar
          selectedField={selectedField}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
          templateInfo={templateInfo}
          onUpdateField={handleUpdateField}
          onCenterHorizontally={handleCenterHorizontally}
          onUpdateTemplateInfo={(updates) => setTemplateInfo(prev => ({ ...prev, ...updates }))}
          onUpdateStageDimensions={handleUpdateStageDimensions}
          onAutoDetectText={handleAutoDetectText}
          isDetectingText={isDetectingText}
        />
      </div>

      {/* 3. Modal Quản Lý Bảng Dữ Liệu Excel / CSV */}
      <DataModal
        isOpen={isDataModalOpen}
        fields={fields}
        records={records}
        onClose={() => setIsDataModalOpen(false)}
        onUpdateRecords={setRecords}
        onAutoCreateFieldsFromHeaders={handleAutoCreateFieldsFromHeaders}
      />

      {/* 4. Vùng in cho lệnh window.print() (@media print) */}
      <PrintContainer
        templateDataUrl={templateDataUrl}
        stageWidth={stageWidth}
        stageHeight={stageHeight}
        fields={fields}
        records={records}
        printBackground={templateInfo.printBackground}
      />

      {/* 5. Overlay Loading khi quét OCR hoặc xử lý file nặng */}
      {(isLoadingFile || isDetectingText) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-100">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 max-w-sm text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <h4 className="font-bold text-slate-900 text-sm">
              {isDetectingText ? 'Đang nhận diện chữ trên phôi...' : 'Đang xử lý dữ liệu biểu mẫu...'}
            </h4>
            {detectProgress && (
              <div className="w-full space-y-1.5 mt-1">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-200"
                    style={{ width: `${detectProgress.percent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{detectProgress.status}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 z-50 text-white animate-in slide-in-from-bottom-5 duration-200 ${
          toast.type === 'error' ? 'bg-rose-600' :
          toast.type === 'info' ? 'bg-indigo-600' :
          'bg-slate-900'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-200" /> :
           toast.type === 'info' ? <Info className="w-4 h-4 text-indigo-200" /> :
           <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
