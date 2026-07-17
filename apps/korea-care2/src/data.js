/* =========================================================================
   data.js — global.carebridge.io 실측 콘텐츠 (CareBridge Global)
   사용자에게 보이는 화면 구성·카피는 https://global.carebridge.io 를 따른다.
   이중언어(en/ko). 이미지는 주제에 맞는 Unsplash 플레이스홀더.
   ========================================================================= */

export const BRAND = {
  name: "CareBridge Global",
  short: "CareBridge",
  email: "global@carebridge.io",
  ceo: "Jiho Kim",
  addrEn: "10F, 000 Teheran-ro, Gangnam-gu, Seoul, Korea",
  addrKo: "서울특별시 강남구 테헤란로 000, 10층",
  bizNo: "000-00-00000",
};

/* ---------------- 상담 채널 (외국인 유치: 지역별 메신저) ----------------
   type: whatsapp|line|wechat|kakao|telegram|email|phone (링크 규칙은 App.jsx CHANNEL_LINK)
   value: 번호/ID/주소 (LTR 표시)
   langs: 노출 언어 코드 배열. 빈 배열 [] = 전 언어 노출 / 예:["ar"] = 아랍어에서만
   enabled: 표시 여부 */
export const CHANNELS = [
  { id: "whatsapp", type: "whatsapp", value: "+821000000000", label: { en: "WhatsApp", ko: "왓츠앱", ar: "واتساب", ja: "WhatsApp" }, langs: ["ar", "en"], enabled: true },
  { id: "line", type: "line", value: "@carebridge", label: { en: "LINE", ko: "라인", ar: "لاين", ja: "LINE" }, langs: ["ja"], enabled: true },
  { id: "wechat", type: "wechat", value: "carebridge_kr", label: { en: "WeChat", ko: "위챗", ar: "وي تشات", ja: "WeChat" }, langs: [], enabled: false },
  { id: "kakao", type: "kakao", value: "http://pf.kakao.com/_carebridge", label: { en: "KakaoTalk", ko: "카카오톡", ar: "كاكاو توك", ja: "カカオトーク" }, langs: ["ko"], enabled: true },
  { id: "email", type: "email", value: "global@carebridge.io", label: { en: "Email", ko: "이메일", ar: "البريد الإلكتروني", ja: "メール" }, langs: [], enabled: true },
  { id: "phone", type: "phone", value: "+82-2-0000-0000", label: { en: "Call", ko: "전화", ar: "اتصال", ja: "電話" }, langs: [], enabled: true },
];

/* ---------------- 프로모션·배너·팝업 (유치 캠페인) ----------------
   placement: "banner"(상단 스트립) | "popup"(홈 모달, 세션당 1회)
   text/cta: i18n · link: 이동 경로 · langs: []=전 언어 · enabled: 노출 */
export const PROMOS = [
  { id: "summer-checkup", placement: "banner", enabled: true, langs: [],
    text: { en: "Summer Health Check-up — up to 20% off for international patients", ko: "여름 건강검진 — 해외 환자 최대 20% 할인", ar: "الفحص الصحي الصيفي — خصم يصل إلى 20٪ للمرضى الدوليين", ja: "夏の健康診断 — 海外の患者様に最大20%オフ" },
    cta: { en: "See offers", ko: "혜택 보기", ar: "شاهد العروض", ja: "特典を見る" }, link: "/pricing" },
  { id: "welcome-consult", placement: "popup", enabled: false, langs: [],
    text: { en: "First consultation is free. Tell us your treatment plan and get a quote within 24 hours.", ko: "첫 상담은 무료입니다. 시술 계획을 알려주시면 24시간 내 견적을 드립니다.", ar: "الاستشارة الأولى مجانية. أخبرنا بخطة علاجك واحصل على عرض سعر خلال 24 ساعة.", ja: "初回相談は無料です。治療プランをお知らせいただければ24時間以内にお見積もりします。" },
    cta: { en: "Get a free quote", ko: "무료 견적 받기", ar: "احصل على عرض مجاني", ja: "無料見積もり" }, link: "/contact" },
];

/* ---------------- SEO/GEO 오버라이드 (검색·AI 노출) ----------------
   path 별 title/description/keywords 를 언어별로 덮어쓴다.
   ⚠ 언어별 값이 있을 때만 적용(비면 페이지 기존 번역 유지 → 회귀 없음).
   빈 항목은 admin/엑셀로 채운다. */
export const SEO_OVERRIDES = [
  { path: "/",
    title: { en: "Korea Medical Tourism & Health Checkups for International Patients", ko: "외국인을 위한 한국 의료관광·건강검진", ar: "السياحة العلاجية والفحوصات الصحية في كوريا للمرضى الدوليين", ja: "海外の患者様のための韓国医療ツーリズム・健康診断" },
    description: { en: "Plan health checkups and treatments in Korea with CareBridge — trusted hospitals, transparent USD pricing, interpreter and end-to-end coordination for international patients.", ko: "케어브릿지과 함께 한국에서 건강검진·시술을 계획하세요 — 신뢰 병원, 투명한 USD 가격, 통역·원스톱 코디네이션.", ar: "خطط للفحوصات والعلاجات في كوريا مع سيف دوك — مستشفيات موثوقة وأسعار شفافة بالدولار وترجمة وتنسيق شامل للمرضى الدوليين.", ja: "セイフドックで韓国の健康診断・施術を計画 — 信頼できる病院、明確なUSD料金、通訳と一括コーディネート。" },
    keywords: { en: "Korea medical tourism, health checkup Korea, whole-body MRI, SMILE LASIK Korea, dental implant Korea, international patients" }, ogImage: "" },
  { path: "/pricing",
    title: { en: "Korea Treatment & Check-up Prices (USD) — Transparent for International Patients", ko: "한국 시술·검진 가격표(USD) — 해외 환자 투명 가격" },
    description: { en: "Indicative USD prices for health checkups, SMILE LASIK, dental implants, hair transplant and more in Korea. Final quote confirmed after free consultation.", ko: "한국 건강검진·스마일라식·임플란트·모발이식 등 참고 USD 가격. 무료 상담 후 최종 견적 확정." }, keywords: {}, ogImage: "" },
  { path: "/providers",
    title: { en: "Trusted Korean Hospitals & Clinics for International Patients", ko: "외국인 진료 신뢰 한국 병원·클리닉" },
    description: {}, keywords: {}, ogImage: "" },
];

/* ---------------- 가격/견적 (외국인 유치: 투명 가격표) ----------------
   rows[].price 는 통화 포함 문자열(LTR 표시). 최종가는 상담 후 병원 확정. */
export const PRICING = {
  eyebrow: { en: "Pricing", ko: "가격 안내", ar: "الأسعار", ja: "料金" },
  title: { en: "Transparent prices for international patients", ko: "해외 환자를 위한 투명한 가격", ar: "أسعار شفافة للمرضى الدوليين", ja: "海外の患者様のための明確な料金" },
  note: { en: "Indicative ranges — the final quote depends on your case and is confirmed by the hospital after consultation. All prices in USD.", ko: "참고용 범위입니다 — 최종 견적은 상태에 따라 상담 후 병원이 확정합니다. 모든 가격은 USD 기준.", ar: "نطاقات إرشادية — يعتمد العرض النهائي على حالتك ويؤكده المستشفى بعد الاستشارة. جميع الأسعار بالدولار الأمريكي.", ja: "参考範囲です — 最終見積もりは状態により相談後に病院が確定します。価格はすべてUSD。" },
  rows: [
    { id: "comprehensive", category: { en: "Health Check-up", ko: "건강검진", ar: "الفحص الصحي", ja: "健康診断" }, name: { en: "Comprehensive Check-up", ko: "종합 건강검진", ar: "الفحص الشامل", ja: "総合健診" }, price: "USD 300", note: { en: "Blood, imaging & core organs", ko: "혈액·영상·주요 장기", ar: "الدم والتصوير والأعضاء الأساسية", ja: "血液・画像・主要臓器" } },
    { id: "whole-mri", category: { en: "Health Check-up", ko: "건강검진", ar: "الفحص الصحي", ja: "健康診断" }, name: { en: "Whole-Body MRI", ko: "전신 MRI", ar: "فحص MRI للجسم بالكامل", ja: "全身MRI検査" }, price: "USD 2,000", note: { en: "No radiation, high resolution", ko: "무방사선·고해상도", ar: "بدون إشعاع، دقة عالية", ja: "放射線なし・高解像度" } },
    { id: "smile-lasik", category: { en: "Ophthalmology", ko: "안과", ar: "طب العيون", ja: "眼科" }, name: { en: "SMILE LASIK", ko: "스마일 라식", ar: "SMILE LASIK", ja: "SMILE LASIK" }, price: "USD 2,200", note: { en: "Both eyes, incl. pre-op exam", ko: "양안·수술 전 검사 포함", ar: "كلتا العينين، يشمل فحص ما قبل الجراحة", ja: "両眼・術前検査込み" } },
    { id: "implant", category: { en: "Dental", ko: "치과", ar: "طب الأسنان", ja: "歯科" }, name: { en: "Dental Implant", ko: "임플란트", ar: "زراعة الأسنان", ja: "インプラント" }, price: "USD 900 / tooth", note: { en: "Fixture + abutment + crown", ko: "픽스처+어버트먼트+크라운", ar: "الدعامة والتاج", ja: "フィクスチャー+アバットメント+クラウン" } },
    { id: "hair", category: { en: "Plastic Surgery", ko: "성형외과", ar: "الجراحة التجميلية", ja: "美容外科" }, name: { en: "FUE Hair Transplant", ko: "모발이식(FUE)", ar: "زراعة الشعر", ja: "植毛（FUE）" }, price: "From USD 3,000", note: { en: "Priced by grafts", ko: "이식 모낭 수 기준", ar: "حسب عدد البصيلات", ja: "移植株数による" } },
    { id: "skin", category: { en: "Dermatology", ko: "피부과", ar: "الجلدية", ja: "皮膚科" }, name: { en: "Skin Rejuvenation Laser", ko: "피부 재생 레이저", ar: "ليزر تجديد البشرة", ja: "肌再生レーザー" }, price: "From USD 250", note: { en: "Per session", ko: "회당", ar: "لكل جلسة", ja: "1回あたり" } },
  ],
};

/* ---------------- 글로벌 네비게이션 (Home / Company / Service▾ / Contact / FAQ / Blog) ---------------- */
export const NAV = [
  { id: "home", path: "/", en: "Home", ko: "홈" },
  { id: "company", path: "/company", en: "Company", ko: "회사소개" },
  { id: "treatments", path: "/treatments", en: "Treatments", ko: "시술" },
  { id: "providers", path: "/providers", en: "Providers", ko: "파트너 병원" },
  { id: "contact", path: "/contact", en: "Contact Us", ko: "문의하기" },
  { id: "faq", path: "/faq", en: "FAQ", ko: "자주 묻는 질문" },
  { id: "blog", path: "/blog", en: "Blog", ko: "블로그" },
];

