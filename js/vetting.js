// -------------------------------------------------------------
// 12B. PARTNER VETTING ENGINE (THẨM ĐỊNH ĐỐI TÁC PRE-B1 & EMAIL JTRUE)
// -------------------------------------------------------------
const VETTING_CONDITIONAL_INDUSTRIES = [
  {
    id: "EDU",
    label: "Lĩnh vực giáo dục (Trung tâm Anh ngữ, trường học, đào tạo)",
    keywords: ["giao duc", "anh ngu", "ngoai ngu", "trung tam", "truong hoc", "mam non", "dao tao", "tieng anh", "ielts", "steam", "gia su"],
    docs: [
      "Quyết Định Thành Lập (văn bản riêng hoặc thể hiện trên Giấy CN Đầu Tư)",
      "Giấy Phép Hoạt Động Giáo Dục tại từng địa điểm kinh doanh"
    ]
  },
  {
    id: "ONLINE_EDU",
    label: "Dạy học online / EdTech trực tuyến",
    keywords: ["day hoc online", "edtech", "khoa hoc online", "hoc truc tuyen", "e-learning", "elearning"],
    docs: [
      "Giấy Phép Hoạt Động Giáo Dục",
      "Hợp đồng mẫu với Khách hàng / Học viên",
      "Chính sách dịch vụ & Mẫu hóa đơn phát hành"
    ]
  },
  {
    id: "FNB",
    label: "Dịch vụ nhà hàng / Ăn uống (F&B)",
    keywords: ["nha hang", "an uong", "f&b", "fnb", "quan an", "ca phe", "cafe", "tra sua", "bakery", "banh", "lau", "nuong", "bistro", "com", "pho"],
    docs: [
      "Giấy Chứng Nhận Vệ Sinh An Toàn Thực Phẩm (VSATTP)",
      "Thông Báo / Giấy Phép Tiêu Dùng Rượu Tại Chỗ (nếu có bán rượu)"
    ]
  },
  {
    id: "CVS",
    label: "Cửa hàng tiện lợi / Siêu thị mini",
    keywords: ["cua hang tien loi", "sieu thi", "mini mart", "minimart", "tap hoa", "bach hoa"],
    docs: [
      "Giấy Chứng Nhận VSATTP",
      "Giấy phép bán lẻ rượu (nếu có kinh doanh)",
      "Giấy phép bán lẻ thuốc lá (nếu có kinh doanh)"
    ]
  },
  {
    id: "HOTEL",
    label: "Dịch vụ Lưu trú (Khách sạn, Resort, Homestay)",
    keywords: ["luu tru", "khach san", "hotel", "resort", "homestay", "villa", "nha nghi"],
    docs: [
      "Giấy Chứng Nhận Đủ Điều Kiện Về An Ninh, Trật Tự",
      "Giấy Phép Phòng Cháy Chữa Cháy (PCCC)"
    ]
  },
  {
    id: "KARAOKE",
    label: "Dịch vụ Karaoke",
    keywords: ["karaoke"],
    docs: [
      "Giấy Chứng Nhận Đủ Điều Kiện Về An Ninh, Trật Tự",
      "Giấy Phép Hoạt Động Trong Lĩnh Vực Karaoke",
      "Giấy Chứng Nhận VSATTP (nếu có chế biến đồ ăn/thức uống)"
    ]
  },
  {
    id: "GAME",
    label: "Kinh doanh Trò chơi điện tử",
    keywords: ["tro choi dien tu", "game", "cyber", "net", "khu vui choi"],
    docs: [
      "Giấy chứng nhận đủ điều kiện hoạt động điểm cung cấp dịch vụ trò chơi điện tử công cộng"
    ]
  },
  {
    id: "GYM",
    label: "Dịch vụ phòng tập Gym / Fitness / Yoga",
    keywords: ["gym", "fitness", "yoga", "pilates", "the hinh", "the thao", "boi loi"],
    docs: [
      "Giấy Phép Đủ Điều Kiện Hoạt Động Thể Dục Thể Thao"
    ]
  },
  {
    id: "TIMESHARE",
    label: "Sở hữu kỳ nghỉ (Timeshare)",
    keywords: ["so huu ky nghi", "timeshare", "nghi duong"],
    docs: [
      "Kiểm tra Mã ngành phù hợp (thông thường mã 7990)",
      "Hợp đồng khung với KH (chính sách thẻ hội viên, thời gian sở hữu, giá, đặt phòng)",
      "Giấy phép đầu tư Dự Án + Tiến độ xây dựng & hình ảnh thực tế / văn phòng mở bán",
      "Hợp đồng cấp quyền khai thác kinh doanh (thời gian hiệu lực, chính sách phí)"
    ]
  },
  {
    id: "CONSTRUCTION",
    label: "Tư vấn, giám sát, thi công công trình xây dựng",
    keywords: ["xay dung", "thi cong", "giam sat", "tu van cong trinh", "kien truc"],
    docs: [
      "Chứng chỉ năng lực hoạt động xây dựng"
    ]
  },
  {
    id: "HOSPITAL",
    label: "Bệnh viện / Phòng khám / Nha khoa",
    keywords: ["benh vien", "phong kham", "nha khoa", "y te", "da khoa", "san khoa", "mat"],
    docs: [
      "Giấy Phép Khám Chữa Bệnh tại từng địa điểm đăng ký kinh doanh"
    ]
  },
  {
    id: "PHARMA",
    label: "Kinh doanh Dược phẩm / Nhà thuốc",
    keywords: ["duoc", "nha thuoc", "thuoc tay", "pharmacy", "duoc pham"],
    docs: [
      "Giấy chứng nhận đủ điều kiện kinh doanh Dược"
    ]
  },
  {
    id: "MASSAGE",
    label: "Dịch vụ Massage thư giãn",
    keywords: ["massage", "xoa bop", "bam huyet"],
    docs: [
      "Giấy Chứng Nhận Đủ Điều Kiện Về An Ninh, Trật Tự",
      "Giấy Phép Phòng Cháy Chữa Cháy (PCCC)"
    ]
  },
  {
    id: "SPA_SURGERY",
    label: "Thẩm mỹ viện (có phẫu thuật thẩm mỹ)",
    keywords: ["phau thuat tham my", "tham my vien phau thuat", "benh vien tham my"],
    docs: [
      "Giấy Phép Khám Chữa Bệnh tại địa điểm đăng ký kinh doanh",
      "Giấy Chứng Nhận Đủ Điều Kiện Về An Ninh, Trật Tự"
    ]
  },
  {
    id: "SPA_NON_SURGERY",
    label: "Thẩm mỹ viện / Spa (xăm môi, mày, xâm lấn không phẫu thuật)",
    keywords: ["tham my", "spa", "xam moi", "phun xam", "lam dep", "cham soc da"],
    docs: [
      "Giấy Phép Khám Chữa Bệnh tại địa điểm đăng ký kinh doanh (nếu có xâm lấn)"
    ]
  },
  {
    id: "INSURANCE",
    label: "Lĩnh vực Bảo hiểm",
    keywords: ["bao hiem", "insurance"],
    docs: [
      "Quyết Định Thành Lập Của Bộ Tài Chính",
      "Giấy chứng nhận đăng ký thuế"
    ]
  },
  {
    id: "TRAVEL",
    label: "Dịch vụ Du lịch lữ hành",
    keywords: ["du lich", "lu hanh", "tour", "travel"],
    docs: [
      "Giấy Phép Kinh Doanh Dịch Vụ Lữ Hành Nội Địa / Quốc Tế"
    ]
  },
  {
    id: "TRANSPORT",
    label: "Dịch vụ vận tải bằng ô tô, container",
    keywords: ["van tai", "logistics", "chuyen phat", "van chuyen", "container", "xe khach"],
    docs: [
      "Giấy Phép KD vận tải bằng xe ô tô",
      "Giấy phép vận chuyển hàng hóa nguy hiểm (nếu có)"
    ]
  },
  {
    id: "POSTAL",
    label: "Dịch vụ thư có địa chỉ nhận (Bưu chính)",
    keywords: ["buu chinh", "thu tin", "chuyen phat nhanh"],
    docs: [
      "Giấy phép bưu chính (trong nước / nước ngoài)"
    ]
  },
  {
    id: "COSMETICS",
    label: "Mỹ phẩm (do DN tự sản xuất và bán)",
    keywords: ["san xuat my pham", "my pham tu san xuat"],
    docs: [
      "Giấy Chứng Nhận Đủ Điều Kiện Sản Xuất Mỹ Phẩm",
      "Giấy Công Bố Chất Lượng Sản Phẩm"
    ]
  },
  {
    id: "RETAIL_ALCOHOL",
    label: "Bán lẻ rượu",
    keywords: ["ban le ruou", "cua hang ruou", "ruou vang"],
    docs: [
      "Giấy Phép Bán Lẻ Rượu"
    ]
  },
  {
    id: "WHOLESALE_ALCOHOL",
    label: "Bán buôn rượu",
    keywords: ["ban buon ruou", "phan phoi ruou"],
    docs: [
      "Giấy Phép Bán Buôn Rượu"
    ]
  },
  {
    id: "BAR_PUB",
    label: "Quán bar / Pub (bán rượu uống tại chỗ)",
    keywords: ["bar", "pub", "lounge", "club"],
    docs: [
      "Thông Báo / Giấy Phép Tiêu Dùng Rượu Tại Chỗ",
      "Giấy Chứng Nhận VSATTP (nếu có chế biến đồ ăn/thức uống)",
      "Giấy Phép PCCC"
    ]
  },
  {
    id: "EVENT_TICKET",
    label: "Tổ chức bán vé sự kiện",
    keywords: ["su kien", "ban ve", "event", "concert", "show"],
    docs: [
      "Giấy phép tổ chức sự kiện"
    ]
  },
  {
    id: "FDI",
    label: "Đối tác có vốn đầu tư nước ngoài (FDI)",
    keywords: ["nuoc ngoai", "fdi", "von dau tu nuoc ngoai"],
    docs: [
      "Giấy chứng nhận đăng ký đầu tư",
      "Giấy phép kinh doanh bán lẻ hàng hóa"
    ]
  }
];

