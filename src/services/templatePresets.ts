import { PresetTemplate } from '../types';

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
  }
];
