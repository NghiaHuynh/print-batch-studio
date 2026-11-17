import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  CheckCircle2, 
  FileCheck, 
  Sparkles, 
  Building2, 
  Shield, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { LEGAL_STANDARDS, LegalStandardType } from '../services/legalFormatService';
import { PRESET_TEMPLATES } from '../services/templatePresets';
import { PresetTemplate } from '../types';

interface LegalStandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStandard: (standard: LegalStandardType) => void;
  onSelectPreset: (preset: PresetTemplate) => void;
}

export const LegalStandardModal: React.FC<LegalStandardModalProps> = ({
  isOpen,
  onClose,
  onApplyStandard,
  onSelectPreset
}) => {
  const [activeTab, setActiveTab] = useState<LegalStandardType>('nd30');

  if (!isOpen) return null;

  const currentStandard = LEGAL_STANDARDS[activeTab];

  // Tìm preset tương ứng
  const getPresetForStandard = (type: LegalStandardType): PresetTemplate | undefined => {
    switch (type) {
      case 'nd30':
        return PRESET_TEMPLATES.find(p => p.id === 'invitation-nd30');
      case 'tt68':
        return PRESET_TEMPLATES.find(p => p.id === 'invitation-tt68-bqp');
      case 'hd05':
        return PRESET_TEMPLATES.find(p => p.id === 'invitation-hd05-dang');
    }
  };

  const correspondingPreset = getPresetForStandard(activeTab);

  const handleApplyPreset = () => {
    if (correspondingPreset) {
      onSelectPreset(correspondingPreset);
      onClose();
    }
  };

  const handleApplyStandardOnly = () => {
    onApplyStandard(activeTab);
    onClose();
  };

  const tabs: { id: LegalStandardType; label: string; icon: any; badge: string; color: string }[] = [
    {
      id: 'nd30',
      label: 'Nghị định 30/2020/NĐ-CP',
      icon: Building2,
      badge: 'Chính quyền & Cơ quan NN',
      color: 'blue'
    },
    {
      id: 'tt68',
      label: 'Thông tư 68/2020/TT-BQP',
      icon: Shield,
      badge: 'Quân đội nhân dân',
      color: 'emerald'
    },
    {
      id: 'hd05',
      label: 'Hướng dẫn 05 & 36-HD/VPTW',
      icon: BookOpen,
      badge: 'Cơ quan Đảng Cộng sản',
      color: 'red'
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Chuẩn Hóa Thể Thức Văn Bản Pháp Quy</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Chuẩn Quốc Gia
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tuân thủ nghiêm ngặt quy định về font chữ, cỡ chữ, bố cục, tiêu ngữ và số hiệu văn bản
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab điều hướng 3 chuẩn */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-200 bg-slate-50 p-2 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition relative ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? tab.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      tab.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{tab.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">{tab.badge}</div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Nội dung chi tiết chuẩn thể thức */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Căn cứ pháp lý & Phạm vi áp dụng */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Căn cứ pháp lý:</span>
                  <span className="text-slate-600 font-normal">{currentStandard.lawDoc}</span>
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-700">Phạm vi áp dụng: </span>
                  {currentStandard.scope}
                </div>
                <div className="text-slate-600 flex items-center gap-2 pt-1">
                  <span className="font-semibold text-slate-700">Phông chữ bắt buộc:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700 font-semibold">
                    Times New Roman (Unicode TCVN 6909:2001)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist quy cách thể thức chi tiết */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Quy chuẩn thành phần thể thức theo luật định
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. Tên cơ quan */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">1</span>
                  Tên cơ quan, tổ chức ban hành
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {currentStandard.rules.agency}
                </p>
              </div>

              {/* 2. Quốc hiệu & Tiêu ngữ */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">2</span>
                  Quốc hiệu & Tiêu ngữ (hoặc Tiêu đề Đảng)
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {currentStandard.rules.nationalMotto}
                </p>
              </div>

              {/* 3. Số ký hiệu */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">3</span>
                  Số, ký hiệu văn bản
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {currentStandard.rules.docNumber}
                </p>
              </div>

              {/* 4. Địa danh ngày tháng */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">4</span>
                  Địa danh và thời gian ban hành
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {currentStandard.rules.date}
                </p>
              </div>

              {/* 5. Tên loại văn bản & Trích yếu */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">5</span>
                  Tên loại văn bản & Trích yếu nội dung
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {currentStandard.rules.docTitle}
                </p>
              </div>

              {/* 6. Kính gửi / Khách mời */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">6</span>
                  Kính gửi & Tên khách mời
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {currentStandard.rules.greeting}
                </p>
              </div>

              {/* 7. Chức vụ, chữ ký & con dấu */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">7</span>
                  Chức vụ, họ tên người ký & Con dấu đỏ
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {currentStandard.rules.signer}
                </p>
              </div>

              {/* 8. Nơi nhận văn bản */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">8</span>
                  Nơi nhận & Phân phối văn bản
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {currentStandard.rules.recipient}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>Đang chọn: </span>
            <strong className="text-slate-800">{currentStandard.name}</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Nút 1: Áp dụng chuẩn hóa cho phôi hiện tại */}
            <button
              onClick={handleApplyStandardOnly}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
              title="Giữ nguyên vị trí các trường hiện tại, chỉ đồng bộ font Times New Roman, cỡ chữ và tiền tố số hiệu"
            >
              <FileCheck className="w-4 h-4 text-slate-600" />
              <span>Chuẩn hóa phôi đang sửa</span>
            </button>

            {/* Nút 2: Nạp sẵn Biểu Mẫu Chuẩn Vector 100% */}
            {correspondingPreset && (
              <button
                onClick={handleApplyPreset}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 transition"
                title="Mở toàn bộ bố cục biểu mẫu thiết kế chuẩn sẵn bao gồm đường chỉ kẻ, con dấu đỏ và tỷ lệ chuẩn A5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Nạp Biểu Mẫu Chuẩn ({correspondingPreset.name})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
