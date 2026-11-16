import { PresetTemplate } from '../types';

// Tạo phôi giấy trắng sạch sẽ thay thế ảnh gốc sau khi chuyển thành text
export function createCleanPaperBackground(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(800, width * 2);
  canvas.height = Math.max(600, height * 2);
  const ctx = canvas.getContext('2d')!;

  // Nền giấy trắng ngà sạch đẹp
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Viền bo tinh tế
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  return canvas.toDataURL('image/png');
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'invitation-vip',
    name: 'Thiệp Mời Hội Nghị / Khách VIP',
    category: 'invitation',
    description: 'Thiết kế sang trọng phong cách Hoàng Gia với viền kép vàng ánh kim, phù hợp hội thảo & tiệc tri ân.',
    width: 840,
    height: 560,
    fields: [
      {
        id: 'f-name',
        key: 'name',
        label: 'Họ và Tên',
        type: 'text',
        visible: true,
        x: 270,
        y: 240,
        fontSize: 22,
        fontFamily: "'Playfair Display', serif",
        fontWeight: '700',
        color: '#1e3a8a',
        align: 'left',
        prefix: 'Kính gửi: '
      },
      {
        id: 'f-title',
        key: 'title',
        label: 'Chức Vụ / Đơn Vị',
        type: 'text',
        visible: true,
        x: 270,
        y: 285,
        fontSize: 15,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '500',
        color: '#475569',
        align: 'left'
      },
      {
        id: 'f-seat',
        key: 'seat',
        label: 'Vị Trí Bàn / Ghế',
        type: 'text',
        visible: true,
        x: 270,
        y: 330,
        fontSize: 15,
        fontFamily: "'Space Mono', monospace",
        fontWeight: '700',
        color: '#b45309',
        align: 'left',
        prefix: 'Số ghế VIP: '
      },
      {
        id: 'f-qr',
        key: 'qr_code',
        label: 'Mã QR Check-in',
        type: 'qr',
        visible: true,
        x: 680,
        y: 390,
        width: 100,
        height: 100,
        qrSize: 100,
        fontSize: 12,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '400',
        color: '#000000',
        align: 'center'
      }
    ],
    defaultRecords: [
      { name: 'Nguyễn Văn An', title: 'Tổng Giám Đốc - Tập Đoàn Alpha', seat: 'VIP-A01', qr_code: 'CHECKIN-VIP-A01-NGUYEN-VAN-AN' },
      { name: 'Trần Thị Bích Ngọc', title: 'Giám Đốc Chiến Lược - Công ty Beta', seat: 'VIP-A02', qr_code: 'CHECKIN-VIP-A02-TRAN-THI-BICH-NGOC' },
      { name: 'Lê Hoàng Minh Quân', title: 'Chuyên gia Cố vấn Cao cấp', seat: 'VIP-B05', qr_code: 'CHECKIN-VIP-B05-LE-HOANG-MINH-QUAN' }
    ],
    generateBackground: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1680;
      canvas.height = 1120;
      const ctx = canvas.getContext('2d')!;

      // Nền kem sang trọng
      ctx.fillStyle = '#fffdf9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Khung viền kép
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 12;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

      // Họa tiết góc
      const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + dirY * 40);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dirX * 40, y);
        ctx.stroke();
      };
      drawCorner(90, 90, 1, 1);
      drawCorner(canvas.width - 90, 90, -1, 1);
      drawCorner(90, canvas.height - 90, 1, -1);
      drawCorner(canvas.width - 90, canvas.height - 90, -1, -1);

      // Tiêu đề
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 54px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('THƯ MỜI THAM DỰ HỘI NGHỊ THƯỢNG ĐỈNH', canvas.width / 2, 220);

      ctx.fillStyle = '#d97706';
      ctx.font = 'italic 28px Georgia, serif';
      ctx.fillText('Trân trọng kính mời Quý Khách hàng & Quý Đối tác chiến lược', canvas.width / 2, 280);

      // Dòng chỉ dẫn trường
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText('Đại diện:', 240, 505);
      ctx.fillText('Chức vụ:', 240, 595);
      ctx.fillText('Vị trí bàn:', 240, 685);

      // Dòng chấm kẻ
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      [515, 605, 695].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(520, y);
        ctx.lineTo(1300, y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Khung quét QR
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width - 360, canvas.height - 360, 220, 220);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Mã QR Check-in', canvas.width - 250, canvas.height - 115);

      // Chân trang
      ctx.fillStyle = '#64748b';
      ctx.font = '24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Thời gian: 08:30 - Ngày 28/11/2026 | Trung tâm Hội nghị Quốc tế GEM Center', canvas.width / 2, 940);
      ctx.fillText('Sự hiện diện của Quý khách là niềm vinh hạnh to lớn của chúng tôi!', canvas.width / 2, 990);

      return canvas.toDataURL('image/png');
    }
  },
  {
    id: 'certificate-honor',
    name: 'Giấy Khen / Chứng Nhận Thành Tích',
    category: 'certificate',
    description: 'Bản chứng nhận chuẩn khổ A4 ngang với họa tiết hoa văn trang trọng và huy hiệu vàng.',
    width: 900,
    height: 636,
    fields: [
      {
        id: 'c-name',
        key: 'name',
        label: 'Họ và Tên Học Viên',
        type: 'text',
        visible: true,
        x: 450,
        y: 285,
        fontSize: 32,
        fontFamily: "'Playfair Display', serif",
        fontWeight: '700',
        color: '#b45309',
        align: 'center'
      },
      {
        id: 'c-course',
        key: 'course',
        label: 'Tên Khóa Học / Cuộc Thi',
        type: 'text',
        visible: true,
        x: 450,
        y: 350,
        fontSize: 18,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '600',
        color: '#1e293b',
        align: 'center',
        prefix: 'Đã xuất sắc hoàn thành chương trình: '
      },
      {
        id: 'c-rank',
        key: 'rank',
        label: 'Xếp Loại Đạt Được',
        type: 'text',
        visible: true,
        x: 450,
        y: 400,
        fontSize: 16,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '700',
        color: '#047857',
        align: 'center',
        prefix: 'Thành tích đạt được: Hạng '
      },
      {
        id: 'c-date',
        key: 'date',
        label: 'Ngày Cấp Chứng Nhận',
        type: 'text',
        visible: true,
        x: 700,
        y: 490,
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '400',
        color: '#475569',
        align: 'center',
        fontStyle: 'italic',
        prefix: 'Hà Nội, ngày '
      },
      {
        id: 'c-code',
        key: 'cert_code',
        label: 'Mã Số Chứng Chỉ',
        type: 'barcode',
        visible: true,
        x: 80,
        y: 520,
        width: 160,
        height: 60,
        fontSize: 12,
        fontFamily: "'Space Mono', monospace",
        fontWeight: '700',
        color: '#000000',
        align: 'center'
      }
    ],
    defaultRecords: [
      { name: 'Vũ Quốc Huy', course: 'Kỹ Năng Lãnh Đạo & Quản Trị Doanh Nghiệp', rank: 'Xuất Sắc (Honor)', date: '20 tháng 11 năm 2026', cert_code: 'CERT-VN-2026-001' },
      { name: 'Đoàn Mai Linh', course: 'Kỹ Năng Lãnh Đạo & Quản Trị Doanh Nghiệp', rank: 'Giỏi (Distinction)', date: '20 tháng 11 năm 2026', cert_code: 'CERT-VN-2026-002' },
      { name: 'Phạm Đức Duy', course: 'Kỹ Năng Lãnh Đạo & Quản Trị Doanh Nghiệp', rank: 'Xuất Sắc (Honor)', date: '20 tháng 11 năm 2026', cert_code: 'CERT-VN-2026-003' }
    ],
    generateBackground: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 1272;
      const ctx = canvas.getContext('2d')!;

      // Nền trắng ngà vân giấy
      ctx.fillStyle = '#fcfbf7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hoa văn viền trang trí cổ điển
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 14;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(84, 84, canvas.width - 168, canvas.height - 168);

      // Huy hiệu vàng giả lập ở trên cùng
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 210, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('★', canvas.width / 2, 222);

      // Tiêu đề
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 64px Georgia, serif';
      ctx.fillText('GIẤY CHỨNG NHẬN', canvas.width / 2, 330);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 380);

      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 26px Georgia, serif';
      ctx.fillText('Ban Tổ Chức trân trọng trao tặng chứng nhận này cho:', canvas.width / 2, 470);

      // Chân trang ký tên
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('CHỦ TỊCH HỘI ĐỒNG', canvas.width - 320, 1050);
      ctx.font = 'italic 22px Arial, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('(Ký tên và đóng dấu)', canvas.width - 320, 1090);

      return canvas.toDataURL('image/png');
    }
  },
  {
    id: 'badge-idcard',
    name: 'Thẻ Đại Biểu / Thẻ Nhân Viên',
    category: 'idcard',
    description: 'Thẻ đeo sự kiện khổ đứng 54x86mm chuẩn thẻ nhựa, tích hợp QR Code bảo mật và barcode.',
    width: 480,
    height: 720,
    fields: [
      {
        id: 'b-name',
        key: 'name',
        label: 'Họ và Tên Đại Biểu',
        type: 'text',
        visible: true,
        x: 240,
        y: 330,
        fontSize: 24,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '800',
        color: '#0f172a',
        align: 'center',
        textTransform: 'uppercase'
      },
      {
        id: 'b-role',
        key: 'role',
        label: 'Chức Vụ / Vị Trí',
        type: 'text',
        visible: true,
        x: 240,
        y: 375,
        fontSize: 16,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '600',
        color: '#2563eb',
        align: 'center'
      },
      {
        id: 'b-org',
        key: 'org',
        label: 'Đơn Vị Công Tác',
        type: 'text',
        visible: true,
        x: 240,
        y: 410,
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '500',
        color: '#64748b',
        align: 'center'
      },
      {
        id: 'b-qr',
        key: 'emp_id',
        label: 'Mã QR Vào Cổng',
        type: 'qr',
        visible: true,
        x: 170,
        y: 480,
        width: 140,
        height: 140,
        qrSize: 140,
        fontSize: 12,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '400',
        color: '#000000',
        align: 'center'
      },
      {
        id: 'b-code-text',
        key: 'emp_id',
        label: 'Mã Thẻ (Hiển thị)',
        type: 'text',
        visible: true,
        x: 240,
        y: 645,
        fontSize: 13,
        fontFamily: "'Space Mono', monospace",
        fontWeight: '700',
        color: '#334155',
        align: 'center',
        prefix: 'ID: '
      }
    ],
    defaultRecords: [
      { name: 'Nguyễn Thành Đạt', role: 'Đại Biểu Chính Thức', org: 'Đoàn Đại Biểu TP. Hà Nội', emp_id: 'DB-2026-8819' },
      { name: 'Trần Hương Giang', role: 'Khách Mời Danh Dự', org: 'Viện Công Nghệ Quốc Gia', emp_id: 'KM-2026-1022' },
      { name: 'Bùi Tuấn Anh', role: 'Ban Tổ Chức (BTC)', org: 'Văn Phòng Ban Tổ Chức', emp_id: 'BTC-2026-0043' }
    ],
    generateBackground: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d')!;

      // Nền trắng
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Gradient xanh lam hiện đại
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 360);
      grad.addColorStop(0, '#1e3a8a');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, 360);

      // Tiêu đề sự kiện
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TECH SUMMIT 2026', canvas.width / 2, 170);

      ctx.fillStyle = '#93c5fd';
      ctx.font = '500 24px Arial, sans-serif';
      ctx.fillText('DIỄN ĐÀN CÔNG NGHỆ & ĐỔI MỚI SÁNG TẠO', canvas.width / 2, 220);

      // Vòng tròn avatar placeholder
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 460, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 70px Arial, sans-serif';
      ctx.fillText('👤', canvas.width / 2, 485);

      // Dải màu nhận diện đáy thẻ
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

      return canvas.toDataURL('image/png');
    }
  },
  {
    id: 'postal-envelope',
    name: 'Phong Bì Thư Gửi Bưu Điện (DL / C5)',
    category: 'envelope',
    description: 'Phong bì gửi tài liệu, hóa đơn hoặc thư mời bưu chính chuẩn kích thước gửi bưu điện.',
    width: 880,
    height: 440,
    fields: [
      {
        id: 'env-sender',
        key: 'sender_info',
        label: 'Thông Tin Người Gửi',
        type: 'text',
        visible: true,
        x: 60,
        y: 60,
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '600',
        color: '#1e3a8a',
        align: 'left'
      },
      {
        id: 'env-rec-name',
        key: 'name',
        label: 'Họ Tên Người Nhận',
        type: 'text',
        visible: true,
        x: 460,
        y: 200,
        fontSize: 22,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '700',
        color: '#0f172a',
        align: 'left',
        prefix: 'Kính gửi: '
      },
      {
        id: 'env-rec-addr',
        key: 'address',
        label: 'Địa Chỉ Người Nhận',
        type: 'text',
        visible: true,
        x: 460,
        y: 250,
        fontSize: 16,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '500',
        color: '#334155',
        align: 'left',
        prefix: 'Địa chỉ: '
      },
      {
        id: 'env-rec-phone',
        key: 'phone',
        label: 'Điện Thoại Người Nhận',
        type: 'text',
        visible: true,
        x: 460,
        y: 300,
        fontSize: 15,
        fontFamily: "'Space Mono', monospace",
        fontWeight: '600',
        color: '#047857',
        align: 'left',
        prefix: 'SĐT: '
      },
      {
        id: 'env-barcode',
        key: 'tracking_code',
        label: 'Mã Vận Đơn Bưu Chính',
        type: 'barcode',
        visible: true,
        x: 460,
        y: 350,
        width: 180,
        height: 50,
        fontSize: 11,
        fontFamily: "'Space Mono', monospace",
        fontWeight: '700',
        color: '#000000',
        align: 'left'
      }
    ],
    defaultRecords: [
      { sender_info: 'CÔNG TY CP CÔNG NGHỆ ALPHA\nSố 45 Tràng Tiền, Hoàn Kiếm, Hà Nội', name: 'Nguyễn Văn Minh', address: 'Số 12B Điện Biên Phủ, P. Đa Kao, Quận 1, TP. HCM', phone: '0912 345 678', tracking_code: 'VNPOST-8819201' },
      { sender_info: 'CÔNG TY CP CÔNG NGHỆ ALPHA\nSố 45 Tràng Tiền, Hoàn Kiếm, Hà Nội', name: 'Lê Thị Thu Cúc', address: 'Tòa nhà Landmark, 209 Xã Đàn, Đống Đa, Hà Nội', phone: '0988 765 432', tracking_code: 'VNPOST-8819202' },
      { sender_info: 'CÔNG TY CP CÔNG NGHỆ ALPHA\nSố 45 Tràng Tiền, Hoàn Kiếm, Hà Nội', name: 'Hoàng Quốc Bảo', address: 'Khu Đô Thị Ecopark, Văn Giang, Hưng Yên', phone: '0903 112 233', tracking_code: 'VNPOST-8819203' }
    ],
    generateBackground: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1760;
      canvas.height = 880;
      const ctx = canvas.getContext('2d')!;

      // Nền phong bì kem nhạt
      ctx.fillStyle = '#faf9f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Viền họa tiết sọc chuyển phát nhanh (Air Mail red & blue stripes) ở cạnh trên và dưới
      const stripeWidth = 40;
      for (let i = 0; i < canvas.width; i += stripeWidth * 2) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + stripeWidth, 0);
        ctx.lineTo(i + stripeWidth - 20, 16);
        ctx.lineTo(i - 20, 16);
        ctx.fill();

        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.moveTo(i + stripeWidth, 0);
        ctx.lineTo(i + stripeWidth * 2, 0);
        ctx.lineTo(i + stripeWidth * 2 - 20, 16);
        ctx.lineTo(i + stripeWidth - 20, 16);
        ctx.fill();
      }

      // Ô dán tem ở góc trên bên phải
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(canvas.width - 240, 60, 180, 220);
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NƠI DÁN TEM', canvas.width - 150, 175);

      // Khung Người gửi (Sender)
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('NGƯỜI GỬI (FROM):', 120, 80);

      // Khung Người nhận (Receiver)
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.fillText('NGƯỜI NHẬN (TO):', 920, 340);

      return canvas.toDataURL('image/png');
    }
  },
  {
    id: 'invitation-daidoanket',
    name: 'Thư Mời Ngày Hội Đại Đoàn Kết Toàn Dân Tộc (Mặt Trận Tổ Quốc)',
    category: 'invitation',
    description: 'Bản số hóa chuẩn thể thức 2 trang A4 gấp đôi (Trang trái: Chương trình 11 bước; Trang phải: Thư mời chuẩn thể thức MTTQ với kích thước chữ và cấu trúc chuẩn 100% theo mẫu gốc).',
    width: 1000,
    height: 720,
    fields: [
      // ================= TRANG TRÁI: CHƯƠNG TRÌNH =================
      {
        id: 'ddk-prog-title',
        key: 'prog_title',
        label: 'Tiêu đề Chương Trình',
        defaultValue: 'CHƯƠNG TRÌNH',
        type: 'text',
        visible: true,
        x: 40,
        y: 42,
        width: 420,
        fontSize: 17,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#b91c1c',
        align: 'center'
      },
      {
        id: 'ddk-prog-sub',
        key: 'prog_subtitle',
        label: 'Chủ đề Ngày hội',
        defaultValue: 'NGÀY HỘI ĐẠI ĐOÀN KẾT TOÀN DÂN TỘC\nỞ KHU DÂN CƯ NĂM 2026',
        type: 'text',
        visible: true,
        x: 40,
        y: 66,
        width: 420,
        fontSize: 11.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#0f172a',
        align: 'center'
      },
      {
        id: 'ddk-prog-agenda',
        key: 'agenda_steps',
        label: '11 Nội Dung Chương Trình',
        defaultValue: `1. Văn nghệ chào mừng.
2. Chào cờ.
3. Tuyên bố lý do, giới thiệu đại biểu kết hợp Ôn truyền thống 96 năm ngày Thành lập Mặt trận Dân tộc thống nhất Việt Nam, ngày Truyền thống Mặt trận Tổ quốc Việt Nam (18/11/1930 – 18/11/2026).
4. Báo cáo của Ban công tác Mặt trận khu dân cư (hoặc liên Ban công tác Mặt trận khu dân cư).
5. Các đại biểu trao đổi, thảo luận.
6. Chủ trì phát biểu tiếp thu và giải trình (nếu có).
7. Biểu dương, tôn vinh, khen thưởng những tập thể, gia đình và cá nhân tiêu biểu.
8. Tặng quà hộ gia đình nghèo, cận nghèo, gia đình chính sách (nếu có).
9. Mời lãnh đạo cấp trên phát biểu, tặng quà (nếu có).
10. Phát động hưởng ứng phong trào thi đua; xây dựng khu dân cư đoàn kết, an toàn, ấm no, hạnh phúc.
11. Phát biểu cảm ơn và kết thúc buổi Lễ.`,
        type: 'text',
        visible: true,
        x: 42,
        y: 114,
        width: 418,
        fontSize: 10.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '400',
        color: '#0f172a',
        align: 'left'
      },
      {
        id: 'ddk-prog-org',
        key: 'prog_organizer',
        label: 'Ban Tổ Chức (Trang Trái)',
        defaultValue: 'BAN TỔ CHỨC',
        type: 'text',
        visible: true,
        x: 300,
        y: 585,
        width: 150,
        fontSize: 12,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#b91c1c',
        align: 'center'
      },

      // ================= TRANG PHẢI: THƯ MỜI =================
      {
        id: 'ddk-org-left',
        key: 'issuing_agency',
        label: 'Cơ Quan Ban Hành (Trang Phải)',
        defaultValue: 'ỦY BAN MTTQ VIỆT NAM\nXÃ ĐẠI PHƯỚC\nBVĐ ẤP GIỒNG ÔNG ĐÔNG',
        type: 'text',
        visible: true,
        x: 520,
        y: 44,
        width: 210,
        fontSize: 10.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#0f172a',
        align: 'center'
      },
      {
        id: 'ddk-no',
        key: 'letter_no',
        label: 'Số Thư Mời',
        defaultValue: '01/TM-BVĐ',
        type: 'text',
        visible: true,
        x: 520,
        y: 92,
        width: 210,
        fontSize: 11,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '600',
        color: '#0f172a',
        align: 'center',
        prefix: 'Số: '
      },
      {
        id: 'ddk-motto-right',
        key: 'national_motto',
        label: 'Quốc Hiệu & Tiêu Ngữ',
        defaultValue: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc',
        type: 'text',
        visible: true,
        x: 740,
        y: 44,
        width: 240,
        fontSize: 10.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#0f172a',
        align: 'center'
      },
      {
        id: 'ddk-date',
        key: 'date',
        label: 'Ngày Tháng Ban Hành',
        defaultValue: 'Giồng Ông Đông, ngày 02 tháng 11 năm 2026',
        type: 'text',
        visible: true,
        x: 740,
        y: 84,
        width: 240,
        fontSize: 10.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontStyle: 'italic',
        fontWeight: '400',
        color: '#0f172a',
        align: 'center'
      },
      {
        id: 'ddk-invite-title',
        key: 'invitation_heading',
        label: 'Tiêu Đề THƯ MỜI',
        defaultValue: 'THƯ MỜI',
        type: 'text',
        visible: true,
        x: 630,
        y: 110,
        width: 240,
        fontSize: 26,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#b91c1c',
        align: 'center'
      },
      {
        id: 'ddk-intro',
        key: 'invitation_intro',
        label: 'Đoạn Căn Cứ Mở Đầu',
        defaultValue: `Thực hiện Kế hoạch số 54/KH-MTTQ-BTT, ngày 05/10/2026 của Ban Thường trực Ủy ban MTTQ Việt Nam xã Đại Phước về tổ chức các hoạt động thiết thực chào mừng kỷ niệm 96 năm ngày truyền thống Mặt trận Tổ quốc Việt Nam (18/11/1930 – 18/11/2026) và tổ chức “Ngày hội đại đoàn kết toàn dân tộc” ở khu dân cư năm 2026;
Được sự thống nhất của Thường trực Đảng ủy xã Đại Phước; Ban Thường trực Ủy ban MTTQ Việt Nam xã Đại Phước và Chi ủy Chi bộ ấp Giồng Ông Đông;
Ban vận động ấp Giồng Ông Đông trân trọng kính mời:`,
        type: 'text',
        visible: true,
        x: 535,
        y: 146,
        width: 425,
        fontSize: 10.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '400',
        color: '#1e293b',
        align: 'left'
      },
      {
        id: 'ddk-name',
        key: 'name',
        label: 'Họ và Tên Khách Mời',
        defaultValue: 'Nguyễn Thanh Quang',
        type: 'text',
        visible: true,
        x: 535,
        y: 275,
        fontSize: 14.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#0f172a',
        align: 'left',
        prefix: '- Ông (bà): '
      },
      {
        id: 'ddk-address',
        key: 'address',
        label: 'Địa Chỉ Khách Mời',
        defaultValue: 'ấp Giồng Ông Đông, xã Đại Phước',
        type: 'text',
        visible: true,
        x: 535,
        y: 310,
        fontSize: 13,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        prefix: '- Địa chỉ: '
      },
      {
        id: 'ddk-time',
        key: 'time',
        label: 'Thời Gian Tổ Chức',
        defaultValue: 'Vào lúc 7 giờ 00 ngày 15/11/2026 (Chủ nhật).',
        type: 'text',
        visible: true,
        x: 535,
        y: 345,
        fontSize: 12.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        prefix: 'Thời gian: '
      },
      {
        id: 'ddk-location',
        key: 'location',
        label: 'Địa Điểm Tổ Chức',
        defaultValue: 'Nhà Bia Liệt sĩ ấp Giồng Ông Đông, xã Đại Phước.',
        type: 'text',
        visible: true,
        x: 535,
        y: 380,
        fontSize: 12.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        prefix: 'Địa điểm: '
      },
      {
        id: 'ddk-content',
        key: 'content',
        label: 'Nội Dung Cuộc Họp',
        defaultValue: 'Dự “Ngày hội đại đoàn kết toàn dân tộc ở khu dân cư năm 2026”.',
        type: 'text',
        visible: true,
        x: 535,
        y: 415,
        fontSize: 12.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        prefix: 'Nội dung: '
      },
      {
        id: 'ddk-courtesy',
        key: 'courtesy_closing',
        label: 'Lời Kêu Gọi / Kính Mời',
        defaultValue: 'Nhận được thư mời, rất mong quý vị đại biểu sắp xếp thời gian, công việc đến dự để Ngày hội thêm phần long trọng và ý nghĩa!',
        type: 'text',
        visible: true,
        x: 535,
        y: 460,
        width: 425,
        fontSize: 10.5,
        fontFamily: "'Times New Roman', Times, serif",
        fontStyle: 'italic',
        fontWeight: '400',
        color: '#1e293b',
        align: 'left'
      },
      {
        id: 'ddk-sign-bithu',
        key: 'sign_bithu',
        label: 'Ký tên Bí thư Chi bộ',
        defaultValue: 'BÍ THƯ CHI BỘ\n(Đã ký)\n\nNguyễn Văn Minh',
        type: 'text',
        visible: true,
        x: 530,
        y: 508,
        width: 180,
        fontSize: 11,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#0f172a',
        align: 'center'
      },
      {
        id: 'ddk-sign-truongban',
        key: 'sign_truongban',
        label: 'Ký tên Trưởng Ban Vận Động',
        defaultValue: 'TM. BAN VẬN ĐỘNG\nTRƯỞNG BAN\n(Đã ký)\n\nNguyễn Tấn Tài',
        type: 'text',
        visible: true,
        x: 770,
        y: 500,
        width: 195,
        fontSize: 11,
        fontFamily: "'Times New Roman', Times, serif",
        fontWeight: '700',
        color: '#0f172a',
        align: 'center'
      },
      {
        id: 'ddk-qr',
        key: 'qr_code',
        label: 'Mã QR Check-in',
        type: 'qr',
        visible: true,
        x: 915,
        y: 625,
        width: 60,
        height: 60,
        qrSize: 60,
        fontSize: 10,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '400',
        color: '#000000',
        align: 'center'
      }
    ],
    defaultRecords: [
      {
        name: 'Nguyễn Thanh Quang',
        address: 'ấp Giồng Ông Đông, xã Đại Phước',
        letter_no: '01/TM-BVĐ',
        date: 'Giồng Ông Đông, ngày 02 tháng 11 năm 2026',
        time: 'Vào lúc 7 giờ 00 ngày 15/11/2026 (Chủ nhật).',
        location: 'Nhà Bia Liệt sĩ ấp Giồng Ông Đông, xã Đại Phước.',
        content: 'Dự “Ngày hội đại đoàn kết toàn dân tộc ở khu dân cư năm 2026”.',
        qr_code: 'TM-01-NGUYEN-THANH-QUANG'
      },
      {
        name: 'Trần Văn Hùng',
        address: 'ấp Giồng Ông Đông, xã Đại Phước',
        letter_no: '02/TM-BVĐ',
        date: 'Giồng Ông Đông, ngày 02 tháng 11 năm 2026',
        time: 'Vào lúc 7 giờ 00 ngày 15/11/2026 (Chủ nhật).',
        location: 'Nhà Bia Liệt sĩ ấp Giồng Ông Đông, xã Đại Phước.',
        content: 'Dự “Ngày hội đại đoàn kết toàn dân tộc ở khu dân cư năm 2026”.',
        qr_code: 'TM-02-TRAN-VAN-HUNG'
      },
      {
        name: 'Lê Thị Mai',
        address: 'ấp Giồng Ông Đông, xã Đại Phước',
        letter_no: '03/TM-BVĐ',
        date: 'Giồng Ông Đông, ngày 02 tháng 11 năm 2026',
        time: 'Vào lúc 7 giờ 00 ngày 15/11/2026 (Chủ nhật).',
        location: 'Nhà Bia Liệt sĩ ấp Giồng Ông Đông, xã Đại Phước.',
        content: 'Dự “Ngày hội đại đoàn kết toàn dân tộc ở khu dân cư năm 2026”.',
        qr_code: 'TM-03-LE-THI-MAI'
      },
      {
        name: 'Phạm Hồng Thái',
        address: 'ấp Giồng Ông Đông, xã Đại Phước',
        letter_no: '04/TM-BVĐ',
        date: 'Giồng Ông Đông, ngày 02 tháng 11 năm 2026',
        time: 'Vào lúc 7 giờ 00 ngày 15/11/2026 (Chủ nhật).',
        location: 'Nhà Bia Liệt sĩ ấp Giồng Ông Đông, xã Đại Phước.',
        content: 'Dự “Ngày hội đại đoàn kết toàn dân tộc ở khu dân cư năm 2026”.',
        qr_code: 'TM-04-PHAM-HONG-THAI'
      }
    ],
    generateBackground: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d')!;

      // Nền giấy kem trang trọng chuẩn mẫu
      ctx.fillStyle = '#fffdf9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Khung viền kép bao quanh toàn bộ 2 trang
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

      // Đường gập đôi ở giữa (Center Fold)
      const centerX = canvas.width / 2;
      ctx.setLineDash([12, 12]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX, 42);
      ctx.lineTo(centerX, canvas.height - 42);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nhãn chỉ dẫn đường gập ở dưới đáy
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Times New Roman", Times, serif';
      ctx.textAlign = 'center';
      ctx.fillText('- - - ĐƯỜNG GẤP GIẤY (A4 GẤP ĐÔI THÀNH 2 TRANG A5) - - -', centerX, canvas.height - 18);

      // Đường kẻ trang trí phân cách dưới tiêu đề bên trang trái
      const leftCenterX = centerX / 2;
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftCenterX - 180, 190);
      ctx.lineTo(leftCenterX + 180, 190);
      ctx.stroke();

      // Gạch chân Quốc hiệu & Tiêu ngữ bên trang phải
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + 620, 132);
      ctx.lineTo(centerX + 840, 132);
      ctx.stroke();

      // Các dòng chấm kẻ dẫn trường căn chuẩn tuyệt đối với baseline của các trường điền
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;

      const dotLines = [
        { y: 588 }, // Baseline dòng Họ tên (Stage y = 294)
        { y: 658 }, // Baseline dòng Địa chỉ (Stage y = 329)
        { y: 728 }, // Baseline dòng Thời gian (Stage y = 364)
        { y: 798 }, // Baseline dòng Địa điểm (Stage y = 399)
        { y: 868 }  // Baseline dòng Nội dung (Stage y = 434)
      ];

      dotLines.forEach(({ y }) => {
        ctx.beginPath();
        ctx.moveTo(centerX + 230, y);
        ctx.lineTo(canvas.width - 65, y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Dấu mộc đỏ mô phỏng chuẩn
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX + 660, 1140, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('BAN VẬN ĐỘNG', centerX + 660, 1132);
      ctx.fillText('ẤP GIỒNG ÔNG ĐÔNG', centerX + 660, 1152);

      return canvas.toDataURL('image/png');
    }
  }
];


