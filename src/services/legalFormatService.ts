import { FieldConfig } from '../types';

export type LegalStandardType = 'nd30' | 'tt68' | 'hd05';

export interface LegalStandardInfo {
  id: LegalStandardType;
  name: string;
  shortName: string;
  badge: string;
  lawDoc: string;
  scope: string;
  fontFamily: string;
  rules: {
    agency: string;
    nationalMotto: string;
    docNumber: string;
    date: string;
    docTitle: string;
    greeting: string;
    body: string;
    signer: string;
    recipient: string;
    separatorLines: string;
  };
}

export const LEGAL_STANDARDS: Record<LegalStandardType, LegalStandardInfo> = {
  nd30: {
    id: 'nd30',
    name: 'Nghị định 30/2020/NĐ-CP',
    shortName: 'Nghị định 30 (Chính quyền)',
    badge: 'Hành chính Nhà nước',
    lawDoc: 'Nghị định số 30/2020/NĐ-CP ngày 05/03/2020 của Chính phủ về công tác văn thư',
    scope: 'Các cơ quan hành chính nhà nước, doanh nghiệp nhà nước, tổ chức chính trị - xã hội',
    fontFamily: "'Times New Roman', Times, serif",
    rules: {
      agency: 'Cơ quan cấp trên: chữ in hoa, đứng, cỡ 11-12. Cơ quan ban hành: in hoa, đứng, đậm, cỡ 12-13. Có đường kẻ ngang dưới bằng 1/3 đến 1/2 độ dài dòng chữ.',
      nationalMotto: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM (in hoa, đậm, cỡ 12-13). Độc lập - Tự do - Hạnh phúc (chữ thường, đậm, cỡ 13-14, có gạch nối kèm dấu cách). Phía dưới có đường kẻ ngang nét liền bằng độ dài dòng chữ.',
      docNumber: 'Ghi: "Số: .../GM-UBND", chữ thường, cỡ 12-13, đứng.',
      date: 'Ghi: "... ngày ... tháng ... năm ...", chữ thường, in nghiêng, cỡ 13-14.',
      docTitle: 'Tên loại văn bản: "GIẤY MỜI" (in hoa, đậm, cỡ 14-16, canh giữa). Trích yếu: chữ thường, đứng, đậm, cỡ 13-14.',
      greeting: 'Ghi: "Kính gửi: ...", chữ thường, đậm, cỡ 13-14.',
      body: 'Chữ thường, cỡ 13-14, đứng, giãn dòng tối thiểu 1.0 - 1.5 lines.',
      signer: 'Chức vụ: in hoa, đậm, cỡ 13-14. Họ và tên người ký: in hoa hoặc in thường, đậm, cỡ 13-14.',
      recipient: 'Từ "Nơi nhận": in nghiêng, đậm, cỡ 12. Danh sách nơi nhận: chữ thường, cỡ 10-11.',
      separatorLines: 'Dưới Tiêu ngữ: kẻ liền 100% độ dài. Dưới Cơ quan: kẻ liền 1/3-1/2 độ dài.'
    }
  },
  tt68: {
    id: 'tt68',
    name: 'Thông tư 68/2020/TT-BQP',
    shortName: 'Thông tư 68 (Quân đội)',
    badge: 'Bộ Quốc phòng',
    lawDoc: 'Thông tư số 68/2020/TT-BQP ngày 21/05/2020 của Bộ Quốc phòng quy định công tác văn thư',
    scope: 'Các đơn vị quân đội, Ban chỉ huy quân sự, cơ quan thuộc Bộ Quốc phòng',
    fontFamily: "'Times New Roman', Times, serif",
    rules: {
      agency: 'Cấp trên: BỘ CHỈ HUY QUÂN SỰ TỈNH... Cơ quan ban hành: BAN CHỈ HUY QUÂN SỰ HUYỆN/XÃ (in hoa, đứng, đậm, cỡ 12-13).',
      nationalMotto: 'Quốc hiệu & Tiêu ngữ chuẩn Quốc gia theo quy định của Nhà nước.',
      docNumber: 'Số ký hiệu quân sự: "Số: .../GM-BCH" hoặc "Số: .../TM-BCHQS", cỡ 12-13.',
      date: 'Địa danh ngày tháng: in nghiêng, cỡ 13-14.',
      docTitle: 'Ghi: "GIẤY MỜI" hoặc "THƯ MỜI" (in hoa, đậm, cỡ 14-16, canh giữa).',
      greeting: 'Ghi: "Kính gửi: Đồng chí...", đậm, cỡ 13-14.',
      body: 'Chữ thường, cỡ 13-14, đứng, chuẩn mực tác phong quân sự.',
      signer: 'Chức danh: CHỈ HUY TRƯỞNG / CHÍNH TRỊ VIÊN (in hoa, đậm, cỡ 13-14). Cấp bậc quân hàm & họ tên: Thượng tá, Trung tá...',
      recipient: 'Nơi nhận quân sự: Thủ trưởng cấp trên (để b/c), các đơn vị phối thuộc, Lưu: VT, Ban TM.',
      separatorLines: 'Kẻ chỉ dưới Quốc hiệu và Cơ quan quân sự theo đúng chuẩn thể thức quốc phòng.'
    }
  },
  hd05: {
    id: 'hd05',
    name: 'Hướng dẫn 05-HD/VPTW',
    shortName: 'Hướng dẫn 05 (Cơ quan Đảng)',
    badge: 'Văn bản của Đảng',
    lawDoc: 'Hướng dẫn số 05-HD/VPTW và Hướng dẫn số 36-HD/VPTW của Văn phòng Trung ương Đảng về thể thức văn bản',
    scope: 'Các cấp ủy Đảng, Tỉnh ủy, Huyện ủy, Đảng ủy xã, Chi bộ cơ sở',
    fontFamily: "'Times New Roman', Times, serif",
    rules: {
      agency: 'Góc trên bên trái: HUYỆN ỦY... (in hoa, đứng). ĐẢNG ỦY XÃ / CHI BỘ... (in hoa, đậm, cỡ 12-13). Có đường kẻ ngang 1/3-1/2.',
      nationalMotto: 'GÓC TRÊN BÊN PHẢI: "ĐẢNG CỘNG SẢN VIỆT NAM" (in hoa, đậm, cỡ 13-14). Dưới có 3 dấu sao "* * *" (Không dùng Quốc hiệu Nhà nước trong văn bản nội bộ Đảng).',
      docNumber: 'Ghi: "Số 01-GM/CB" hoặc "Số 05-GM/ĐU" (DÙNG DẤU GẠCH NỐI "-GM/", KHÔNG DÙNG DẤU GẠCH CHÉO "/").',
      date: 'Địa danh ngày tháng: in nghiêng, cỡ 13-14.',
      docTitle: 'Ghi: "GIẤY MỜI" (in hoa, đậm, cỡ 14-16, canh giữa). Trích yếu: Về việc dự Đại hội Chi bộ / Sinh hoạt Chi bộ.',
      greeting: 'Ghi: "Kính gửi: Đồng chí...", đậm, cỡ 13-14.',
      body: 'Chữ thường, cỡ 13-14, đứng, chuẩn mực thể thức văn kiện Đảng.',
      signer: 'Ghi: "T/M CHI BỘ / BÍ THƯ" hoặc "T/M ĐẢNG BỘ / BÍ THƯ" (in hoa, đậm, cỡ 13-14).',
      recipient: 'Nơi nhận Đảng: Ban Thường vụ Đảng ủy (để b/c), các đồng chí Đảng viên, Lưu Chi ủy.',
      separatorLines: 'Kẻ chỉ dưới tên Cấp ủy; dưới dòng ĐẢNG CỘNG SẢN VIỆT NAM có 3 ngôi sao * * *.'
    }
  }
};