/* ---------------- 히어로 ---------------- */
export const HERO = {
  image: import.meta.env.BASE_URL + "hero-visitor.jpg",
  badge: { en: "Korea's trusted medical expertise", ko: "한국이 신뢰하는 의료 전문성" },
  title1: { en: "Healthier Tomorrow,", ko: "더 건강한 내일," },
  title2: { en: "Begins Today.", ko: "오늘 시작됩니다." },
  accent: { en: "With CareBridge Global.", ko: "CareBridge Global과 함께." },
  sub: {
    en: "CareBridge Global offers comprehensive healthcare — from preventive checkups to specialized treatments — powered by Korea's trusted medical expertise.",
    ko: "CareBridge Global은 예방 검진부터 전문 치료까지, 한국이 신뢰하는 의료 전문성을 바탕으로 종합 헬스케어를 제공합니다.",
  },
  cta1: { en: "Explore services", ko: "서비스 둘러보기" },
  cta2: { en: "How it works →", ko: "이용 방법 →" },
};

/* ---------------- Your Health Journey, Made Simple. (5단계) ---------------- */
export const JOURNEY = {
  eyebrow: { en: "How it works", ko: "이용 방법" },
  title: { en: "Your Health Journey, Made Simple.", ko: "건강 여정, 간편하게." },
  sub: {
    en: "From package selection to hospital visits, every step is arranged with ease.",
    ko: "패키지 선택부터 병원 방문까지, 모든 단계를 손쉽게 준비해 드립니다.",
  },
  steps: [
    { icon: "Folder", en: "Select your preferred package", ko: "원하는 패키지를 선택하세요" },
    { icon: "CalendarDays", en: "Choose your reservation date and submit", ko: "예약 날짜를 선택하고 신청하세요" },
    { icon: "MessageSquare", en: "Our coordinator confirms details and finalizes options", ko: "코디네이터가 세부사항을 확인하고 옵션을 확정합니다" },
    { icon: "CalendarCheck", en: "Receive your reservation confirmation", ko: "예약 확정을 받으세요" },
    { icon: "MapPin", en: "Hospital visit", ko: "병원 방문" },
  ],
};

/* ---------------- Health Check-up (3 패키지) ---------------- */
export const CHECKUP = {
  eyebrow: { en: "Health Check-up", ko: "건강검진" },
  title: { en: "Health Check-up", ko: "건강검진" },
  sub: {
    en: "Korea offers health checkups with cutting-edge technology and affordable prices — helping you live longer, healthier, and worry-free.",
    ko: "한국은 최첨단 기술과 합리적인 가격의 건강검진을 제공합니다 — 더 길고, 더 건강하고, 걱정 없는 삶을 돕습니다.",
  },
  packages: [
    {
      id: "comprehensive", tag: { en: "EXCLUSIVE", ko: "단독" },
      name: { en: "Comprehensive Check-up", ko: "종합 건강검진" }, price: "USD 300",
      image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&q=80",
      desc: { en: "A wide-range screening covering blood, imaging and core organ function — the essential annual checkup.", ko: "혈액·영상·핵심 장기 기능을 폭넓게 검사하는 필수 연간 검진." },
      includes: {
        en: ["Blood & urine panel", "Abdominal ultrasound", "Chest X-ray & ECG", "Gastroscopy (optional)", "Specialist consultation"],
        ko: ["혈액·소변 검사", "복부 초음파", "흉부 X-ray·심전도", "위내시경(선택)", "전문의 상담"],
      },
    },
    {
      id: "whole-mri", tag: { en: "EXCLUSIVE", ko: "단독" },
      name: { en: "Whole Body MRI Check-up", ko: "전신 MRI 검진" }, price: "USD 2,000",
      image: "https://images.unsplash.com/photo-1516069677018-378515003435?w=800&q=80",
      desc: { en: "Full-body MRI to detect tumors and abnormalities early — no radiation, high resolution.", ko: "종양·이상을 조기에 발견하는 전신 MRI — 방사선 없이 고해상도." },
      includes: {
        en: ["Whole-body MRI scan", "Brain & spine MRI", "MRA vascular screening", "Radiologist reading", "Comprehensive report"],
        ko: ["전신 MRI 촬영", "뇌·척추 MRI", "MRA 혈관 검사", "영상의학과 판독", "종합 리포트"],
      },
    },
    {
      id: "hospital-based",
      name: { en: "Hospital-based Check-up", ko: "병원 지정 검진" }, price: { en: "Custom", ko: "맞춤" },
      image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
      desc: { en: "Tailored programs at top tertiary hospitals — choose the hospital and scope that fit you.", ko: "상급 종합병원의 맞춤 프로그램 — 병원과 범위를 직접 선택." },
      includes: {
        en: ["Choose your hospital", "Customizable scope", "PET-CT add-on available", "VIP screening option", "Coordinator support"],
        ko: ["병원 직접 선택", "범위 맞춤 구성", "PET-CT 추가 가능", "VIP 검진 옵션", "코디네이터 지원"],
      },
    },
    {
      id: "mri-scan", tag: { en: "NEW", ko: "신규" },
      name: { en: "MRI & CT Scan", ko: "MRI·CT 스캔" }, price: { en: "From USD 349", ko: "USD 349~" },
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
      desc: { en: "Targeted MRI and low-dose CT scans — choose by body region, from a 3-minute lung scan to a full skeletal and neurological assessment.", ko: "부위별 정밀 MRI·저선량 CT 스캔 — 3분 폐 스캔부터 전신 근골격·신경 평가까지 원하는 범위를 선택." },
      includes: {
        en: ["MRI Scan (Head/Neck/Abdomen/Pelvis)", "MRI with Spine", "MRI with Skeletal & Neurological", "Heart CT (CAC score)", "Lung CT"],
        ko: ["MRI 스캔(머리/목/복부/골반)", "MRI + 척추", "MRI + 근골격·신경 평가", "심장 CT(CAC 점수)", "폐 CT"],
      },
    },
  ],
};

/* ---------------- MRI·CT Scan menu (mri-scan 상세 — Ezra식 스캔 메뉴) ---------------- */
export const SCAN_MENU = {
  groups: [
    {
      id: "mri", label: { en: "MRI Scans", ko: "MRI 스캔" },
      items: [
        {
          id: "mri", name: { en: "MRI Scan", ko: "MRI 스캔" }, price: "$999",
          time: { en: "22 min", ko: "22분" }, tag: { en: "No radiation", ko: "방사선 없음" },
          desc: {
            en: "Scans for signs of hundreds of potential conditions, including early signs of cancer of the brain, thyroid, liver, gallbladder, pancreas, spleen, kidneys, adrenal glands, bladder, ovaries, uterus, and prostate.",
            ko: "뇌·갑상선·간·담낭·췌장·비장·신장·부신·방광·난소·자궁·전립선의 암 초기 징후를 포함해 수백 가지 잠재 질환의 징후를 검사합니다.",
          },
          includes: { en: ["Head", "Neck", "Abdomen", "Pelvis"], ko: ["머리", "목", "복부", "골반"] },
          note: { en: "Also helps detect signs of prior stroke, sinus inflammation, fatty liver, uterine fibroids, and abdominal aortic aneurysm.", ko: "과거 뇌졸중, 부비동 염증, 지방간, 자궁근종, 복부대동맥류의 징후 발견에도 도움이 됩니다." },
        },
        {
          id: "mri-spine", name: { en: "MRI Scan with Spine", ko: "MRI 스캔 + 척추" }, price: "$1,699",
          time: { en: "47 min", ko: "47분" }, tag: { en: "No radiation", ko: "방사선 없음" },
          desc: {
            en: "Everything in the MRI Scan, plus spine coverage to look for signs of spinal lesions and tumors, herniated discs, cervical spinal stenosis, spondylosis, fractures, scoliosis, arthritis, and other degenerative changes.",
            ko: "MRI 스캔의 모든 항목에 더해, 척추 병변·종양, 추간판 탈출(디스크), 경추 척추관 협착, 척추증, 골절, 척추측만, 관절염 등 퇴행성 변화의 징후를 확인하는 척추 영역을 포함합니다.",
          },
          includes: { en: ["Head", "Neck", "Abdomen", "Pelvis", "Spine"], ko: ["머리", "목", "복부", "골반", "척추"] },
        },
        {
          id: "mri-skeletal", name: { en: "MRI Scan with Skeletal and Neurological Assessment", ko: "MRI 스캔 + 근골격·신경 평가" }, price: "$3,999",
          time: { en: "2 × ~60 min sessions", ko: "약 60분 × 2회" }, tag: { en: "No radiation", ko: "방사선 없음" },
          desc: {
            en: "Everything in the MRI Scan with Spine, plus looks for signs of neurodegeneration in the brain and narrowing in the arteries of the head and neck, and provides a brain age analysis.",
            ko: "MRI 척추 스캔의 모든 항목에 더해, 뇌의 신경퇴행 징후와 머리·목 동맥의 협착을 확인하고 뇌 나이 분석을 제공합니다.",
          },
          includes: {
            en: ["Head", "Neck", "Abdomen", "Pelvis", "Spine", "Musculoskeletal Assessment (Hips/Knees)", "MR Angiogram (Head/Neck)", "Brain Analysis", "Body Composition Profiling"],
            ko: ["머리", "목", "복부", "골반", "척추", "근골격 평가(고관절/무릎)", "MR 혈관조영(머리/목)", "뇌 분석", "체성분 프로파일링"],
          },
          note: { en: "Also includes body composition assessment (fat and muscle volume), hip evaluation (labrum, cartilage, and joint health), and knee scans (for meniscus, ACL, and MCL injuries).", ko: "체성분 평가(지방·근육량), 고관절 평가(관절와순·연골·관절 건강), 무릎 스캔(반월상연골·ACL·MCL 손상)도 포함합니다." },
        },
      ],
    },
    {
      id: "ct", label: { en: "CT Scans", ko: "CT 스캔" },
      items: [
        {
          id: "ct-heart", name: { en: "Heart CT Scan", ko: "심장 CT 스캔" }, price: "$349",
          time: { en: "5 min", ko: "5분" }, tag: { en: "Low-dose", ko: "저선량" },
          desc: {
            en: "This low-dose CT scan measures calcium buildup in the arteries of the heart (coronary arteries), with a coronary artery calcium (CAC) score to assess long-term cardiovascular risk. The images are timed with the heartbeat to avoid blurriness from the heart's normal movement and rhythm.",
            ko: "저선량 CT 스캔으로 심장 동맥(관상동맥)의 칼슘 침착을 측정하고, 관상동맥 칼슘(CAC) 점수로 장기 심혈관 위험을 평가합니다. 심장 박동에 맞춰 촬영해 움직임으로 인한 흐림을 방지합니다.",
          },
          includes: { en: ["Gated Coronary Artery Calcium (CAC) Score"], ko: ["게이팅 관상동맥 칼슘(CAC) 점수"] },
        },
        {
          id: "ct-lung", name: { en: "Lung CT Scan", ko: "폐 CT 스캔" }, price: "$399",
          time: { en: "3 min", ko: "3분" }, tag: { en: "Low-dose", ko: "저선량" },
          desc: {
            en: "This low-dose CT scan can help detect early signs of lung cancer, lung nodules or masses, emphysema, and other lung or airway abnormalities. May comment on overall heart size.",
            ko: "저선량 CT 스캔으로 폐암 초기 징후, 폐 결절·종괴, 폐기종 및 기타 폐·기도 이상을 조기에 발견할 수 있습니다. 전반적인 심장 크기에 대한 소견을 포함할 수 있습니다.",
          },
          includes: { en: ["Lungs and surrounding chest structures"], ko: ["폐 및 주변 흉부 구조"] },
          note: { en: "Chest CT also looks for enlarged lymph nodes in the center of the chest and signs of inflammation or scarring in the lung tissue.", ko: "흉부 CT는 흉부 중앙의 림프절 비대와 폐 조직의 염증·반흔 징후도 확인합니다." },
        },
      ],
    },
  ],
  why: {
    title: { en: "Why our members choose MRI and CT scans", ko: "왜 MRI·CT 스캔을 선택할까요" },
    note: { en: "Download your scan to share with your healthcare provider.", ko: "스캔 결과를 내려받아 담당 의료진과 공유할 수 있습니다." },
    points: [
      { t: { en: "Detailed report and insights", ko: "상세 리포트와 인사이트" }, d: { en: "Receive findings unique to you, with direct outreach if anything is urgent.", ko: "개인 맞춤 소견을 받고, 긴급 사항이 있으면 직접 안내해 드립니다." } },
      { t: { en: "AI-assisted imaging", ko: "AI 영상 분석" }, d: { en: "State-of-the-art AI image enhancement, plus AI-assisted medical reports.", ko: "최신 AI 영상 보정과 AI 보조 판독 리포트를 제공합니다." } },
      { t: { en: "Personal Care Advisor", ko: "전담 케어 어드바이저" }, d: { en: "We support you at every step of your journey toward better health.", ko: "더 건강한 삶을 위한 여정의 모든 단계를 함께합니다." } },
      { t: { en: "Radiologist-approved protocols", ko: "전문의 승인 프로토콜" }, d: { en: "Scan protocols developed with MRI technologists and approved by radiologists.", ko: "영상의학 기사와 함께 개발하고 영상의학과 전문의가 승인한 스캔 프로토콜을 사용합니다." } },
    ],
  },
};