function normalizeVettingText(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function matchVettingIndustry(industryText) {
  const norm = normalizeVettingText(industryText);
  if (!norm) return null;

  // Exact label match first
  const exact = VETTING_CONDITIONAL_INDUSTRIES.find(ind => normalizeVettingText(ind.label) === norm);
  if (exact) return exact;

  // Keyword match (longest keyword wins)
  let bestMatch = null;
  let bestLen = 0;
  VETTING_CONDITIONAL_INDUSTRIES.forEach(ind => {
    ind.keywords.forEach(kw => {
      if (norm.includes(kw) && kw.length > bestLen) {
        bestLen = kw.length;
        bestMatch = ind;
      }
    });
  });
  return bestMatch;
}

function buildVettingChecklist(ob) {
  const channel = String(ob?.channel || "POS");
  const hasPos = channel.includes("POS");
  const hasOnline = channel.includes("PAYLINK") || channel.includes("PGW");
  const matchedInd = matchVettingIndustry(ob?.industry || "");

  const items = [
    {
      id: "vet-invoice",
      stt: 1,
      group: "COMMON",
      title: "Hóa đơn bán hàng / hóa đơn GTGT của đơn hàng",
      detail: "Cung cấp 1–2 mẫu hóa đơn bán hàng / hóa đơn GTGT thực tế đang sử dụng.",
      detailsList: ["Cung cấp 1–2 mẫu hóa đơn bán hàng / hóa đơn GTGT thực tế đang sử dụng"]
    },
    {
      id: "vet-dkkd",
      stt: 2,
      group: "COMMON",
      title: "Giấy tờ pháp lý liên quan đến đăng ký kinh doanh:",
      detail: "Giấy chứng nhận đăng ký doanh nghiệp; Giấy chứng nhận đăng ký Chi Nhánh / ĐĐKD (nếu có).",
      detailsList: [
        "Giấy chứng nhận đăng ký doanh nghiệp",
        "Giấy chứng nhận đăng ký Chi Nhánh / ĐĐKD (nếu có)"
      ]
    },
    {
      id: "vet-bank-pic",
      stt: 3,
      group: "COMMON",
      title: "Số tài khoản ngân hàng và các thông tin đầu mối xử lý các đầu việc",
      detail: "(Chi tiết comment trong PL / file thông tin đối tác)",
      detailsList: ["(Chi tiết comment trong Phụ Lục / file thông tin đối tác)"]
    },
    {
      id: "vet-vneid-org",
      stt: 4,
      group: "COMMON",
      title: "Số định danh Doanh Nghiệp",
      detail: "Tra cứu khi Người ĐDPL hoặc Kế toán trưởng vào App VNeID → mục Định danh Tổ Chức.",
      detailsList: [
        "Có thể tra cứu khi Người đại diện pháp luật hoặc Kế toán trưởng tra cứu trong VNeID (mục Định danh Tổ Chức)"
      ]
    },
    {
      id: "vet-rep",
      stt: 5,
      group: "COMMON",
      title: "Thông tin người ký kết hợp đồng (chính là Người đại diện theo pháp luật):",
      detail: "CMND/CCCD, Số định danh (VNeID), SĐT, địa chỉ thường trú & hiện tại.",
      detailsList: [
        "CMND / CCCD",
        "Số định danh (tra cứu trên App VNeID)",
        "Số điện thoại liên hệ",
        "Địa chỉ nơi ở thường trú & hiện tại",
        "Giấy Ủy Quyền (nếu người ký không phải Người ĐDPL)"
      ]
    },
    {
      id: "vet-chief-acc",
      stt: 6,
      group: "COMMON",
      title: "Thông tin Kế toán trưởng (hoặc Người phụ trách Kế toán):",
      detail: "Hình chụp CCCD/CMND, SĐT, Hợp đồng lao động hoặc Giấy bổ nhiệm chức vụ.",
      detailsList: [
        "Hình chụp CCCD / CMND",
        "Số điện thoại",
        "Hợp đồng lao động hoặc Giấy bổ nhiệm chức vụ Kế toán trưởng (che thông tin lương/thưởng/...)"
      ]
    }
  ];

  let nextStt = 7;
  if (hasPos) {
    items.push({
      id: "vet-pos-photos",
      stt: nextStt++,
      group: "CHANNEL",
      title: "03 hình chụp tại các cơ sở (Kênh POS):",
      detail: "01 hình góc nghiêng mặt tiền, 01 hình không gian bên trong, 01 hình quầy thu ngân.",
      detailsList: [
        "01 hình góc nghiêng mặt tiền (rõ bảng hiệu & địa chỉ)",
        "01 hình không gian bên trong",
        "01 hình quầy thu ngân"
      ]
    });
  }
  if (hasOnline) {
    items.push({
      id: "vet-online-bct",
      stt: nextStt++,
      group: "CHANNEL",
      title: "Hồ sơ kênh thanh toán trực tuyến (Paylink / PGW):",
      detail: "03 hình chụp văn phòng/kho hàng & Link đã thông báo Bộ Công Thương (online.gov.vn).",
      detailsList: [
        "03 hình chụp văn phòng đại diện / kho hàng đang hoạt động",
        "Link đã thông báo Bộ Công Thương của Website/App triển khai hợp tác (online.gov.vn)"
      ]
    });
  }
  if (matchedInd) {
    items.push({
      id: `vet-ind-${matchedInd.id}`,
      stt: nextStt++,
      group: "INDUSTRY",
      industryLabel: matchedInd.label,
      title: `Giấy phép ngành nghề có điều kiện (${matchedInd.label}):`,
      detail: matchedInd.docs.join("; "),
      detailsList: matchedInd.docs,
      docs: matchedInd.docs
    });
  }

  return items;
}

function previewOnboardingIndustryDocs() {
  const input = document.getElementById("ob-industry");
  const box = document.getElementById("ob-industry-preview");
  if (!input || !box) return;
  const val = input.value.trim();
  if (!val) {
    box.classList.add("hidden");
    box.innerHTML = "";
    return;
  }
  const matched = matchVettingIndustry(val);
  box.classList.remove("hidden");
  if (matched) {
    box.className = "p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-[11px] space-y-1";
    box.innerHTML = `
      <div class="font-bold flex items-center gap-1.5">
        <span>🛡️ Ngành có điều kiện:</span>
        <span class="text-amber-800">${matched.label}</span>
      </div>
      <ul class="list-disc pl-4 space-y-0.5 text-[10px] text-amber-800">
        ${matched.docs.map(d => `<li>${d}</li>`).join("")}
      </ul>
    `;
  } else {
    box.className = "p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-[11px]";
    box.innerHTML = `<span>Ngành nghề thông thường — áp dụng bộ hồ sơ pháp lý chuẩn Payoo.</span>`;
  }
}

function toggleVettingCheckItem(obId, itemId) {
  const ob = onboardingList.find(o => o.id === obId);
  if (!ob) return;
  if (!Array.isArray(ob.vetting_done_ids)) ob.vetting_done_ids = [];
  const idx = ob.vetting_done_ids.indexOf(itemId);
  if (idx >= 0) ob.vetting_done_ids.splice(idx, 1);
  else ob.vetting_done_ids.push(itemId);
  saveOnboardingStorage();
  renderOnboardingView();
}

function approveVettingToSop(obId) {
  const ob = onboardingList.find(o => o.id === obId);
  if (!ob) return;
  ob.vetting_status = "APPROVED";
  saveOnboardingStorage();
  if (typeof setOnboardingViewMode === "function") setOnboardingViewMode("SOP");
  else renderOnboardingView();
  showToast(`✓ Đã duyệt thẩm định ${ob.merchant_name} — Chuyển sang B1 Làm Hợp Đồng!`);
}

function buildJtrueEmailContent(ob) {
  const brand = (ob.brand_name || ob.merchant_name || "ĐỐI TÁC").toUpperCase();
  const contact = (ob.contact_name || "").trim() || "Anh/Chị";
  const ch = String(ob.channel || "POS");
  const hasPos = ch.includes("POS");
  const hasOnline = ch.includes("PAYLINK") || ch.includes("PGW");

  const scopeDesc = hasPos && hasOnline
    ? "Thiết bị thanh toán (POS) đặt tại các Quầy và Cổng thanh toán trực tuyến / Paylink."
    : (hasOnline ? "Cổng thanh toán trực tuyến (PGW) / Link thanh toán (Paylink)." : "Thiết bị thanh toán (POS) đặt tại các Quầy.");

  const checklist = buildVettingChecklist(ob);
  const subject = `[${brand}-PAYOO] BỘ HỢP ĐỒNG CUNG ỨNG DỊCH VỤ`;

  const tableRowsHtml = checklist.map(item => {
    const lines = Array.isArray(item.detailsList) && item.detailsList.length > 0 ? item.detailsList : [item.detail];
    const linesHtml = lines.map(l => `<div style="margin-top:2px;">- ${l}</div>`).join("");
    return `
    <tr>
      <td style="border:1px solid #CBD5E1;padding:8px 10px;text-align:center;font-weight:bold;vertical-align:top;">${item.stt}</td>
      <td style="border:1px solid #CBD5E1;padding:8px 10px;vertical-align:top;">
        <div style="font-weight:bold;color:#0F172A;">${item.title}</div>
        <div style="font-size:12px;color:#334155;margin-top:4px;line-height:1.5;">${linesHtml}</div>
      </td>
    </tr>
  `;
  }).join("");

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:#111827;">
  <p><strong><em>Dear ${contact} và ${brand} teams,</em></strong></p>
  <p>Em gửi <strong>Bộ Hợp Đồng</strong> hợp tác dịch vụ thanh toán${ob.tax_code ? ` (MST: <strong>${ob.tax_code}</strong>)` : ''}, bên dưới là mô tả cấu trúc <strong>Bộ Hợp Đồng</strong> để anh/chị review nhanh:</p>
  <ul>
    <li><strong><u>Hợp Đồng Cung ứng Dịch vụ</u></strong>
      <ul>
        <li>Các thuật ngữ được sử dụng trong Hợp Đồng.</li>
        <li>Quyền và nghĩa vụ của các Bên.</li>
      </ul>
    </li>
    <li><strong><u>PL01: Phạm vi hợp tác</u></strong>
      <ul>
        <li>Mô tả phạm vi hợp tác giữa 02 Bên: ${scopeDesc}</li>
        <li>Phương thức thanh toán: Thẻ, QRCode và e-Voucher, Trả góp, BNPL.</li>
      </ul>
    </li>
    <li><strong><u>PL02: Phí dịch vụ</u></strong>
      <ul>
        <li>Mô tả Phí xử lý thanh toán: Thẻ, QRCode, và e-Voucher.</li>
        <li>Mô tả phí duy trì dựa trên doanh thu tối thiểu/tháng và các phí khác như báo giá của Payoo.</li>
      </ul>
    </li>
    <li><strong><u>PL03: Quy định đối soát và thanh quyết toán</u></strong>
      <ul>
        <li>Ngày thực hiện đối soát: gọi là ngày N (ngày làm việc), đối soát dữ liệu thanh toán phát sinh trong ngày N-1.</li>
        <li>Payoo chuyển Tiền dịch vụ (tiền thu từ Khách Hàng) cho Đối Tác trong ngày N sau khi đối soát.</li>
        <li>Đối soát tháng: trong 05 ngày đầu tiên hàng tháng, Payoo gửi dữ liệu chốt đối soát, trong vòng 02 ngày tiếp theo Đối Tác xác nhận. Chậm nhất ngày 07 hàng tháng, Payoo xuất hoá đơn.</li>
        <li>Phí dịch vụ sẽ được hệ thống Payoo thu tự động ngay sau giao dịch thành công.</li>
        <li>Thời gian xử lý giao dịch lệch tối đa 03 ngày, sau đó 02 Bên trao đổi hướng xử lý và thanh toán trong kỳ đối soát tiếp theo.</li>
      </ul>
    </li>
    <li><strong><u>PL04: Địa điểm triển khai</u></strong>
      <ul><li>Triển khai dịch vụ tại các cơ sở đang hoạt động.</li></ul>
    </li>
    <li><strong><u>PL01.01: Quy Định Bảo Đảm Thực Hiện Hợp Đồng</u></strong></li>
  </ul>
  <p>Nhờ anh/chị <strong>review qua Bộ Hợp Đồng và cho em các thông tin còn thiếu trong HĐ</strong>, nếu có thắc mắc cần trao đổi thêm thì liên hệ với Em nhé.</p>
  <p>Đồng thời Payoo gửi kèm <strong>Bộ Chính Sách</strong>, đây là tài liệu hướng dẫn quý công ty sử dụng dịch vụ thanh toán theo quy định - yêu cầu không chỉnh sửa.</p>
  <p><strong>${brand} đồng ý Bộ Hợp Đồng</strong> vui lòng xác nhận qua mail và cung cấp thông tin/giấy tờ <strong><em>(hình chụp/bản scan màu/photo công chứng còn hiệu lực)</em></strong> để em tiến hành trình ký:</p>
  <table style="border-collapse:collapse;width:100%;max-width:720px;margin:10px 0;font-size:13px;">
    <thead>
      <tr style="background-color:#0F2C59;color:#FFFFFF;">
        <th style="border:1px solid #0F2C59;padding:8px 10px;width:54px;text-align:center;">STT</th>
        <th style="border:1px solid #0F2C59;padding:8px 10px;text-align:left;">Giấy tờ cần cung cấp</th>
      </tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>
  <p>Em cảm ơn !!</p>
</div>`.trim();

  const plainDocs = checklist.map(i => {
    const lines = Array.isArray(i.detailsList) && i.detailsList.length > 0 ? i.detailsList : [i.detail];
    return `${i.stt}. ${i.title}\n${lines.map(l => `   - ${l}`).join("\n")}`;
  }).join("\n");
  const plainText = [
    `Dear ${contact} và ${brand} teams,`,
    ``,
    `Em gửi Bộ Hợp Đồng hợp tác dịch vụ thanh toán${ob.tax_code ? ` (MST: ${ob.tax_code})` : ''}, bên dưới là mô tả cấu trúc Bộ Hợp Đồng để anh/chị review nhanh:`,
    `- Hợp Đồng Cung ứng Dịch vụ: Thuật ngữ, Quyền & nghĩa vụ các Bên.`,
    `- PL01: Phạm vi hợp tác: ${scopeDesc} Phương thức: Thẻ, QRCode, e-Voucher, Trả góp, BNPL.`,
    `- PL02: Phí dịch vụ: Phí xử lý thanh toán & phí duy trì theo báo giá Payoo.`,
    `- PL03: Quy định đối soát & thanh quyết toán (ngày N đối soát N-1, xuất hóa đơn chậm nhất ngày 07).`,
    `- PL04: Địa điểm triển khai tại các cơ sở đang hoạt động.`,
    `- PL01.01: Quy Định Bảo Đảm Thực Hiện Hợp Đồng.`,
    ``,
    `${brand} đồng ý Bộ Hợp Đồng vui lòng xác nhận qua mail và cung cấp thông tin/giấy tờ (hình chụp/bản scan màu/photo công chứng còn hiệu lực) để em tiến hành trình ký:`,
    ``,
    plainDocs,
    ``,
    `Em cảm ơn !!`
  ].join("\n");

  return { subject, html, plainText };
}

let activeVettingEmailObId = null;

function openVettingEmailModal(obId) {
  const ob = onboardingList.find(o => o.id === obId);
  if (!ob) return;
  activeVettingEmailObId = obId;
  const { subject, html } = buildJtrueEmailContent(ob);
  const subEl = document.getElementById("vetting-email-subject");
  const bodyEl = document.getElementById("vetting-email-preview");
  if (subEl) subEl.value = subject;
  if (bodyEl) bodyEl.innerHTML = html;
  document.getElementById("modal-vetting-email")?.classList.remove("hidden");
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function closeVettingEmailModal() {
  document.getElementById("modal-vetting-email")?.classList.add("hidden");
}

async function copyVettingEmailHtml() {
  const ob = onboardingList.find(o => o.id === activeVettingEmailObId);
  if (!ob) return;
  const { html, plainText } = buildJtrueEmailContent(ob);
  try {
    if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" })
      });
      await navigator.clipboard.write([item]);
      showToast("✓ Đã copy Email kèm Bảng Giấy Tờ (dán trực tiếp vào Gmail)!");
      return;
    }
  } catch (e) {}
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(plainText).catch(() => {});
    showToast("✓ Đã copy nội dung Email!");
  }
}

function openVettingMailClient() {
  const ob = onboardingList.find(o => o.id === activeVettingEmailObId);
  if (!ob) return;
  const { subject, plainText } = buildJtrueEmailContent(ob);
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
}
