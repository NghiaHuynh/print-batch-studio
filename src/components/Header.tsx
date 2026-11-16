import React, { useRef, useState } from 'react';
import { 
  Printer, 
  Upload, 
  FileSpreadsheet, 
  FileDown, 
  Save, 
  FolderOpen, 
  LayoutTemplate, 
  Undo2, 
  Redo2, 
  Sparkles,
  ChevronDown,
  Scale
} from 'lucide-react';
import { PRESET_TEMPLATES } from '../services/templatePresets';
import { PresetTemplate } from '../types';

interface HeaderProps {
  recordCount: number;
  canUndo: boolean;
  canRedo: boolean;
  isExportingPdf: boolean;
  exportProgress: { current: number; total: number } | null;
  onUndo: () => void;
  onRedo: () => void;
  onOpenDataModal: () => void;
  onOpenLegalModal: () => void;
  onUploadTemplate: (file: File) => void;
  onSelectPreset: (preset: PresetTemplate) => void;
  onSaveProject: () => void;
  onLoadProject: (file: File) => void;
  onExportBatchPdf: () => void;
  onExecutePrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  recordCount,
  canUndo,
  canRedo,
  isExportingPdf,
  exportProgress,
  onUndo,
  onRedo,
  onOpenDataModal,
  onOpenLegalModal,
  onUploadTemplate,
  onSelectPreset,
  onSaveProject,
  onLoadProject,
  onExportBatchPdf,
  onExecutePrint
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const fileTemplateInputRef = useRef<HTMLInputElement>(null);
  const fileProjectInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadTemplate(file);
      e.target.value = '';
    }
  };

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadProject(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-xs relative">
      {/* Khối bên trái: Logo + App Name + Undo/Redo */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 text-white p-2 rounded-xl shadow-sm flex items-center justify-center">
          <Printer className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">PrintBatch Studio Pro</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">v2.0 PRO</span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">Thiết kế kéo thả & In ấn dữ liệu hàng loạt tự động</p>
        </div>

        {/* Lịch sử Undo / Redo */}
        <div className="hidden md:flex items-center border-l border-slate-200 pl-3 ml-2 gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl+Z)"
            className={`p-1.5 rounded-lg border transition ${canUndo ? 'text-slate-700 hover:bg-slate-100 border-slate-200' : 'text-slate-300 border-transparent cursor-not-allowed'}`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Làm lại (Ctrl+Y)"
            className={`p-1.5 rounded-lg border transition ${canRedo ? 'text-slate-700 hover:bg-slate-100 border-slate-200' : 'text-slate-300 border-transparent cursor-not-allowed'}`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Khối giữa: Chuẩn Thể Thức & Mẫu có sẵn */}
      <div className="flex items-center gap-2">
        {/* Nút Chuẩn Hóa Thể Thức Pháp Quy */}
        <button
          onClick={onOpenLegalModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200/80 shadow-2xs transition"
          title="Chuẩn hóa theo Nghị định 30, Thông tư 68 Quân đội, Hướng dẫn 05 Đảng"
        >
          <Scale className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Chuẩn Thể Thức (NĐ 30, TT 68, HD 05)</span>
          <span className="sm:hidden">Chuẩn Thể Thức</span>
        </button>

        {/* Dropdown Mẫu thiết kế sẵn */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Mẫu có sẵn</span>
            <span className="sm:hidden">Mẫu</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPresetsMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPresetsMenu(false)}></div>
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto">
                {/* Nhóm 1: Văn bản Pháp quy */}
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    Chuẩn Thể Thức Pháp Quy
                  </span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">NĐ 30 / TT 68 / HD 05</span>
                </div>
                {PRESET_TEMPLATES.filter(p => ['invitation-nd30', 'invitation-tt68-bqp', 'invitation-hd05-dang', 'invitation-daidoanket'].includes(p.id)).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setShowPresetsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-700 transition flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      {preset.name}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</span>
                  </button>
                ))}

                {/* Nhóm 2: Sự kiện & Thương mại */}
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Biểu Mẫu Sự Kiện & Doanh Nghiệp
                  </span>
                </div>
                {PRESET_TEMPLATES.filter(p => !['invitation-nd30', 'invitation-tt68-bqp', 'invitation-hd05-dang', 'invitation-daidoanket'].includes(p.id)).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setShowPresetsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 text-slate-700 hover:text-blue-700 transition flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {preset.name}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Khối bên phải: Các nút hành động chính */}
      <div className="flex items-center gap-2">
        {/* Tải phôi */}
        <button
          onClick={() => fileTemplateInputRef.current?.click()}
          className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-slate-200"
          title="Tải ảnh PNG, JPG hoặc file PDF"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">Tải phôi (Ảnh/PDF)</span>
          <span className="md:hidden">Phôi</span>
        </button>
        <input
          ref={fileTemplateInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, application/pdf"
          className="hidden"
          onChange={handleTemplateFileChange}
        />

        {/* Quản lý dự án (Lưu / Mở) */}
        <div className="hidden lg:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
          <button
            onClick={onSaveProject}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-blue-600 rounded-md text-xs font-medium flex items-center gap-1 transition"
            title="Lưu dự án hiện tại ra file .pbproject"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu</span>
          </button>
          <button
            onClick={() => fileProjectInputRef.current?.click()}
            className="p-1.5 hover:bg-white text-slate-600 hover:text-blue-600 rounded-md text-xs font-medium flex items-center gap-1 transition"
            title="Mở file dự án .pbproject đã lưu"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Mở</span>
          </button>
          <input
            ref={fileProjectInputRef}
            type="file"
            accept=".pbproject, application/json"
            className="hidden"
            onChange={handleProjectFileChange}
          />
        </div>

        {/* Nút mở Modal danh sách Excel */}
        <button
          onClick={onOpenDataModal}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition relative"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Danh sách in</span>
          <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {recordCount}
          </span>
        </button>

        {/* Xuất file PDF đa trang hàng loạt */}
        <button
          onClick={onExportBatchPdf}
          disabled={isExportingPdf || recordCount === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          title="Xuất toàn bộ bản ghi ra 1 file PDF chất lượng cao 300 DPI"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Xuất File PDF</span>
          <span className="xl:hidden">PDF</span>
        </button>

        {/* In trực tiếp qua trình duyệt */}
        <button
          onClick={onExecutePrint}
          disabled={recordCount === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          title="In ngay qua máy in hoặc hộp thoại in trình duyệt"
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">In Hàng Loạt</span>
          <span className="sm:hidden">In</span>
        </button>
      </div>

      {/* Thanh tiến độ xuất PDF */}
      {isExportingPdf && exportProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-150"
            style={{ width: `${Math.round((exportProgress.current / exportProgress.total) * 100)}%` }}
          />
        </div>
      )}
    </header>
  );
};