/* ---------------- Why Korea, specifically? (다크 통계) ---------------- */
export const WHY = {
  title: { en: "Why Korea, specifically?", ko: "왜 한국인가요?" },
  sub: { en: "World-class outcomes, advanced technology, and exceptional value.", ko: "세계적 수준의 결과, 첨단 기술, 그리고 탁월한 가치." },
  stats: [
    { big: "60-70%", label: { en: "Cost Savings", ko: "비용 절감" }, sub: { en: "Lower than equivalent care in the U.S.", ko: "미국 동일 진료 대비 절감" } },
    { big: "No. 2", label: { en: "Health Care Index", ko: "의료 품질 지수" }, sub: { en: "Korea ranked No. 2 globally in Healthcare Quality in 2024.", ko: "2024년 의료 품질 세계 2위." } },
    { big: "2X", label: { en: "Detection Rates", ko: "조기 발견율" }, sub: { en: "Early cancer detection rates in Korea are about twice the OECD average.", ko: "한국의 암 조기 발견율은 OECD 평균의 약 2배." } },
  ],
};

/* ---------------- Revital (7 specialties) ---------------- */
export const REVITAL = {
  eyebrow: { en: "Revital", ko: "리바이탈" },
  title: { en: "Revital", ko: "리바이탈" },
  sub: {
    en: "Beyond checkups — specialized treatments to look and feel your best, at Korea's leading clinics.",
    ko: "검진을 넘어 — 한국 대표 클리닉에서 최상의 컨디션을 위한 전문 시술.",
  },
  items: [
    { id: "ophthalmology", en: "Ophthalmology", ko: "안과", image: "https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=800&q=80", lead: { en: "SMILE LASIK & vision correction", ko: "스마일 라식·시력 교정" } },
    { id: "dental", en: "Dental", ko: "치과", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80", lead: { en: "Implants, whitening & orthodontics", ko: "임플란트·미백·교정" } },
    { id: "plastic-surgery", en: "Plastic Surgery", ko: "성형외과", image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=800&q=80", lead: { en: "Aesthetic & reconstructive surgery", ko: "미용·재건 성형" } },
    { id: "dermatology", en: "Dermatology", ko: "피부과", image: "https://images.unsplash.com/photo-1612908689435-744b8b0a0c46?w=800&q=80", lead: { en: "Skin rejuvenation & laser care", ko: "피부 재생·레이저 케어" } },
    { id: "hair-loss", en: "Hair Loss", ko: "모발이식", image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80", lead: { en: "Hair transplant & restoration", ko: "모발이식·복원" } },
    { id: "interventional-radiology", en: "Interventional Radiology", ko: "인터벤션 영상의학", image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80", lead: { en: "Minimally-invasive image-guided care", ko: "최소 침습 영상유도 시술" } },
    { id: "urology", en: "Urology", ko: "비뇨의학과", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80", lead: { en: "Men's health & urologic care", ko: "남성 건강·비뇨기 진료" } },
  ],
};

/* ---------------- 부가 서비스 (Transportation / Accommodation / Tour / Association) ---------------- */
export const SERVICES = [
  { id: "health-checkup", en: "Health Check-up", ko: "건강검진", icon: "Stethoscope", path: "/service/health-checkup",
    desc: { en: "Comprehensive, MRI and hospital-based checkups.", ko: "종합·MRI·병원 지정 검진." } },
  { id: "revital", en: "Revital", ko: "리바이탈", icon: "Sparkles", path: "/service/revital",
    desc: { en: "Ophthalmology, dental, dermatology and more.", ko: "안과·치과·피부과 등 전문 시술." } },
  { id: "transportation", en: "Transportation", ko: "교통", icon: "Car", path: "/service/transportation",
    desc: { en: "Airport pickup and in-Korea transfers arranged.", ko: "공항 영접과 한국 내 이동을 준비합니다." } },
  { id: "accommodation", en: "Accommodation", ko: "숙박", icon: "Hotel", path: "/service/accommodation",
    desc: { en: "Hospital-adjacent hotels and recovery stays.", ko: "병원 인근 호텔과 회복 숙소." } },
  { id: "tour", en: "Tour", ko: "투어", icon: "Map", path: "/service/tour",
    desc: { en: "Curated Korea experiences between appointments.", ko: "일정 사이 한국을 즐기는 큐레이션 투어." } },
  { id: "association", en: "Association", ko: "제휴", icon: "Handshake", path: "/service/association",
    desc: { en: "Partner clinics, insurers and referral programs.", ko: "제휴 클리닉·보험사·추천 프로그램." } },
];

/* ---------------- 파트너 병원 (Providers) — prototype demo.html 데이터 동일 ---------------- */
// 전문영역(Specialty) 드롭다운 — 스펙 9종 순서대로
export const PROVIDER_DEPTS = [
  { id: "screen", en: "Health Screening", ko: "건강검진" },
  { id: "general", en: "General Hospital", ko: "종합병원" },
  { id: "derm", en: "Dermatology", ko: "피부과" },
  { id: "plastic", en: "Plastic Surgery", ko: "성형외과" },
  { id: "ophth", en: "Ophthalmology", ko: "안과" },
  { id: "dental", en: "Dentistry", ko: "치과" },
  { id: "obgyn", en: "OB/GYN", ko: "산부인과" },
  { id: "urology", en: "Urology", ko: "비뇨기과" },
  { id: "ortho", en: "Orthopedics", ko: "정형외과" },
];
// 통역 가능 언어(Languages) 드롭다운 — 스펙 7종
export const PROVIDER_LANGS = [
  { id: "en", en: "English", ko: "영어" },
  { id: "ja", en: "Japanese", ko: "일본어" },
  { id: "zh", en: "Chinese", ko: "중국어" },
  { id: "vi", en: "Vietnamese", ko: "베트남어" },
  { id: "th", en: "Thai", ko: "태국어" },
  { id: "ru", en: "Russian", ko: "러시아어" },
  { id: "ar", en: "Arabic", ko: "아랍어" },
];
export const PROVIDERS = [
  { id: "samsung-mc", name: { en: "Hangang Medical Center", ko: "한강메디컬센터" }, image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=1000&q=80", area: { en: "Gangnam-gu, Seoul", ko: "서울 강남구" }, rating: 4.9, reviews: 1482, accreditation: ["JCI", "ISO 9001", "KAHF"], departments: ["general", "screen", "derm", "ophth", "plastic", "dental", "obgyn", "ortho", "urology"], languages: ["en", "zh", "ru"], english_support: true, international_ward: true,
    // 병원 사진 갤러리 (어드민 실데이터 연동 전 큐레이션 — .gif URL도 그대로 재생됨)
    gallery: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&q=80", "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&q=80", "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1000&q=80", "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1000&q=80", "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1000&q=80", "https://images.unsplash.com/photo-1516069677018-378515003435?w=1000&q=80"],
    blurb: { en: "A leading tertiary hospital, recognized for oncology, cardiac care, and executive health programs. International Health Services with English, Mandarin, and Russian coordinators.", ko: "종양학·심장 치료·임원 건강검진으로 잘 알려진 대표 3차 병원. 국제진료센터에 영어·중국어·러시아어 코디네이터가 상주합니다." } },
  { id: "asan-mc", name: { en: "Songpa Medical Center", ko: "송파의료원" }, image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80", area: { en: "Songpa-gu, Seoul", ko: "서울 송파구" }, rating: 4.8, reviews: 1218, accreditation: ["JCI", "ISO 9001"], departments: ["general", "screen", "ortho", "ophth", "obgyn", "derm", "urology"], languages: ["en", "zh", "ja", "ru", "ar"], english_support: true, international_ward: true,
    blurb: { en: "Korea's largest tertiary hospital, renowned for liver transplantation, cardiothoracic surgery, and premium executive screening. 24-hour international coordinator line.", ko: "국내 최대 규모의 상급종합병원으로, 간 이식·흉부외과·프리미엄 건강검진 분야에서 세계적 명성을 얻고 있습니다. 24시간 국제진료 핫라인 운영." } },
  { id: "severance", name: { en: "Sinchon University Hospital", ko: "신촌대학교병원" }, image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80", area: { en: "Seodaemun-gu, Seoul", ko: "서울 서대문구" }, rating: 4.8, reviews: 982, accreditation: ["JCI", "ISO 9001", "KAHF"], departments: ["general", "screen", "ophth", "plastic", "dental", "obgyn", "ortho", "urology"], languages: ["en", "zh", "ru"], english_support: true, international_ward: true,
    blurb: { en: "A long-established Western-style hospital affiliated with a leading university college of medicine. Strong in ophthalmology, robotic surgery, and women's health.", ko: "국내 유수의 서양식 병원으로, 명문 의과대학 부속병원. 안과·로봇 수술·여성건강 분야에서 강세를 보입니다." } },
  { id: "seoul-saint-marys", name: { en: "Seocho Sacred Heart Hospital", ko: "서초성심병원" }, image: "https://images.unsplash.com/photo-1516069677018-378515003435?w=800&q=80", area: { en: "Seocho-gu, Seoul", ko: "서울 서초구" }, rating: 4.7, reviews: 614, accreditation: ["JCI", "KAHF"], departments: ["general", "screen", "ortho", "obgyn", "ophth", "urology"], languages: ["en", "zh"], english_support: true, international_ward: false,
    blurb: { en: "a leading university-affiliated hospital, known for hematology, bone marrow transplantation, and maternal-fetal medicine.", ko: "대표적인 대학 부속병원으로, 혈액학·조혈모세포 이식·모체태아의학에서 두각을 나타냅니다." } },
  { id: "jk-plastic", name: { en: "Apgujeong Line Plastic Surgery", ko: "압구정라인성형외과" }, image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=800&q=80", area: { en: "Gangnam-gu, Seoul", ko: "서울 강남구" }, rating: 4.9, reviews: 1604, accreditation: ["ISAPS Member", "KSAPS"], departments: ["plastic", "derm"], languages: ["en", "zh", "ja"], english_support: true, international_ward: false,
    blurb: { en: "Boutique plastic-surgery center on Apgujeong Rodeo, serving international patients since 2000. In-house interpreters and pickup service standard.", ko: "압구정 로데오 거리에 위치한 프리미엄 성형외과. 2000년부터 해외 환자를 진료해왔으며, 통역·픽업 서비스가 기본 제공됩니다." } },
  { id: "oracle-dental", name: { en: "Gangnam Bright Dental Clinic", ko: "강남브라이트치과" }, image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80", area: { en: "Gangnam-gu, Seoul", ko: "서울 강남구" }, rating: 4.8, reviews: 486, accreditation: ["KDA"], departments: ["dental"], languages: ["en"], english_support: true, international_ward: false,
    blurb: { en: "Premium multi-specialty dental group. Implants, digital veneers, clear-aligner ortho, full-mouth rehabilitation.", ko: "강남 플래그십을 둔 프리미엄 복합 치과 그룹. 임플란트·디지털 라미네이트·투명교정·풀마우스 치료." } },
  { id: "snuh", name: { en: "Jongno Central Hospital", ko: "종로중앙병원" }, image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80", area: { en: "Jongno-gu, Seoul", ko: "서울 종로구" }, rating: 4.7, reviews: 721, accreditation: ["JCI", "KAHF"], departments: ["general", "screen", "ortho", "ophth", "obgyn", "urology"], languages: ["en", "zh", "vi", "ar"], english_support: true, international_ward: true,
    blurb: { en: "Korea's leading public tertiary hospital, with an international healthcare center and rare-disease clinic.", ko: "국내 대표 공공 상급종합병원으로, 국제진료센터와 희귀질환 클리닉을 운영합니다." } },
];

/* ---------------- 방문자 후기 ---------------- */
export const REVIEWS = [
  { id: "r1", rating: 5, image: "https://images.unsplash.com/photo-1645066928295-2506defde470?w=400&q=80&fit=facearea&facepad=3",
    text: { en: "I looked for a SMILE LASIK clinic for the same day as the eye exam and CareBridge arranged everything perfectly.", ko: "안과 검진 당일에 받을 수 있는 스마일 라식 클리닉을 찾았는데 CareBridge이 모든 걸 완벽히 준비해줬어요." },
    author: { en: "Michael R.", ko: "마이클 R." }, source: { en: "Gangnam Seoul Bright Eye Clinic", ko: "강남서울밝은안과" }, treatment: { en: "SMILE LASIK", ko: "스마일 라식" } },
  { id: "r2", rating: 5, image: "https://images.unsplash.com/photo-1642975967602-653d378f3b5b?w=400&q=80&fit=facearea&facepad=3",
    text: { en: "I was able to get the partnered discount without any issues, and the staff kindly brought tea while I was waiting.", ko: "제휴 할인을 문제없이 받았고, 기다리는 동안 직원분이 친절하게 차도 내주셨어요." },
    author: { en: "Sarah L.", ko: "사라 L." }, source: { en: "Gangnam Seoul Bright Eye Clinic", ko: "강남서울밝은안과" }, treatment: { en: "Dermatology", ko: "피부과" } },
  { id: "r3", rating: 5, image: "https://images.unsplash.com/photo-1730597842283-943c7986ee2c?w=400&q=80&fit=facearea&facepad=3",
    text: { en: "I got my eyes treated with SMILE LASIK here and I'm truly satisfied with the results — clear vision in 48 hours.", ko: "여기서 스마일 라식을 받았는데 결과에 정말 만족해요 — 48시간 만에 선명한 시야." },
    author: { en: "James T.", ko: "제임스 T." }, source: { en: "Gangnam Seoul Bright Eye Clinic", ko: "강남서울밝은안과" }, treatment: { en: "SMILE LASIK", ko: "스마일 라식" } },
];

/* ---------------- FAQ (필터: All / Checkup / Revital / Common) ---------------- */
export const FAQ_CATS = [
  { id: "all", en: "All", ko: "전체" },
  { id: "checkup", en: "Checkup", ko: "검진" },
  { id: "revital", en: "Revital", ko: "리바이탈" },
  { id: "common", en: "Common", ko: "공통" },
];
export const FAQS = [
  { cat: "checkup", q: { en: "What is the difference between MRI and MRA?", ko: "MRI와 MRA의 차이는 무엇인가요?" },
    a: { en: "MRI images organs and soft tissues to detect tumors and abnormalities, while MRA focuses on blood vessels to screen for aneurysms and stenosis. Our whole-body package includes both.", ko: "MRI는 장기·연조직을 촬영해 종양과 이상을 찾고, MRA는 혈관에 집중해 동맥류·협착을 검사합니다. 전신 패키지에는 두 가지가 모두 포함됩니다." } },
  { cat: "common", q: { en: "Is tax refund available for medical services in Korea?", ko: "한국 의료 서비스에 세금 환급이 가능한가요?" },
    a: { en: "Yes. Many cosmetic and selected medical services qualify for a foreigner tax refund. CareBridge issues the required documents at checkout so you can claim it at the airport.", ko: "네. 다수의 미용 및 일부 의료 서비스는 외국인 세금 환급 대상입니다. CareBridge이 결제 시 필요 서류를 발급해 드려 공항에서 환급받으실 수 있습니다." } },
  { cat: "common", q: { en: "What is the refund policy if I cancel my reservation?", ko: "예약을 취소하면 환불 정책은 어떻게 되나요?" },
    a: { en: "A full refund is available if you cancel before the confirmation deadline. After confirmation, a 50% refund of the paid amount applies depending on timing.", ko: "확정 기한 이전 취소 시 전액 환불됩니다. 확정 이후에는 시점에 따라 결제 금액의 50%가 환불됩니다." } },
  { cat: "common", q: { en: "Do I pay through CareBridge or directly at the hospital?", ko: "CareBridge을 통해 결제하나요, 병원에서 직접 결제하나요?" },
    a: { en: "You pay a 50% deposit through CareBridge at the time of booking. The remaining balance is settled directly at the hospital after your visit.", ko: "예약 시 CareBridge을 통해 50% 예약금을 결제하고, 잔액은 방문 후 병원에서 직접 정산합니다." } },
  { cat: "common", q: { en: "What payment methods are available?", ko: "어떤 결제 수단을 사용할 수 있나요?" },
    a: { en: "On the CareBridge website, payments can be made via PayPal or major credit cards. On-site hospital payments accept cards and cash.", ko: "CareBridge 웹사이트에서는 PayPal 또는 주요 신용카드로 결제할 수 있습니다. 병원 현장 결제는 카드와 현금이 가능합니다." } },
  { cat: "revital", q: { en: "Can I book Revital treatments on the same trip as my checkup?", ko: "검진과 같은 일정에 리바이탈 시술을 예약할 수 있나요?" },
    a: { en: "Absolutely. Our coordinators schedule Revital procedures around your checkup so you can complete everything in one visit to Korea.", ko: "물론입니다. 코디네이터가 검진 일정에 맞춰 리바이탈 시술을 조율하여 한 번의 한국 방문으로 모두 마칠 수 있도록 합니다." } },
];

/* ---------------- 인증 (Officially Certified by the Korean Government) ---------------- */
export const CERTS = {
  title: { en: "Officially Certified by the Korean Government.", ko: "대한민국 정부 공식 인증." },
  orgs: [
    { mark: "MEDICAL KOREA", sub: { en: "Medical Korea", ko: "메디컬 코리아" } },
    { mark: "MOHW", sub: { en: "Ministry of Health and Welfare", ko: "보건복지부" } },
    { mark: "KHIDI", sub: { en: "Korea Health Industry Development Institute", ko: "한국보건산업진흥원" } },
  ],
};

/* ---------------- 블로그 ---------------- */
/* 블로그 카테고리 레지스트리 — 리스트 필터 탭 + 아티클 카테고리 뱃지에 사용.
   ListeningMind /all 의 카테고리 필터 바 패턴. all 은 코드에서 자동 프리펜드. */
export const BLOG_CATS = [
  { id: "checkup", en: "Health Checkup", ko: "건강검진" },
  { id: "procedure", en: "Procedures", ko: "시술·수술" },
  { id: "guide", en: "Travel Guide", ko: "여행 가이드" },
  { id: "insight", en: "Insights", ko: "인사이트" },
];

/* ============================================================================
   콘텐츠 시드 버전 — 시드(data.js) 콘텐츠를 의미있게 바꿀 때마다 이 값을 올린다.
   방문자 브라우저에 남은 옛 localStorage 오버라이드(admin 미발행 편집)가
   신규 배포 콘텐츠를 덮어써 옛 내용이 계속 보이는 문제를 방지한다:
   hydrate 시 저장된 버전과 다르면 옛 오버라이드를 자동 폐기 → 신규 시드 우선.
   ========================================================================== */
export const SEED_VERSION = "2026-07-03.blog-2";

/* 블로그 포스트 — ListeningMind 아티클 구조 반영:
   category(뱃지·필터) · author · read(분) · cover image · sections[](TOC 자동 생성).
   section: { id(앵커), h(제목), p[](문단) }. 첫 문단은 발췌(excerpt)로도 사용. */
export const BLOG = [
  {
    id: "korea-checkup-guide", date: "2026-05-20", category: "checkup", read: 7, views: 4200,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80",
    title: { en: "A Foreigner's Guide to Health Checkups in Korea", ko: "외국인을 위한 한국 건강검진 가이드" },
    excerpt: { en: "What to expect, what's included, and how to choose the right package — from booking to reading your report.", ko: "예약부터 리포트 해석까지 — 무엇을 기대하고, 무엇이 포함되며, 알맞은 패키지를 고르는 법." },
    sections: [
      { id: "why-korea", h: { en: "Why Korea for a health checkup", ko: "왜 한국에서 건강검진을 받을까" },
        p: [
          { en: "Korea's checkup centers combine speed, advanced imaging and value in a single half-day visit. A comprehensive package that takes weeks to arrange elsewhere is often completed before lunch here.", ko: "한국의 검진센터는 속도·첨단 영상장비·가치를 반나절 방문에 모두 담아냅니다. 다른 나라에서는 수 주가 걸리는 종합검진이 이곳에서는 점심 전에 끝나기도 합니다." },
          { en: "For international patients, the appeal is not only the technology but the coordination: interpreters, transport and reservations handled end to end.", ko: "해외 환자에게 매력은 기술만이 아닙니다. 통역·이동·예약까지 처음부터 끝까지 조율되는 편리함이 핵심입니다." },
        ] },
      { id: "packages", h: { en: "Choosing the right package", ko: "알맞은 패키지 고르기" },
        p: [
          { en: "Basic packages cover blood work, an abdominal ultrasound and a chest X-ray. Premium tiers add endoscopy, low-dose CT and brain MRI. Start from your age, family history and the organs you want screened.", ko: "기본 패키지는 혈액검사·복부초음파·흉부 X-ray를 포함합니다. 프리미엄은 내시경·저선량 CT·뇌 MRI가 더해집니다. 나이·가족력·검진하고 싶은 장기를 기준으로 선택하세요." },
        ] },
      { id: "day-of", h: { en: "The day of your checkup", ko: "검진 당일 흐름" },
        p: [
          { en: "Fast for 8 hours beforehand. On arrival you'll change, complete a questionnaire, then move through stations in sequence. Results for most items are ready the same day, with a doctor's consultation to close.", ko: "8시간 금식 후 방문합니다. 도착하면 검진복으로 갈아입고 문진표를 작성한 뒤 순서대로 검사 스테이션을 이동합니다. 대부분 항목은 당일 결과가 나오며, 의사 상담으로 마무리합니다." },
        ] },
      { id: "report", h: { en: "Reading your report", ko: "리포트 해석하기" },
        p: [
          { en: "CareBridge issues a translated report and, when needed, connects you with a specialist for follow-up back home. Keep the file — it's the baseline for your next visit.", ko: "케어브릿지은 번역된 리포트를 발급하고, 필요 시 귀국 후 추적을 위해 전문의를 연결합니다. 파일은 보관하세요. 다음 검진의 기준선이 됩니다." },
        ] },
    ],
  },
  {
    id: "smile-lasik-korea", date: "2026-05-12", category: "procedure", read: 5, views: 5100,
    author: { en: "Dr. J. Kim", ko: "김 원장" },
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=80",
    title: { en: "Why SMILE LASIK Is So Popular in Korea", ko: "한국에서 스마일 라식이 인기 있는 이유" },
    excerpt: { en: "Minimally-invasive, fast recovery, and surgeons who perform high volumes with strong outcomes.", ko: "최소 침습, 빠른 회복, 그리고 높은 시술량과 우수한 결과를 갖춘 의료진." },
    sections: [
      { id: "what-is-smile", h: { en: "What makes SMILE different", ko: "스마일이 다른 점" },
        p: [
          { en: "SMILE uses a tiny 2–4mm incision instead of the larger flap of traditional LASIK. Less surface disruption means faster healing and noticeably less dry eye.", ko: "스마일은 전통 라식의 큰 절편 대신 2~4mm의 작은 절개를 사용합니다. 표면 손상이 적어 회복이 빠르고 안구건조가 눈에 띄게 적습니다." },
        ] },
      { id: "volume", h: { en: "High volume, refined technique", ko: "높은 시술량, 정교해진 기술" },
        p: [
          { en: "Seoul's leading clinics perform SMILE at scale, and that repetition sharpens outcomes. Ask for the surgeon's case count and complication rate — reputable centers share it openly.", ko: "서울의 선도 클리닉은 스마일을 대량으로 시행하며, 그 반복이 결과를 정교하게 만듭니다. 집도의의 케이스 수와 합병증률을 물어보세요. 신뢰할 만한 센터는 이를 투명하게 공개합니다." },
        ] },
      { id: "candidate", h: { en: "Are you a candidate?", ko: "나는 대상이 될까?" },
        p: [
          { en: "Stable prescription, healthy corneal thickness and no active eye disease are the baseline. A pre-op exam confirms fit; CareBridge can arrange it on the same trip as your consultation.", ko: "안정된 도수, 충분한 각막 두께, 활동성 안질환이 없는 것이 기본 조건입니다. 수술 전 검사로 적합성을 확인하며, 케어브릿지이 상담과 같은 일정으로 잡아드립니다." },
        ] },
    ],
  },
  {
    id: "tax-refund-medical", date: "2026-04-28", category: "guide", read: 4, views: 2600,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    title: { en: "Medical Tax Refund for Foreign Patients", ko: "외국인 환자를 위한 의료 세금 환급" },
    excerpt: { en: "Selected services qualify for a foreigner tax refund. Here's how to claim it at the airport, step by step.", ko: "일부 서비스는 외국인 세금 환급 대상입니다. 공항에서 단계별로 환급받는 법을 안내합니다." },
    sections: [
      { id: "eligible", h: { en: "What qualifies", ko: "환급 대상" },
        p: [
          { en: "Cosmetic and selected elective procedures at registered clinics qualify for a foreigner medical tax refund. Your clinic marks eligibility on the receipt at checkout.", ko: "등록된 의료기관의 미용·일부 선택 시술은 외국인 의료 세금 환급 대상입니다. 결제 시 병원이 영수증에 대상 여부를 표시합니다." },
        ] },
      { id: "documents", h: { en: "Keep these documents", ko: "챙겨야 할 서류" },
        p: [
          { en: "Hold on to the tax-refund receipt and the documents CareBridge issues. You'll need your passport and the original receipts at the kiosk.", ko: "세금환급 영수증과 케어브릿지이 발급한 서류를 보관하세요. 키오스크에서 여권과 원본 영수증이 필요합니다." },
        ] },
      { id: "airport", h: { en: "Claiming at the airport", ko: "공항에서 환급받기" },
        p: [
          { en: "Before departure, scan your documents at the airport refund kiosk and receive cash or a card refund. Allow extra time during peak travel hours.", ko: "출국 전 공항 환급 키오스크에서 서류를 스캔하고 현금 또는 카드로 환급받으세요. 성수기에는 여유 시간을 두세요." },
        ] },
    ],
  },
  {
    id: "recovery-stay-seoul", date: "2026-04-15", category: "guide", read: 6, views: 1800,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    title: { en: "Where to Recover in Seoul After a Procedure", ko: "시술 후 서울에서 회복하기 좋은 곳" },
    excerpt: { en: "Quiet neighborhoods, aftercare-friendly stays and how to plan a comfortable recovery window.", ko: "조용한 동네, 회복에 좋은 숙소, 그리고 편안한 회복 기간을 계획하는 법." },
    sections: [
      { id: "window", h: { en: "Plan your recovery window", ko: "회복 기간 계획하기" },
        p: [
          { en: "Match your stay to the procedure. A day checkup needs no downtime; surgery may call for several quiet days near your clinic before you're cleared to fly.", ko: "시술에 맞춰 체류 기간을 정하세요. 당일 검진은 휴식이 필요 없지만, 수술은 귀국 허가 전 병원 근처에서 며칠의 안정이 필요할 수 있습니다." },
        ] },
      { id: "stays", h: { en: "Aftercare-friendly stays", ko: "회복에 좋은 숙소" },
        p: [
          { en: "Look for step-free access, room service and proximity to your clinic. CareBridge can book partner stays with late checkout and airport transfers built in.", ko: "계단 없는 동선, 룸서비스, 병원과의 근접성을 확인하세요. 케어브릿지은 늦은 체크아웃과 공항 이동이 포함된 제휴 숙소를 예약해 드립니다." },
        ] },
      { id: "neighborhoods", h: { en: "Calm neighborhoods", ko: "차분한 동네" },
        p: [
          { en: "Seocho, Yeonnam and parts of Gangnam offer quiet streets, pharmacies and cafés within walking distance — ideal while you take it easy.", ko: "서초·연남·강남 일부는 조용한 거리와 약국·카페가 도보권에 있어 편히 쉬기에 좋습니다." },
        ] },
    ],
  },
  {
    id: "dental-implant-value", date: "2026-03-30", category: "procedure", read: 5, views: 3400,
    author: { en: "Dr. S. Park", ko: "박 원장" },
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=80",
    title: { en: "Dental Implants in Korea: Quality Meets Value", ko: "한국의 임플란트: 품질과 가치의 균형" },
    excerpt: { en: "Why patients travel for implants — digital planning, same-week workflows and transparent pricing.", ko: "환자들이 임플란트를 위해 한국을 찾는 이유 — 디지털 설계, 당주 진행, 투명한 가격." },
    sections: [
      { id: "digital", h: { en: "Digital, precise planning", ko: "디지털 정밀 설계" },
        p: [
          { en: "3D scans and guided surgery let Korean clinics place implants with tight precision, shortening chair time and improving fit.", ko: "3D 스캔과 가이드 수술로 한국 클리닉은 임플란트를 정밀하게 식립합니다. 진료 시간을 줄이고 적합도를 높입니다." },
        ] },
      { id: "timeline", h: { en: "A realistic timeline", ko: "현실적인 일정" },
        p: [
          { en: "Osseointegration still takes months, but the surgical and prosthetic visits can be compressed. Plan two trips, or a single longer stay with CareBridge coordinating both stages.", ko: "골유착에는 여전히 수개월이 걸리지만, 수술과 보철 방문은 압축할 수 있습니다. 두 번의 방문 또는 케어브릿지이 두 단계를 조율하는 한 번의 긴 체류를 계획하세요." },
        ] },
    ],
  },
  {
    id: "medical-visa-korea", date: "2026-03-18", category: "insight", read: 6, views: 2900,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
    title: { en: "Understanding Korea's Medical Visa", ko: "한국 의료 비자 완전 정복" },
    excerpt: { en: "Who needs one, what documents to prepare, and how CareBridge supports your application.", ko: "누가 필요하고, 어떤 서류를 준비하며, 케어브릿지이 신청을 어떻게 돕는지." },
    sections: [
      { id: "who", h: { en: "Who needs a medical visa", ko: "누가 의료 비자가 필요한가" },
        p: [
          { en: "Short checkups often fit within a tourist entry, but longer treatment or repeated visits may call for a C-3-3 or G-1-10 medical visa. Your treatment plan determines the route.", ko: "짧은 검진은 관광 입국으로 가능하지만, 장기 치료나 반복 방문은 C-3-3 또는 G-1-10 의료 비자가 필요할 수 있습니다. 치료 계획이 경로를 결정합니다." },
        ] },
      { id: "documents", h: { en: "Documents to prepare", ko: "준비할 서류" },
        p: [
          { en: "You'll typically need a treatment confirmation from the hospital, proof of funds and travel details. CareBridge issues the medical documentation invitation letters rely on.", ko: "보통 병원의 진료 확인서, 재정 증빙, 여행 정보가 필요합니다. 케어브릿지은 초청장이 근거로 삼는 의료 서류를 발급합니다." },
        ] },
      { id: "support", h: { en: "How CareBridge helps", ko: "케어브릿지의 지원" },
        p: [
          { en: "From the invitation letter to appointment scheduling that matches your visa window, we align the paperwork with your itinerary so nothing stalls at the consulate.", ko: "초청장부터 비자 기간에 맞춘 예약까지, 서류와 일정을 정렬해 영사관에서 지체되는 일이 없도록 합니다." },
        ] },
    ],
  },
  {
    id: "kbeauty-dermatology", date: "2026-05-06", category: "procedure", read: 6, views: 4800,
    author: { en: "Dr. H. Lee", ko: "이 원장" },
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&q=80",
    title: { en: "K-Beauty Dermatology: What to Know Before You Go", ko: "K-뷰티 피부과: 가기 전에 알아둘 것" },
    excerpt: { en: "Lasers, injectables and skin-boosters — how to plan safe, effective treatments on a short trip.", ko: "레이저·주사·스킨부스터 — 짧은 일정에서 안전하고 효과적인 시술을 계획하는 법." },
    sections: [
      { id: "popular-treatments", h: { en: "Popular treatments", ko: "인기 시술" },
        p: [
          { en: "Laser toning, fractional resurfacing, injectables and skin-boosters lead the menu. Match the treatment to your recovery time — some leave redness for a few days.", ko: "레이저 토닝·프락셔널·주사·스킨부스터가 대표적입니다. 회복 시간에 맞춰 시술을 선택하세요. 일부는 며칠간 홍조가 남습니다." },
        ] },
      { id: "planning", h: { en: "Planning a short trip", ko: "짧은 일정 계획하기" },
        p: [
          { en: "Book a consultation first, then space sessions across a few days. CareBridge lines up an English- or Arabic-speaking coordinator so nothing gets lost in translation.", ko: "먼저 상담을 예약하고 세션을 며칠에 나눠 배치하세요. 케어브릿지은 영어·아랍어 코디네이터를 배정해 소통 착오를 막습니다." },
        ] },
    ],
  },
  {
    id: "hair-transplant-korea", date: "2026-04-22", category: "procedure", read: 6, views: 3900,
    author: { en: "Dr. S. Park", ko: "박 원장" },
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&q=80",
    title: { en: "Hair Transplant in Korea: Methods and Recovery", ko: "한국 모발이식: 방법과 회복" },
    excerpt: { en: "FUE vs. FUT, realistic graft counts, and what the first two weeks actually look like.", ko: "FUE와 FUT 비교, 현실적인 모낭 수, 그리고 첫 2주 실제 경과." },
    sections: [
      { id: "methods", h: { en: "FUE vs. FUT", ko: "FUE와 FUT" },
        p: [
          { en: "FUE extracts individual follicles with no linear scar and a faster return to normal; FUT can move more grafts in one session. Your density goals decide the method.", ko: "FUE는 모낭을 하나씩 채취해 선형 흉터가 없고 회복이 빠릅니다. FUT는 한 번에 더 많은 모낭을 옮길 수 있습니다. 원하는 밀도가 방법을 결정합니다." },
        ] },
      { id: "recovery", h: { en: "The first two weeks", ko: "첫 2주" },
        p: [
          { en: "Expect mild swelling and scabbing that settles within 10–14 days. CareBridge schedules a follow-up check and arranges a cap-friendly recovery stay.", ko: "가벼운 부기와 딱지가 10~14일 내 가라앉습니다. 케어브릿지은 경과 확인을 예약하고 모자 착용이 편한 회복 숙소를 마련합니다." },
        ] },
    ],
  },
  {
    id: "cancer-screening-packages", date: "2026-04-08", category: "checkup", read: 7, views: 3100,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: "https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=1200&q=80",
    title: { en: "Cancer Screening Packages Explained", ko: "암 검진 패키지 완전 정리" },
    excerpt: { en: "PET-CT, endoscopy and tumor markers — what each test finds and who should consider it.", ko: "PET-CT·내시경·종양표지자 — 각 검사가 무엇을 찾고 누구에게 권장되는지." },
    sections: [
      { id: "what-tests", h: { en: "What each test finds", ko: "각 검사가 찾는 것" },
        p: [
          { en: "PET-CT scans the whole body for metabolic hotspots, endoscopy inspects the GI tract directly, and blood tumor markers flag risk to follow up. They work best combined.", ko: "PET-CT는 전신의 대사 이상을 스캔하고, 내시경은 소화관을 직접 관찰하며, 혈액 종양표지자는 추적할 위험 신호를 알려줍니다. 함께 조합할 때 가장 효과적입니다." },
        ] },
      { id: "who-should", h: { en: "Who should consider it", ko: "누구에게 권장될까" },
        p: [
          { en: "Family history, age and lifestyle guide the choice. A coordinator helps you pick a package that screens what matters without over-testing.", ko: "가족력·나이·생활습관이 선택 기준입니다. 코디네이터가 과잉검사 없이 꼭 필요한 항목을 검진하는 패키지를 고르도록 돕습니다." },
        ] },
    ],
  },
  {
    id: "payment-insurance-costs", date: "2026-03-25", category: "insight", read: 5, views: 2100,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&q=80",
    title: { en: "Payment, Insurance and Costs for Foreign Patients", ko: "외국인 환자의 결제·보험·비용" },
    excerpt: { en: "How pricing works, what to bring for insurance claims, and how to avoid surprise charges.", ko: "가격이 정해지는 방식, 보험 청구 준비물, 그리고 예상치 못한 비용을 피하는 법." },
    sections: [
      { id: "how-pricing", h: { en: "How pricing works", ko: "가격이 정해지는 방식" },
        p: [
          { en: "Elective care is quoted up front, often as a package. Ask whether imaging, anesthesia and follow-ups are included so the estimate matches the final bill.", ko: "선택 진료는 대개 패키지로 사전에 견적이 나옵니다. 영상검사·마취·경과관찰 포함 여부를 확인해 견적과 최종 청구가 일치하도록 하세요." },
        ] },
      { id: "insurance", h: { en: "Insurance claims", ko: "보험 청구" },
        p: [
          { en: "Keep itemized receipts and the medical report CareBridge issues; most travel and private insurers need both. We can prepare documents in English on request.", ko: "항목별 영수증과 케어브릿지이 발급하는 진료 리포트를 보관하세요. 대부분의 여행자·민간 보험이 둘 다 요구합니다. 요청 시 영문 서류를 준비해 드립니다." },
        ] },
    ],
  },
  {
    id: "choosing-hospital", date: "2026-03-10", category: "insight", read: 5, views: 1500,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80",
    title: { en: "Choosing a Hospital: Accreditation and Reviews", ko: "병원 고르기: 인증과 후기 보는 법" },
    excerpt: { en: "How to read accreditations, verify a surgeon's experience, and weigh reviews wisely.", ko: "인증을 읽는 법, 의료진 경력 확인, 그리고 후기를 현명하게 판단하는 법." },
    sections: [
      { id: "accreditation", h: { en: "What accreditation means", ko: "인증이 의미하는 것" },
        p: [
          { en: "Look for government registration for foreign-patient care and, ideally, international accreditation. These signal audited safety and record-keeping standards.", ko: "외국인 환자 유치 정부 등록과, 가능하면 국제 인증을 확인하세요. 감사받은 안전·기록관리 기준을 보증합니다." },
        ] },
      { id: "reviews", h: { en: "Reading reviews wisely", ko: "후기를 현명하게 읽기" },
        p: [
          { en: "Weight recent, detailed reviews over star averages, and confirm the surgeon named actually performs your procedure. CareBridge verifies partners before listing them.", ko: "별점 평균보다 최근의 구체적인 후기를 중시하고, 언급된 의료진이 실제 그 시술을 하는지 확인하세요. 케어브릿지은 등재 전 파트너를 검증합니다." },
        ] },
    ],
  },
  {
    id: "interpreter-services", date: "2026-02-26", category: "guide", read: 4, views: 1200,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80",
    title: { en: "Interpreter Services for Medical Visits", ko: "의료 방문을 위한 통역 서비스" },
    excerpt: { en: "Why medical interpretation matters, which languages are covered, and how it's arranged.", ko: "의료 통역이 중요한 이유, 지원 언어, 그리고 준비되는 방식." },
    sections: [
      { id: "why-matters", h: { en: "Why it matters", ko: "왜 중요한가" },
        p: [
          { en: "Consent, symptoms and aftercare instructions leave no room for guesswork. A trained medical interpreter reduces error and helps you decide with confidence.", ko: "동의·증상·사후관리 안내는 추측의 여지가 없어야 합니다. 훈련된 의료 통역은 오류를 줄이고 자신 있게 결정하도록 돕습니다." },
        ] },
      { id: "how-arranged", h: { en: "How it's arranged", ko: "준비되는 방식" },
        p: [
          { en: "CareBridge pairs you with an interpreter for English, Arabic and Japanese, in person or on call, matched to your appointments across the whole trip.", ko: "케어브릿지은 영어·아랍어·일본어 통역을 대면 또는 전화로 배정하고, 여정 전체의 예약 일정에 맞춰 연결합니다." },
        ] },
    ],
  },
];

/* 더미 포스트(하단 리스트 볼륨 확보용) — EN/KO 최소 구성 + 1 섹션.
   4개 카테고리 모두 카드+리스트가 채워지도록 분산(각 카테고리 ≥10편).
   views 를 실제 상위글(3100+)보다 낮게 두어 항상 하단 리스트로 배치. */
const DUMMY_POSTS = [
  // guide
  ["Jet Lag and Your Procedure Schedule", "시차와 시술 일정 관리", "Time treatments around jet lag for a smoother recovery.", "시차를 고려해 시술 일정을 잡아 회복을 순조롭게.", "guide"],
  ["Packing for a Medical Trip to Korea", "한국 의료 여행 짐 싸기", "A checklist of documents, medications and essentials to bring.", "서류·상비약·필수품 준비 체크리스트.", "guide"],
  ["Halal Food Options Near Major Clinics", "주요 병원 인근 할랄 음식", "Where to eat comfortably during your stay.", "체류 중 편하게 식사할 수 있는 곳.", "guide"],
  ["Airport Pickup and Transfers Explained", "공항 픽업과 이동 안내", "How transport is arranged from arrival to clinic.", "도착부터 병원까지 이동 준비 방법.", "guide"],
  ["SIM Cards and Staying Connected", "유심과 통신 연결", "Getting online the moment you land.", "도착 즉시 인터넷을 연결하는 법.", "guide"],
  ["Bringing a Companion on Your Trip", "동반자와 함께 오기", "How a guardian or friend can join and help.", "보호자·지인이 함께 오는 방법.", "guide"],
  ["Seasonal Weather and What to Wear", "계절 날씨와 옷차림", "Dressing for Korea's four distinct seasons.", "한국 사계절에 맞춘 옷차림.", "guide"],
  ["How to Read a Korean Prescription", "한국 처방전 읽는 법", "Understanding dosages and instructions.", "용량과 복용 지시 이해하기.", "guide"],
  ["Pharmacies and Over-the-Counter Basics", "약국과 일반의약품 기초", "Finding pharmacies and common remedies.", "약국 찾기와 상비약 기본.", "guide"],
  ["Wellness Add-Ons: Spas and Recovery", "웰니스 부가: 스파와 회복", "Relaxing extras to round out your trip.", "여정을 채우는 편안한 부가 옵션.", "guide"],
  ["Your First 24 Hours in Seoul", "서울에서의 첫 24시간", "A calm, practical plan for day one.", "차분하고 실용적인 첫날 계획.", "guide"],
  // insight
  ["Understanding Korean Hospital Etiquette", "한국 병원 이용 에티켓", "Small customs that make clinic visits smoother.", "진료를 매끄럽게 하는 작은 관습들.", "insight"],
  ["Currency, Cards and Cash in Korea", "한국의 환전·카드·현금", "Paying for care and daily expenses with ease.", "진료비와 생활비를 편하게 결제하기.", "insight"],
  ["Follow-Up Care After You Fly Home", "귀국 후 사후 관리", "Staying connected with your care team remotely.", "귀국 후에도 의료진과 원격으로 연결.", "insight"],
  ["Common Myths About Medical Tourism", "의료관광 흔한 오해", "Separating fact from fiction before you travel.", "여행 전 사실과 오해 구분하기.", "insight"],
  ["Booking Consultations Remotely", "원격 상담 예약", "Start your treatment plan before you arrive.", "도착 전에 진료 계획을 시작하기.", "insight"],
  ["Second Opinions and How to Get One", "세컨드 오피니언 받는 법", "When and how to seek another view.", "다른 소견을 구하는 시점과 방법.", "insight"],
  ["Managing Medical Records Across Borders", "국경을 넘는 의료 기록 관리", "Keeping your history organized and portable.", "진료 기록을 정리하고 이동성 있게 관리.", "insight"],
  ["Choosing Between Public and Private Care", "공공·민간 의료 선택하기", "Trade-offs in cost, speed and comfort.", "비용·속도·편의의 장단점.", "insight"],
  ["Data Privacy for Foreign Patients", "외국인 환자의 개인정보 보호", "How your medical data is protected.", "의료 정보가 보호되는 방식.", "insight"],
  // checkup
  ["Comprehensive vs. Targeted Checkups", "종합검진 vs 표적검진", "Which package fits your goals and budget.", "목표와 예산에 맞는 패키지 고르기.", "checkup"],
  ["Fasting and Prep Before Your Exam", "검진 전 금식과 준비", "How to prepare the night before.", "검진 전날 준비 방법.", "checkup"],
  ["Understanding Your Blood Panel", "혈액검사 결과 이해하기", "What common markers actually mean.", "주요 수치가 의미하는 것.", "checkup"],
  ["Endoscopy: What to Expect", "내시경, 무엇을 기대할까", "Sedation options and the day-of flow.", "수면 옵션과 당일 흐름.", "checkup"],
  ["Heart Health Screening Basics", "심장 건강 검진 기초", "ECG, echo and when to add them.", "심전도·심초음파, 언제 추가할까.", "checkup"],
  ["Women's Health Checkup Guide", "여성 건강검진 가이드", "Screenings tailored to women's needs.", "여성 맞춤 검진 항목.", "checkup"],
  ["Reading Imaging: CT vs. MRI", "영상검사: CT와 MRI", "When each scan is the right call.", "각 검사가 적절한 경우.", "checkup"],
  ["Annual Checkups: Building a Baseline", "정기검진으로 기준선 만들기", "Why yearly data pays off.", "매년 데이터가 주는 이점.", "checkup"],
  // procedure
  ["Post-Op Skincare Essentials", "시술 후 피부 관리 필수템", "How to care for treated skin during recovery.", "회복 기간 시술 부위 피부 관리법.", "procedure"],
  ["A Week-by-Week Recovery Timeline", "주차별 회복 타임라인", "What healing typically looks like, week by week.", "주차별 일반적인 회복 경과.", "procedure"],
  ["Anesthesia Options Explained", "마취 옵션 안내", "Local, sedation and general — the basics.", "국소·수면·전신 마취 기본.", "procedure"],
  ["Scar Care After Surgery", "수술 후 흉터 관리", "Minimizing marks as you heal.", "회복하며 흉터 최소화하기.", "procedure"],
  ["Non-Surgical vs. Surgical Options", "비수술 vs 수술 옵션", "Weighing downtime against results.", "회복 기간과 결과 비교.", "procedure"],
  ["Rhinoplasty: Planning and Recovery", "코성형: 계획과 회복", "Timelines and realistic expectations.", "일정과 현실적인 기대치.", "procedure"],
  ["Body Contouring Overview", "바디 컨투어링 개요", "Options, candidacy and aftercare.", "옵션·대상·사후관리.", "procedure"],
  ["Orthopedic Procedures for Travelers", "여행자를 위한 정형외과 시술", "Joint care with a recovery plan.", "회복 계획이 있는 관절 치료.", "procedure"],
];
const DUMMY_IMGS = [
  "photo-1505751172876-fa1923c5c528", "photo-1519494026892-80bbd2d6fd0d", "photo-1512290923902-8a9f81dc236c",
  "photo-1554224155-6726b3ff858f", "photo-1543269865-cbf427effbad", "photo-1522708323590-d24dbb6b0267",
];
const DUMMY_BASE = Date.UTC(2026, 1, 20);   // 2026-02-20, i일씩 소급
DUMMY_POSTS.forEach(([te, tk, ee, ek, cat], i) => {
  const date = new Date(DUMMY_BASE - i * 86400000).toISOString().slice(0, 10);
  BLOG.push({
    id: `topic-${i + 1}`, date, category: cat, read: 3 + (i % 5), views: 1600 - i * 30,
    author: { en: "CareBridge Editorial", ko: "케어브릿지 편집팀" },
    image: `https://images.unsplash.com/${DUMMY_IMGS[i % DUMMY_IMGS.length]}?w=1200&q=80`,
    title: { en: te, ko: tk }, excerpt: { en: ee, ko: ek },
    sections: [{ id: "overview", h: { en: "Overview", ko: "개요" }, p: [{ en: ee, ko: ek }] }],
  });
});

/* ---------------- 공용 i18n ---------------- */
export const UI = {
  en: { signin: "Sign in", myaccount: "My account", viewMore: "View more", learnMore: "Learn more", book: "Book now", all: "All", send: "Send", langLabel: "EN",
    addCart: "Save treatment", inCart: "Saved — View saved →", reserve: "Request reservation", cart: "Saved", treatments: "Treatments", qty: "Reservations", viewHospital: "View hospital" },
  ko: { signin: "로그인", myaccount: "마이페이지", viewMore: "자세히 보기", learnMore: "더 알아보기", book: "예약하기", all: "전체", send: "보내기", langLabel: "한",
    addCart: "관심시술 담기", inCart: "담김 — 관심시술 보기 →", reserve: "예약 신청", cart: "관심시술", treatments: "시술", qty: "예약 수", viewHospital: "병원 상세" },
};

/* ====================================================================
   시술·예약 데이터 (Figma "글로벌 웹 화면 기획" 기능화면용)
   ⚠️ 실제로는 [어드민에 등록된 병원/시술정보]에서 연동되어야 함(현재 목업).
   금액은 KRW 기준 + 당일 환율로 USD 병기(Figma 공통 규칙).
   ==================================================================== */
export const KRW_PER_USD = 1450;            // 당일 환율 mock (실제: 환율 API 연동)
export const usd = (krw) => Math.round(krw / KRW_PER_USD);

// 회복 타임라인 필터 옵션(비포/애프터·리스트 공용)
export const RECOVERY_BANDS = [
  { id: "lt1w", en: "Under 1 week", ko: "1주 미만" },
  { id: "1-2w", en: "1–2 weeks", ko: "1–2주" },
  { id: "1m", en: "About 1 month", ko: "약 1개월" },
];

export const PROCEDURES = [
  {
    id: "smile-lasik", category: "ophthalmology", dept: { en: "Ophthalmology", ko: "안과" }, recoveryBand: "lt1w",
    hospital: { name: { en: "Gangnam Seoul Bright Eye Clinic", ko: "강남서울밝은안과" }, city: { en: "Gangnam, Seoul", ko: "서울 강남" }, square: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80" },
    name: { en: "SMILE LASIK", ko: "스마일 라식" },
    hero: "https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=1200&q=80",
    before: "https://images.unsplash.com/photo-1645066928295-2506defde470?w=600&q=80",
    after: "https://images.unsplash.com/photo-1642975967602-653d378f3b5b?w=600&q=80",
    summary: { en: "Minimally-invasive vision correction through a tiny incision — fast recovery, low dry-eye risk.", ko: "작은 절개를 통한 최소 침습 시력 교정 — 빠른 회복, 낮은 안구건조 위험." },
    duration: { en: "1–2 days in Korea", ko: "한국 체류 1–2일" }, recovery: { en: "48h recovery", ko: "48시간 회복" },
    includes: { en: ["Pre-op eye examination", "SMILE laser procedure (both eyes)", "Protective eyewear kit", "Next-day check-up"], ko: ["수술 전 정밀 검사", "스마일 레이저 시술(양안)", "보호 안경 키트", "익일 경과 검진"] },
    options: [{ group: { en: "Add-on examination", ko: "추가 검사" }, pick: 1, items: { en: ["Dry-eye screening", "Corneal topography"], ko: ["안구건조 검사", "각막 지형도 검사"] } }],
    steps: { en: ["Detailed pre-op exam", "Surgeon consultation", "SMILE procedure (~15 min)", "Same-day discharge", "Next-day check-up"], ko: ["정밀 사전 검사", "집도의 상담", "스마일 시술(~15분)", "당일 퇴원", "익일 경과 검진"] },
    prepare: { en: ["Stop wearing contact lenses 1 week prior", "Arrange someone to accompany you home"], ko: ["1주 전부터 콘택트렌즈 착용 중단", "귀가 시 동반자 준비"] },
    listPrice: 3300000, price: 2600000,
  },
  {
    id: "dental-implant", category: "dental", dept: { en: "Dental", ko: "치과" }, recoveryBand: "1m",
    hospital: { name: { en: "Apgujeong Premium Dental", ko: "압구정 프리미엄 치과" }, city: { en: "Gangnam, Seoul", ko: "서울 강남" }, square: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80" },
    name: { en: "Dental Implant", ko: "임플란트" },
    hero: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=80",
    before: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80",
    after: "https://images.unsplash.com/photo-1581585095544-bb2c8a4d3a3e?w=600&q=80",
    summary: { en: "Premium titanium implants with digital 3D guided placement and natural-look crowns.", ko: "디지털 3D 가이드 식립과 자연스러운 크라운의 프리미엄 티타늄 임플란트." },
    duration: { en: "2 visits over 3 months", ko: "3개월간 2회 방문" }, recovery: { en: "~1 month", ko: "약 1개월" },
    includes: { en: ["3D CT scan & planning", "Implant fixture & abutment", "Zirconia crown", "Follow-up cleaning"], ko: ["3D CT 촬영·계획", "임플란트 픽스처·지대주", "지르코니아 크라운", "사후 스케일링"] },
    options: [{ group: { en: "Crown material", ko: "크라운 재질" }, pick: 1, items: { en: ["Zirconia", "Gold"], ko: ["지르코니아", "골드"] } }],
    steps: { en: ["Consultation & 3D scan", "Fixture placement", "Healing period", "Crown fitting"], ko: ["상담·3D 스캔", "픽스처 식립", "골유착 기간", "크라운 장착"] },
    prepare: { en: ["Bring previous dental records if any", "Avoid smoking before and after"], ko: ["기존 치과 기록 지참(있을 경우)", "전후 흡연 자제"] },
    listPrice: 2200000, price: 1700000,
  },
  {
    id: "skin-rejuvenation", category: "dermatology", dept: { en: "Dermatology", ko: "피부과" }, recoveryBand: "lt1w",
    hospital: { name: { en: "Cheongdam Glow Dermatology", ko: "청담 글로우 피부과" }, city: { en: "Gangnam, Seoul", ko: "서울 강남" }, square: "https://images.unsplash.com/photo-1612908689435-744b8b0a0c46?w=400&q=80" },
    name: { en: "Skin Rejuvenation Laser", ko: "피부 재생 레이저" },
    hero: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80",
    before: "https://images.unsplash.com/photo-1614859324967-bdf413c35d4d?w=600&q=80",
    after: "https://images.unsplash.com/photo-1559599076-9c61d8e1b77c?w=600&q=80",
    summary: { en: "Tone-and-texture laser program for brightening, pores and fine lines.", ko: "톤·결 개선을 위한 레이저 프로그램 — 미백, 모공, 잔주름." },
    duration: { en: "Half-day", ko: "반나절" }, recovery: { en: "2–3 days", ko: "2–3일" },
    includes: { en: ["Skin analysis", "Laser session", "Soothing care", "Aftercare kit"], ko: ["피부 분석", "레이저 시술", "진정 케어", "사후 케어 키트"] },
    options: [{ group: { en: "Laser type", ko: "레이저 종류" }, pick: 1, items: { en: ["Pico toning", "Fractional"], ko: ["피코 토닝", "프락셔널"] } }],
    steps: { en: ["Skin analysis", "Numbing cream", "Laser session", "Soothing care"], ko: ["피부 분석", "마취 크림", "레이저 시술", "진정 케어"] },
    prepare: { en: ["Avoid sun exposure 3 days prior", "No retinol 1 week prior"], ko: ["3일 전 햇빛 노출 자제", "1주 전 레티놀 사용 중단"] },
    listPrice: 900000, price: 650000,
  },
  {
    id: "comprehensive-checkup", category: "checkup", dept: { en: "Health Check-up", ko: "건강검진" }, recoveryBand: "lt1w",
    hospital: { name: { en: "Seoul Premier Health Center", ko: "서울 프리미어 검진센터" }, city: { en: "Jongno, Seoul", ko: "서울 종로" }, square: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80" },
    name: { en: "Comprehensive Check-up", ko: "종합 건강검진" },
    hero: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=1200&q=80",
    before: null, after: null,
    summary: { en: "Wide-range annual screening — blood, imaging and core organ function.", ko: "혈액·영상·핵심 장기 기능을 폭넓게 검사하는 연간 종합검진." },
    duration: { en: "Half-day", ko: "반나절" }, recovery: { en: "Same day", ko: "당일" },
    includes: { en: ["Blood & urine panel", "Abdominal ultrasound", "Chest X-ray & ECG", "Specialist consultation"], ko: ["혈액·소변 검사", "복부 초음파", "흉부 X-ray·심전도", "전문의 상담"] },
    options: [{ group: { en: "Endoscopy options", ko: "내시경 옵션" }, pick: 2, items: { en: ["Gastroscopy", "Colonoscopy", "Sedation"], ko: ["위내시경", "대장내시경", "수면"] } }],
    steps: { en: ["Fasting from midnight", "Check-in & samples", "Imaging & scopes", "Doctor consultation"], ko: ["전날 자정부터 금식", "접수·검체 채취", "영상·내시경", "의사 상담"] },
    prepare: { en: ["Fast for 8 hours before", "Bring photo ID"], ko: ["검사 8시간 전 금식", "신분증 지참"] },
    listPrice: 580000, price: 435000,
  },
  {
    id: "whole-body-mri", category: "checkup", dept: { en: "Health Check-up", ko: "건강검진" }, recoveryBand: "lt1w",
    hospital: { name: { en: "Seoul Premier Health Center", ko: "서울 프리미어 검진센터" }, city: { en: "Jongno, Seoul", ko: "서울 종로" }, square: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=80" },
    name: { en: "Whole Body MRI Check-up", ko: "전신 MRI 검진" },
    hero: "https://images.unsplash.com/photo-1516069677018-378515003435?w=1200&q=80",
    before: null, after: null,
    summary: { en: "Full-body MRI to detect tumors and abnormalities early — no radiation, high resolution.", ko: "종양·이상을 조기에 발견하는 전신 MRI — 방사선 없이 고해상도." },
    duration: { en: "Half-day", ko: "반나절" }, recovery: { en: "Same day", ko: "당일" },
    includes: { en: ["Whole-body MRI", "Brain & spine MRI", "MRA vascular screening", "Radiologist reading"], ko: ["전신 MRI", "뇌·척추 MRI", "MRA 혈관 검사", "영상의학과 판독"] },
    options: [{ group: { en: "Add-on", ko: "추가 검사" }, pick: 1, items: { en: ["PET-CT", "Cardiac MRI"], ko: ["PET-CT", "심장 MRI"] } }],
    steps: { en: ["Check-in", "MRI scan (~60 min)", "Radiologist reading", "Result consultation"], ko: ["접수", "MRI 촬영(~60분)", "영상의학과 판독", "결과 상담"] },
    prepare: { en: ["Remove all metal items", "Inform staff of implants"], ko: ["금속류 모두 제거", "체내 삽입물 사전 고지"] },
    listPrice: 2900000, price: 2400000,
  },
  {
    id: "hair-transplant", category: "hair-loss", dept: { en: "Hair Transplant", ko: "모발이식" }, recoveryBand: "1-2w",
    hospital: { name: { en: "Seoul Forest Hair Clinic", ko: "서울숲 모발센터" }, city: { en: "Seongdong, Seoul", ko: "서울 성동" }, square: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&q=80" },
    name: { en: "FUE Hair Transplant", ko: "FUE 모발이식" },
    hero: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1200&q=80",
    before: "https://images.unsplash.com/photo-1626954079979-ec4f7b05e032?w=600&q=80",
    after: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=600&q=80",
    summary: { en: "Follicular-unit extraction with natural hairline design.", ko: "자연스러운 헤어라인 디자인의 모낭단위 채취 이식." },
    duration: { en: "1 day", ko: "1일" }, recovery: { en: "1–2 weeks", ko: "1–2주" },
    includes: { en: ["Hairline design", "FUE extraction & graft", "Post-op medication", "Follow-up"], ko: ["헤어라인 디자인", "FUE 채취·이식", "수술 후 약 처방", "경과 관찰"] },
    options: [{ group: { en: "Graft count", ko: "이식 모수" }, pick: 1, items: { en: ["2,000 grafts", "3,000 grafts"], ko: ["2,000모", "3,000모"] } }],
    steps: { en: ["Consultation & design", "Donor extraction", "Implantation", "Aftercare guide"], ko: ["상담·디자인", "공여부 채취", "식모", "사후관리 안내"] },
    prepare: { en: ["Avoid alcohol 3 days prior", "Wash hair the morning of"], ko: ["3일 전 음주 자제", "당일 아침 머리 감기"] },
    listPrice: 4500000, price: 3600000,
  },
];

export const tx = (v, lang) => (v && typeof v === "object" ? (v[lang] ?? v.en) : v);

/* =========================================================================
   i18n override — scripts/i18n-extract 로 뽑은 문자열을 엑셀에서 관리 →
   i18n-apply 가 src/i18n-strings.json(맵)을 갱신 → 여기서 로드 시 값 덮어씀.
   구조·tx() 그대로 유지(가벼운 방식). 맵이 현재값과 같으면 no-op.
   추출기와 동일한 키 규칙으로 재순회하며 적용(경로 파싱 없이 방문 지점에서 세팅).
   ========================================================================= */
import I18N from "./i18n-strings.json" with { type: "json" };
import { LANG_CODES, OVERLAY_LANGS } from "./langs.js";
(function applyI18n() {
  if (!I18N || typeof I18N !== "object") return;
  const nz = (v) => v != null && v !== "";                                // 비어있지 않음
  const setStr = (node, o) => { for (const c of LANG_CODES) if (nz(o[c])) node[c] = o[c]; };
  const visit = (node, path) => {
    if (node == null || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach((v, i) => visit(v, `${path}[${i}]`)); return; }
    const en = node.en, ko = node.ko;
    if (Array.isArray(en) || Array.isArray(ko)) {
      const n = Math.max((en || []).length, (ko || []).length);
      for (let i = 0; i < n; i++) { const o = I18N[`${path}[${i}]`]; if (o) { if (node.en && nz(o.en)) node.en[i] = o.en; if (node.ko && nz(o.ko)) node.ko[i] = o.ko; } }
      for (const c of OVERLAY_LANGS) {                                    // 오버레이 언어 배열(부분번역은 en 폴백)
        let has = false; for (let i = 0; i < n; i++) { const o = I18N[`${path}[${i}]`]; if (o && nz(o[c])) { has = true; break; } }
        if (has) { node[c] = (node.en || []).slice(); for (let i = 0; i < n; i++) { const o = I18N[`${path}[${i}]`]; if (o && nz(o[c])) node[c][i] = o[c]; } }
      }
    } else if (typeof en === "string" || typeof ko === "string" || en === null || ko === null) {
      const o = I18N[path]; if (o) setStr(node, o);                                        // 객체 레벨 en/ko(NAV·SERVICES 등 포함)
    } else if (en && typeof en === "object") {                                             // {en:{},ko:{}} (UI)
      const keys = Object.keys(en);
      for (const kk of keys) { const o = I18N[`${path}.${kk}`]; if (o) { if (nz(o.en)) node.en[kk] = o.en; if (node.ko && nz(o.ko)) node.ko[kk] = o.ko; } }
      for (const c of OVERLAY_LANGS) { if (!node[c]) node[c] = {}; for (const kk of keys) { const o = I18N[`${path}.${kk}`]; node[c][kk] = (o && nz(o[c])) ? o[c] : node.en[kk]; } } // UI[c] 항상 구성(미번역=en)
      return;
    }
    for (const k of Object.keys(node)) { if (LANG_CODES.includes(k)) continue; visit(node[k], path ? `${path}.${k}` : k); }
  };
  const EX = { BRAND, NAV, HERO, JOURNEY, CHECKUP, SCAN_MENU, WHY, REVITAL, SERVICES, PROVIDER_DEPTS, PROVIDER_LANGS, PROVIDERS, REVIEWS, FAQ_CATS, FAQS, CERTS, BLOG, UI, RECOVERY_BANDS, PROCEDURES };
  try { for (const [n, v] of Object.entries(EX)) visit(v, n); } catch (e) { /* override 실패해도 원본 유지 */ }
})();