// Hàm chuẩn hóa toàn bộ các trường theo chuẩn thể thức đã chọn
export function standardizeFieldsToLegal(fields: FieldConfig[], standard: LegalStandardType): FieldConfig[] {
  const stdInfo = LEGAL_STANDARDS[standard];
  const font = stdInfo.fontFamily;

  return fields.map(field => {
    const updated: FieldConfig = {
      ...field,
      fontFamily: font // Bắt buộc 100% font chuẩn Times New Roman
    };

    const keyLower = (field.key || '').toLowerCase();
    const labelLower = (field.label || '').toLowerCase();
    const defaultLower = (field.defaultValue || '').toLowerCase();

    // 1. Quốc hiệu & Tiêu ngữ hoặc Tiêu đề Đảng
    if (keyLower.includes('motto') || labelLower.includes('quốc hiệu') || defaultLower.includes('cộng hòa') || defaultLower.includes('đảng cộng sản')) {
      if (standard === 'hd05') {
        updated.defaultValue = 'ĐẢNG CỘNG SẢN VIỆT NAM\n* * *';
        updated.fontSize = 13.5;
        updated.fontWeight = '700';
        updated.align = 'center';
      } else {
        updated.defaultValue = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc';
        updated.fontSize = 12.5;
        updated.fontWeight = '700';
        updated.align = 'center';
      }
      return updated;
    }

    // 2. Cơ quan ban hành
    if (keyLower.includes('agency') || keyLower.includes('org') || labelLower.includes('cơ quan')) {
      updated.fontSize = 12;
      updated.fontWeight = '700';
      updated.align = 'center';
      return updated;
    }

    // 3. Số ký hiệu văn bản
    if (keyLower.includes('no') || keyLower.includes('letter') || labelLower.includes('số')) {
      updated.fontSize = 12.5;
      updated.fontWeight = '600';
      if (standard === 'hd05') {
        // Chuẩn thể thức Đảng: Số 01-GM/CB
        updated.prefix = 'Số: ';
        if (updated.defaultValue && updated.defaultValue.includes('/')) {
          updated.defaultValue = updated.defaultValue.replace(/\//g, '-');
        }
      } else if (standard === 'tt68') {
        // Chuẩn quân sự: Số: 01/GM-BCH
        updated.prefix = 'Số: ';
      } else {
        // Chuẩn NĐ 30: Số: 01/GM-UBND
        updated.prefix = 'Số: ';
      }
      return updated;
    }

    // 4. Ngày tháng ban hành
    if (keyLower.includes('date') || labelLower.includes('ngày tháng') || defaultLower.includes('ngày')) {
      updated.fontSize = 13;
      updated.fontStyle = 'italic';
      updated.fontWeight = '400';
      return updated;
    }

    // 5. Tiêu đề văn bản (GIẤY MỜI / THƯ MỜI)
    if (keyLower.includes('heading') || keyLower.includes('invite') || labelLower.includes('tiêu đề') || defaultLower === 'giấy mời' || defaultLower === 'thư mời') {
      updated.fontSize = 16;
      updated.fontWeight = '700';
      updated.color = '#b91c1c';
      updated.align = 'center';
      return updated;
    }

    // 6. Trích yếu nội dung
    if (keyLower.includes('intro') || labelLower.includes('trích yếu') || defaultLower.startsWith('về việc')) {
      updated.fontSize = 13;
      updated.fontWeight = '600';
      updated.align = 'center';
      return updated;
    }

    // 7. Kính gửi / Tên khách mời
    if (keyLower.includes('name') || labelLower.includes('ông (bà)') || labelLower.includes('tên')) {
      updated.fontSize = 13.5;
      updated.fontWeight = '700';
      if (standard === 'hd05' || standard === 'tt68') {
        if (!updated.prefix || updated.prefix.includes('Ông')) {
          updated.prefix = '- Kính gửi đồng chí: ';
        }
      } else {
        if (!updated.prefix) {
          updated.prefix = '- Ông (bà): ';
        }
      }
      return updated;
    }

    // 8. Chức vụ / Người ký
    if (keyLower.includes('sign') || labelLower.includes('ký') || labelLower.includes('chức vụ') || labelLower.includes('bí thư') || labelLower.includes('chủ tịch')) {
      updated.fontSize = 13;
      updated.fontWeight = '700';
      updated.align = 'center';
      return updated;
    }

    // 9. Nơi nhận
    if (keyLower.includes('recipient') || labelLower.includes('nơi nhận')) {
      updated.fontSize = 11;
      updated.fontWeight = '400';
      updated.align = 'left';
      return updated;
    }

    // Mặc định nội dung thân bài chuẩn NĐ 30: cỡ 13, thường
    if (updated.fontSize > 16) {
      updated.fontSize = 15;
    } else if (updated.fontSize < 10) {
      updated.fontSize = 11;
    }

    return updated;
  });
}
