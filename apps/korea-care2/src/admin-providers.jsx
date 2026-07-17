/* =========================================================================
   admin-providers.jsx — 병원 관리 · 시술 관리 (운영자 어드민)
   korea-care admin-proto.jsx 에서 병원/시술 관리 이식 → CareBridge 디자인.
   Tailwind 클래스는 admin-providers.css(사전 컴파일, teal→CareBridge 블루 리맵,
   preflight off, .sd-admin 스코프 리셋)로 스타일. 데이터는 전부 목업.
   ========================================================================= */
import { useState, useRef } from "react";
import { REGIONS } from "./region-data.js";   // 전국 시·도 → 시·군·구 (한/영)
import "./admin-providers.css";

const fmtKRW = (n) =>
  n === null || n === undefined ? "—" : "₩" + Number(n).toLocaleString("ko-KR");
const fmtUSD = (n) =>
  n === null || n === undefined
    ? ""
    : "≒ $" + Math.round(Number(n) / 1400).toLocaleString("en-US");

const wishDate = (w) => (w && w !== "-" ? w.split("·")[0].trim() : "—");
const wishSlot = (w) => (w && w.includes("·") ? w.split("·")[1].trim() : "—");
const dateOnly = (d) => (d ? String(d).slice(0, 10) : "—");

/* ───────────────────────── 목데이터 (실운영 시트 기반) ───────────────────────── */

/* 시/도 → 시·군·구 연동 드롭다운 (한/영 병기). 데이터: region-data.js */
function RegionSelect({ defaultSido = "서울시", defaultGugun = "강남구" }) {
  const [sido, setSido] = useState(defaultSido);
  const node = REGIONS[sido] || { children: [] };
  const guguns = node.children;
  const [gugun, setGugun] = useState(defaultGugun);
  const isMetro = ["서울시", "부산시", "인천시", "대구시", "대전시", "광주시", "울산시"].includes(sido);
  const opt = (ko, en) => (en && en !== ko ? `${ko} · ${en}` : ko);
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label>시/도 *</Label>
        <select value={sido} onChange={(e) => { setSido(e.target.value); setGugun((REGIONS[e.target.value]?.children[0] || {}).ko); }}
          className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
          {Object.keys(REGIONS).map((s) => <option key={s} value={s}>{opt(REGIONS[s].ko, REGIONS[s].en)}</option>)}
        </select>
      </div>
      <div>
        <Label>{isMetro ? "구/군 *" : "시/군/구 *"}</Label>
        <select value={gugun} onChange={(e) => setGugun(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
          {guguns.map((g) => <option key={g.ko} value={g.ko}>{opt(g.ko, g.en)}</option>)}
        </select>
      </div>
    </div>
  );
}

const HOSPITALS = [
  { id: 1, name: "임플라인치과 강남삼성점", field: "치과", region: "서울시-강남구", fee: 1, feeInterpreter: 2, feeBasis: "결제액(VAT포함)", treatments: 3, langs: ["영어", "중국어"], visible: true },
  { id: 2, name: "광동병원", field: "건강검진", region: "서울시-강남구", fee: 1, feeInterpreter: 1, feeBasis: "공급가액(VAT제외)", treatments: 5, langs: ["영어", "일본어", "중국어", "러시아어"], visible: true },
  { id: 3, name: "크크서울", field: "피부과", region: "서울시-강남구", fee: 1, feeInterpreter: 3, feeBasis: "결제액(VAT포함)", treatments: 4, langs: ["영어", "일본어"], visible: true },
  { id: 4, name: "명지성모병원", field: "건강검진", region: "서울시-영등포구", fee: 1, feeInterpreter: 1, feeBasis: "공급가액(VAT제외)", treatments: 5, langs: ["영어", "중국어"], visible: true },
  { id: 5, name: "레브치과", field: "치과", region: "서울시-강남구", fee: 1, feeInterpreter: 2, feeBasis: "결제액(VAT포함)", treatments: 2, langs: ["영어"], visible: false },
];

// 병원별 항목 마스터 (항목 코드 + 다국어 항목명) — 시술 포함/옵션 항목 선택지의 원천
const ITEM_MASTER = {
  "임플라인치과 강남삼성점": [
    { code: "IMP-001", name: { ko: "임플란트 픽스처", en: "Implant fixture", ar: "" } },
    { code: "IMP-002", name: { ko: "지대주(어버트먼트)", en: "Abutment", ar: "" } },
    { code: "IMP-003", name: { ko: "크라운(보철)", en: "Crown", ar: "" } },
    { code: "DEN-001", name: { ko: "파노라마 촬영", en: "Panoramic X-ray", ar: "" } },
    { code: "DEN-002", name: { ko: "구강 정밀검진", en: "Oral examination", ar: "" } },
    { code: "DEN-003", name: { ko: "치료 계획 상담(통역)", en: "Treatment consult (interpreter)", ar: "" } },
    { code: "CON-002", name: { ko: "사후 관리 1년", en: "1-year aftercare", ar: "" } },
  ],
  "광동병원": [
    { code: "CHK-001", name: { ko: "기본 혈액검사 패널", en: "Basic blood panel", ar: "" } },
    { code: "CHK-002", name: { ko: "복부 초음파", en: "Abdominal ultrasound", ar: "" } },
    { code: "CHK-003", name: { ko: "위내시경(수면)", en: "Gastroscopy (sedated)", ar: "" } },
    { code: "CHK-004", name: { ko: "흉부 CT", en: "Chest CT", ar: "" } },
    { code: "MRI-001", name: { ko: "뇌 MRI+MRA", en: "Brain MRI+MRA", ar: "" } },
    { code: "MRI-002", name: { ko: "경추 MRI", en: "Cervical spine MRI", ar: "" } },
    { code: "MRI-003", name: { ko: "요추 MRI", en: "Lumbar spine MRI", ar: "" } },
    { code: "MRI-004", name: { ko: "경동맥 MRA", en: "Carotid MRA", ar: "" } },
    { code: "MRK-001", name: { ko: "암표지자 6종", en: "Tumor markers x6", ar: "" } },
    { code: "MRK-002", name: { ko: "호르몬 패널", en: "Hormone panel", ar: "" } },
    { code: "MRK-003", name: { ko: "골밀도", en: "Bone density", ar: "" } },
  ],
  "크크서울": [
    { code: "SKN-001", name: { ko: "피부 진단 스캔", en: "Skin diagnostic scan", ar: "" } },
    { code: "SKN-002", name: { ko: "레이저 토닝 2회", en: "Laser toning x2", ar: "" } },
    { code: "SKN-003", name: { ko: "진정 관리", en: "Soothing care", ar: "" } },
    { code: "SKN-004", name: { ko: "기미 집중 IPL", en: "Targeted IPL", ar: "" } },
    { code: "SKN-005", name: { ko: "모공 프락셀", en: "Fraxel (pores)", ar: "" } },
    { code: "SKN-006", name: { ko: "리프팅 슈링크 100샷", en: "Shurink lifting 100 shots", ar: "" } },
  ],
};

// 항목 코드 → 표시 이름 (선택 언어, 없으면 영어 폴백, 그래도 없으면 코드/커스텀)
function itemLabel(hospitalName, ref, lang = "ko") {
  if (ref && ref.custom !== undefined) return ref.custom; // 예외(직접 입력)
  const code = typeof ref === "string" ? ref : ref?.code;
  const master = ITEM_MASTER[hospitalName] || [];
  const found = master.find((m) => m.code === code);
  if (!found) return code || "—";
  return found.name[lang] || found.name.en || code;
}

const TREATMENTS = [
  {
    id: 1, hospital: "광동병원", dept: "건강검진", name: "Premium 건강검진 패키지",
    list: 1960000, price: 1820000, payType: "예약금", depositAmount: 100000, visible: true, bookings: 14,
    fee: 1, feeBasis: "공급가액(VAT제외)", feeInherit: true,
    desc: { ko: "주요 장기와 암 위험을 하루에 확인하는 프리미엄 종합검진", en: "Premium one-day comprehensive checkup covering major organs and cancer risk", ar: "" },
    info: { ko: "공복 8시간 후 내원하시면 되며, 검사 결과는 5~7일 후 다국어 리포트로 제공됩니다.", en: "Come after 8 hours of fasting. Results are provided as a multilingual report in 5–7 days.", ar: "" },
    discountType: "(b) 외국인 수가",
    steps: { ko: "접수 및 문진\n채혈·기본검사\n영상검사(선택 옵션)\n결과 상담", en: "Reception\nBlood test\nImaging (optional)\nConsultation", ar: "" },
    includes: ["CHK-001", "CHK-002", "CHK-003", "CHK-004"],
    optionGroups: [
      { name: "그룹 A — 정밀검사", pick: 2, items: ["MRI-001", "MRI-002", "MRI-003", "MRI-004"] },
      { name: "그룹 B — 표지자검사", pick: 1, items: ["MRK-001", "MRK-002", "MRK-003"] },
    ],
    beforeAfter: false, sooyo: { value: 4, unit: "시간" },
    notice: { ko: "검진 전날 밤 10시 이후 금식이 필요합니다. 임신 중이거나 조영제 알레르기가 있으면 미리 알려주세요.", en: "Fasting after 10 PM the night before is required. Notify us if pregnant or allergic to contrast agents.", ar: "" },
    prep: { ko: "검진 전날 저녁부터 금식\n복용 중인 약이 있으면 목록 지참\n편한 복장으로 내원", en: "Fast from the evening before\nBring a list of current medications\nWear comfortable clothing", ar: "" },
  },
  {
    id: 2, hospital: "임플라인치과 강남삼성점", dept: "치과", name: "임플란트·보철 종합",
    list: 6300000, price: 6000000, payType: "선결제", depositAmount: 0, visible: true, bookings: 6,
    fee: 1, feeBasis: "결제액(VAT포함)", feeInherit: true,
    desc: { ko: "정밀 진단부터 보철까지 통역과 함께 진행하는 임플란트 패키지", en: "Full implant package from diagnosis to prosthetics, with interpreter support", ar: "" },
    info: { ko: "1차 방문 시 정밀검진과 치료 계획 수립, 이후 식립·보철 단계로 진행됩니다.", en: "First visit covers examination and planning, followed by placement and prosthetics.", ar: "" },
    discountType: "(c) 외국인 수가 + 추가 할인",
    steps: { ko: "정밀 진단·CT\n치료 계획 상담(통역)\n임플란트 식립\n보철 장착", en: "CT diagnosis\nConsultation (interpreter)\nImplant placement\nProsthetics", ar: "" },
    includes: ["DEN-001", "DEN-002", "DEN-003"],
    optionGroups: [],
    beforeAfter: true, sooyo: { value: 3, unit: "개월" },
    notice: { ko: "골이식이 필요한 경우 추가 비용과 기간이 발생할 수 있습니다. 시술 후 정기 점검이 권장됩니다.", en: "Bone grafting, if needed, may incur extra cost and time. Regular follow-ups are recommended.", ar: "" },
    prep: { ko: "기존 치과 파노라마·CT 있으면 지참\n스케일링 등 사전 진료 이력 공유\n시술 당일 식사 후 내원", en: "Bring prior dental X-ray/CT if any\nShare previous dental history\nEat before visiting on the day", ar: "" },
  },
  {
    id: 3, hospital: "크크서울", dept: "피부과", name: "피부 노화·색소 레이저",
    list: 1050000, price: 900000, payType: "불필요", depositAmount: 0, visible: true, bookings: 9,
    fee: 2, feeBasis: "결제액(VAT포함)", feeInherit: false,
    desc: { ko: "색소와 모공, 탄력을 한 번에 관리하는 복합 레이저 프로그램", en: "Combined laser program for pigmentation, pores and elasticity", ar: "" },
    info: { ko: "시술 후 진정 관리가 포함되며, 자외선 차단과 보습 관리가 필요합니다.", en: "Includes soothing care after treatment; sun protection and moisturizing are advised.", ar: "" },
    discountType: "(a) 국내 할인가 동일",
    steps: { ko: "피부 진단 스캔\n레이저 토닝\n진정 관리", en: "Skin scan\nLaser toning\nSoothing care", ar: "" },
    includes: ["SKN-001", "SKN-002", "SKN-003"],
    optionGroups: [{ name: "추가 시술", pick: 1, items: ["SKN-004", "SKN-005", "SKN-006"] }],
    beforeAfter: true, sooyo: { value: 1, unit: "시간" },
    notice: { ko: "시술 후 일시적인 홍조가 있을 수 있습니다. 시술 당일 사우나·음주는 피해주세요.", en: "Temporary redness may occur. Avoid sauna and alcohol on the treatment day.", ar: "" },
    prep: { ko: "시술 3일 전부터 각질 제거·필링 자제\n선크림 등 자외선 관리\n시술 당일 화장은 최소화", en: "Avoid exfoliation/peeling 3 days before\nUse sunscreen\nMinimize makeup on the day", ar: "" },
  },
];


/* ───────────────────────── 공용 컴포넌트 ───────────────────────── */

function Money({ v, sub }) {
  return (
    <span className="whitespace-nowrap">
      <span className="font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>{fmtKRW(v)}</span>
      {sub && <span className="ml-1 text-xs text-slate-400">{fmtUSD(v)}</span>}
    </span>
  );
}

function Card({ title, right, children, pad = true }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {title && (
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {right}
        </header>
      )}
      <div className={pad ? "p-4" : ""}>{children}</div>
    </section>
  );
}

function Th({ children, right }) {
  return <th className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 ${right ? "text-right" : "text-left"}`}>{children}</th>;
}
function Td({ children, right, className = "" }) {
  return <td className={`px-3 py-2.5 text-sm text-slate-700 ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}

function Label({ children }) {
  return <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{children}</div>;
}
function Input({ ...p }) {
  return <input {...p} className={"w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-600 " + (p.className || "")} />;
}
/* 노출/미노출 토글 스위치 */
function Toggle({ on, onChange, labelOn = "노출", labelOff = "숨김" }) {
  return (
    <button type="button" onClick={onChange}
      className="inline-flex items-center gap-2">
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${on ? "bg-teal-600" : "bg-slate-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
      <span className={`text-xs font-bold ${on ? "text-teal-700" : "text-slate-400"}`}>{on ? labelOn : labelOff}</span>
    </button>
  );
}

/* 다국어 입력 — 한국어/영어/아랍어를 각각 직접 등록 (자동 번역 아님, 확정 문구) */
const LANGS = [
  { key: "ko", label: "한국어", dir: "ltr" },
  { key: "en", label: "English", dir: "ltr" },
  { key: "ar", label: "العربية", dir: "rtl" },
];
function MultiLangField({ label, textarea, values = {} }) {
  const [lang, setLang] = useState("ko");
  const [vals, setVals] = useState({ ko: values.ko || "", en: values.en || "", ar: values.ar || "" });
  const cur = LANGS.find((l) => l.key === lang);
  const filled = LANGS.filter((l) => (vals[l.key] || "").trim()).map((l) => l.key);
  const set = (v) => setVals((p) => ({ ...p, [lang]: v }));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
          {LANGS.map((l) => (
            <button key={l.key} type="button" onClick={() => setLang(l.key)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                lang === l.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-400"}`}>
              {l.label}
              <span className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${filled.includes(l.key) ? "bg-green-500" : "bg-slate-300"}`} />
            </button>
          ))}
        </div>
      </div>
      {textarea ? (
        <textarea rows={2} dir={cur.dir} value={vals[lang] || ""} onChange={(e) => set(e.target.value)}
          placeholder={lang === "ko" ? "한국어 문구 입력" : lang === "en" ? "Enter English copy" : "أدخل النص العربي"}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
      ) : (
        <Input dir={cur.dir} value={vals[lang] || ""} onChange={(e) => set(e.target.value)}
          placeholder={lang === "ko" ? "한국어 문구 입력" : lang === "en" ? "Enter English copy" : "أدخل النص العربي"} />
      )}
    </div>
  );
}

/* 클릭형 다중 선택 칩 (전문영역·통역 언어 등) */
function ChipMultiSelect({ options, defaultSelected = [] }) {
  const [sel, setSel] = useState(defaultSelected);
  const toggle = (o) => setSel(sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = sel.includes(o);
        return (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              on ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-teal-400"}`}>
            {on && <span className="mr-1">✓</span>}{o}
          </button>
        );
      })}
    </div>
  );
}

/* 컴팩트 다국어 입력 — 한 줄짜리 필드에 언어 탭(한/EN/AR)을 얹어 각 언어 값을 개별 입력 */
function MiniLangInput({ value = {}, onChange, placeholderKo = "한국어", placeholderEn = "English", placeholderAr = "العربية", textarea }) {
  const [lang, setLang] = useState("ko");
  const cur = LANGS.find((l) => l.key === lang);
  const set = (v) => onChange({ ...value, [lang]: v });
  const ph = lang === "ko" ? placeholderKo : lang === "en" ? placeholderEn : placeholderAr;
  return (
    <div>
      <div className="mb-1 flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
        {LANGS.map((l) => (
          <button key={l.key} type="button" onClick={() => setLang(l.key)}
            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${lang === l.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-400"}`}>
            {l.label}
            <span className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${(value[l.key] || "").trim() ? "bg-green-500" : "bg-slate-300"}`} />
          </button>
        ))}
      </div>
      {textarea ? (
        <textarea rows={2} dir={cur.dir} value={value[lang] || ""} onChange={(e) => set(e.target.value)} placeholder={ph}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-teal-600" />
      ) : (
        <input dir={cur.dir} value={value[lang] || ""} onChange={(e) => set(e.target.value)} placeholder={ph}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-teal-600" />
      )}
    </div>
  );
}

/* 병원 특장점 — 제목 + 설명을 여러 개 추가 (각 항목 한/영/아랍 입력) */
function FeatureEditor({ defaultFeatures = [] }) {
  const [items, setItems] = useState(defaultFeatures.length ? defaultFeatures : [{ title: {}, desc: {} }]);
  const update = (i, k, v) => setItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const add = () => setItems([...items, { title: {}, desc: {} }]);
  const remove = (i) => setItems(items.filter((_, j) => j !== i));
  return (
    <div className="grid gap-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-2">
          <div className="mb-2 flex items-start gap-2">
            <div className="flex-1">
              <div className="mb-0.5 text-[10px] font-bold text-slate-400">특장점 제목</div>
              <MiniLangInput value={it.title} onChange={(v) => update(i, "title", v)}
                placeholderKo="예: JCI 국제 인증" placeholderEn="e.g. JCI Accredited" placeholderAr="مثال: اعتماد JCI" />
            </div>
            <button type="button" onClick={() => remove(i)} className="mt-4 rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:text-rose-500">삭제</button>
          </div>
          <div className="text-[10px] font-bold text-slate-400">설명</div>
          <MiniLangInput value={it.desc} onChange={(v) => update(i, "desc", v)}
            placeholderKo="예: 국제의료기관평가위원회 인증 획득" placeholderEn="e.g. Joint Commission International certified" placeholderAr="مثال: معتمد من اللجنة الدولية المشتركة" />
        </div>
      ))}
      <button type="button" onClick={add} className="w-fit text-xs font-bold text-teal-700">+ 특장점 추가</button>
    </div>
  );
}

/* 원장 정보 — 여러 명 추가 (이름·직책·전문분야 다국어 + 약력 + 사진) */
function DoctorEditor({ defaultDoctors = [] }) {
  const [items, setItems] = useState(defaultDoctors.length ? defaultDoctors : [{ name: {}, title: {}, specialty: {}, career: {} }]);
  const update = (i, k, v) => setItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const add = () => setItems([...items, { name: {}, title: {}, specialty: {}, career: {} }]);
  const remove = (i) => setItems(items.filter((_, j) => j !== i));
  return (
    <div className="grid gap-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-teal-700">원장 {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs font-bold text-slate-400 hover:text-rose-500">삭제</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <div>
              <div className="mb-0.5 text-[10px] font-bold text-slate-400">사진</div>
              <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-[11px] text-slate-400">업로드</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div><div className="mb-0.5 text-[10px] font-bold text-slate-400">이름</div>
                <MiniLangInput value={it.name} onChange={(v) => update(i, "name", v)} placeholderKo="예: 김OO" placeholderEn="e.g. Dr. Kim" placeholderAr="مثال: د. كيم" /></div>
              <div><div className="mb-0.5 text-[10px] font-bold text-slate-400">직책</div>
                <MiniLangInput value={it.title} onChange={(v) => update(i, "title", v)} placeholderKo="예: 대표원장" placeholderEn="e.g. Chief Director" placeholderAr="مثال: المدير" /></div>
              <div className="sm:col-span-2"><div className="mb-0.5 text-[10px] font-bold text-slate-400">전문 분야</div>
                <MiniLangInput value={it.specialty} onChange={(v) => update(i, "specialty", v)} placeholderKo="예: 임플란트·보철" placeholderEn="e.g. Implants & Prosthodontics" placeholderAr="مثال: الزراعة" /></div>
              <div className="sm:col-span-2"><div className="mb-0.5 text-[10px] font-bold text-slate-400">약력</div>
                <MiniLangInput textarea value={it.career} onChange={(v) => update(i, "career", v)} placeholderKo="학력·경력·자격 (한 줄에 하나씩)" placeholderEn="Education, experience, licenses" placeholderAr="التعليم والخبرة" /></div>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="w-fit text-xs font-bold text-teal-700">+ 원장 추가</button>
    </div>
  );
}

/* 병원 항목 마스터 — 항목 코드 + 다국어 항목명. 시술 등록의 포함/옵션 항목이 여기서 매핑됨 */
function ItemMasterEditor({ defaultItems = [] }) {
  const [items, setItems] = useState(defaultItems.length ? defaultItems : [{ code: "", name: {} }]);
  const [uploadMsg, setUploadMsg] = useState(null);
  const update = (i, k, v) => setItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const add = () => setItems([...items, { code: "", name: {} }]);
  const remove = (i) => setItems(items.filter((_, j) => j !== i));

  // 업로드된 행(2차원 배열)을 항목으로 변환. 헤더: 항목코드/한국어/영어/아랍어
  const applyRows = (rows) => {
    if (!rows || rows.length === 0) { setUploadMsg("빈 파일입니다."); return; }
    // 헤더 행 감지 (첫 셀이 '항목코드'/'code' 등이면 스킵)
    let start = 0;
    const h0 = String(rows[0][0] || "").trim().toLowerCase();
    if (["항목코드", "code", "항목 코드", "코드"].includes(h0)) start = 1;
    const parsed = [];
    for (let r = start; r < rows.length; r++) {
      const [code, ko, en, ar] = rows[r];
      if (!code && !ko && !en) continue;
      parsed.push({ code: String(code || "").trim(), name: { ko: (ko || "").trim(), en: (en || "").trim(), ar: (ar || "").trim() } });
    }
    if (parsed.length === 0) { setUploadMsg("유효한 항목이 없습니다."); return; }
    setItems(parsed);
    setUploadMsg(`${parsed.length}개 항목을 불러왔습니다. (기존 목록 대체)`);
  };

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const isCsv = /\.csv$/i.test(file.name);
    if (isCsv || typeof XLSX === "undefined") {
      // CSV 파싱 (SheetJS 없거나 csv 파일)
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || "");
        const rows = text.split(/\r?\n/).filter((l) => l.trim() !== "").map((l) =>
          l.split(",").map((c) => c.replace(/^"|"$/g, "").trim()));
        applyRows(rows);
      };
      reader.readAsText(file, "utf-8");
    } else {
      // XLSX 파싱 (SheetJS)
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const wb = XLSX.read(new Uint8Array(reader.result), { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          applyRows(rows);
        } catch (err) { setUploadMsg("엑셀을 읽지 못했습니다: " + err.message); }
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const csv = "항목코드,한국어,영어,아랍어\nIMP-001,임플란트 픽스처,Implant fixture,غرسة\nIMP-003,크라운,Crown,تاج";
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "항목마스터_템플릿.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-2">
      {/* 엑셀 업로드 영역 */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-teal-200 bg-teal-50/40 px-3 py-2">
        <span className="text-xs font-bold text-teal-800">엑셀/CSV 업로드</span>
        <label className="cursor-pointer rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800">
          파일 선택
          <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="hidden" />
        </label>
        <button type="button" onClick={downloadTemplate} className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50">템플릿 다운로드</button>
        <span className="text-[11px] text-slate-500">열 순서: 항목코드 · 한국어 · 영어 · 아랍어 (첫 행 헤더는 자동 인식)</span>
        {uploadMsg && <span className="w-full text-[11px] font-semibold text-teal-700">{uploadMsg}</span>}
      </div>

      <div className="grid grid-cols-[140px_1fr_auto] gap-2 px-1 text-[10px] font-bold uppercase text-slate-400">
        <span>항목 코드</span><span>항목명 (한/영/아랍)</span><span></span>
      </div>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-[140px_1fr_auto] items-start gap-2">
          <input value={it.code} onChange={(e) => update(i, "code", e.target.value)} placeholder="예: IMP-001"
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-sm outline-none focus:border-teal-600" />
          <MiniLangInput value={it.name} onChange={(v) => update(i, "name", v)}
            placeholderKo="예: 임플란트 픽스처" placeholderEn="e.g. Implant fixture" placeholderAr="مثال: غرسة" />
          <button type="button" onClick={() => remove(i)} className="mt-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:text-rose-500">삭제</button>
        </div>
      ))}
      <button type="button" onClick={add} className="w-fit text-xs font-bold text-teal-700">+ 항목 추가</button>
      <p className="text-[11px] text-slate-400">여기 등록한 항목이 시술 등록의 포함 항목·옵션 항목 선택지가 됩니다(병원별 관리). 엑셀 업로드 시 기존 목록을 대체합니다.</p>
    </div>
  );
}

/* 항목 1개 선택 — 병원 항목 마스터에서 고르거나 '직접 입력'(예외) */
function ItemPicker({ master, value, onChange }) {
  // value: { code, custom } — code set = master item, custom set = free text
  const isCustom = value?.custom !== undefined && value?.custom !== null;
  return (
    <div className="flex items-center gap-2">
      <select
        value={isCustom ? "__custom__" : (value?.code || "")}
        onChange={(e) => {
          if (e.target.value === "__custom__") onChange({ custom: "" });
          else onChange({ code: e.target.value });
        }}
        className="w-56 rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
        <option value="">항목 선택…</option>
        {master.map((m) => (
          <option key={m.code} value={m.code}>{m.code} · {m.name.ko || m.name.en}</option>
        ))}
        <option value="__custom__">+ 직접 입력 (예외)</option>
      </select>
      {isCustom && (
        <input value={value.custom} onChange={(e) => onChange({ custom: e.target.value })}
          placeholder="예외 항목명 직접 입력"
          className="flex-1 rounded-lg border border-amber-300 bg-amber-50/40 px-2 py-1.5 text-sm outline-none" />
      )}
    </div>
  );
}

/* 항목 목록(개별 칸) — 마스터 선택 행을 추가/삭제 */
function ItemListEditor({ master, defaultRows = [] }) {
  const [rows, setRows] = useState(defaultRows.length ? defaultRows : [{ code: "" }]);
  const update = (i, v) => setRows(rows.map((r, j) => (j === i ? v : r)));
  const add = () => setRows([...rows, { code: "" }]);
  const remove = (i) => setRows(rows.filter((_, j) => j !== i));
  return (
    <div className="grid gap-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 text-center text-xs font-bold text-slate-400">{i + 1}</span>
          <div className="flex-1"><ItemPicker master={master} value={r} onChange={(v) => update(i, v)} /></div>
          <button type="button" onClick={() => remove(i)} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:text-rose-500">삭제</button>
        </div>
      ))}
      <button type="button" onClick={add} className="w-fit text-xs font-bold text-teal-700">+ 항목 추가</button>
    </div>
  );
}

/* ───────────────────────── 어드민: 병원 관리 ───────────────────────── */

function HoursNote() {
  const [v, setV] = useState({});
  return <MiniLangInput value={v} onChange={setV} placeholderKo="점심 12:30~13:30 등 비고" placeholderEn="e.g. lunch 12:30–13:30" placeholderAr="مثال: استراحة الغداء" />;
}

function HospitalForm({ hospital, onClose }) {
  return (
    <Card
      title={hospital ? `병원 수정 — ${hospital.name}` : "병원 등록 — 노출 문구는 한/영/아랍어 직접 등록 · 미등록 언어는 영어 폴백 (영어 필수)"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <MultiLangField label="병원명 *" values={{ ko: hospital?.name || "", en: "", ar: "" }} />
        <div><Label>전문영역 * (복수 선택 — 클릭)</Label>
          <ChipMultiSelect
            options={["건강검진","종합병원","피부과","성형외과","안과","치과","산부인과","비뇨기과","정형외과"]}
            defaultSelected={hospital?.field ? [hospital.field] : []} />
        </div>
        <RegionSelect
          defaultSido={hospital?.region?.split("-")[0] || "서울시"}
          defaultGugun={hospital?.region?.split("-")[1] || "강남구"} />
        <div className="sm:col-span-2">
          <MultiLangField label="상세 주소 *" values={{ ko: "", en: "", ar: "" }} />
        </div>
        <div className="sm:col-span-2">
          <MultiLangField label="병원 한 줄 소개 * (카드/목록 노출)" values={{ ko: "", en: "", ar: "" }} />
        </div>
        <div className="sm:col-span-2">
          <MultiLangField label="병원 정보 (상세 페이지 본문)" textarea values={{ ko: "", en: "", ar: "" }} />
        </div>
        <div className="sm:col-span-2">
          <Label>병원 특장점 (인증·강점 — 제목 + 설명, 여러 개)</Label>
          <FeatureEditor defaultFeatures={hospital ? [{ title: "JCI 국제 인증", desc: "국제의료기관평가위원회 인증 병원" }] : []} />
        </div>
        <div className="sm:col-span-2">
          <Label>원장 정보 (여러 명 등록 가능 · 웹 노출)</Label>
          <DoctorEditor />
        </div>
        <div className="sm:col-span-2"><Label>통역 가능 언어 * (클릭 선택)</Label>
          <ChipMultiSelect
            options={["영어","일본어","중국어","베트남어","태국어","러시아어","아랍어"]}
            defaultSelected={hospital?.langs || []} />
        </div>
        <div className="sm:col-span-2"><Label>대표 이미지 * (크롭 자동 파생)</Label>
          <div className="flex h-[38px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">업로드 — 가로형·정사각형 자동 생성</div></div>
        <div className="sm:col-span-2"><Label>운영시간 (요일별 개별 등록)</Label>
          <div className="grid gap-1.5">
            {[["월","09:30","18:30",false],["화","09:30","18:30",false],["수","09:30","18:30",false],
              ["목","09:30","20:00",false],["금","09:30","18:30",false],["토","09:30","13:00",false],["일","","",true]].map(([d,st,et,closed])=>(
              <div key={d} className="flex items-center gap-2">
                <span className="w-8 text-sm font-bold text-slate-600">{d}</span>
                <input type="time" defaultValue={st} disabled={closed}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-300" />
                <span className="text-slate-300">~</span>
                <input type="time" defaultValue={et} disabled={closed}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-300" />
                {!closed && <div className="flex-1"><HoursNote /></div>}
                {closed && <div className="flex-1" />}
                <label className="flex items-center gap-1 whitespace-nowrap text-xs text-slate-500">
                  <input type="checkbox" defaultChecked={closed} /> 휴무
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 rounded-xl border border-teal-100 bg-teal-50/40 p-4">
          <div className="mb-3 text-xs font-extrabold uppercase tracking-wide text-teal-800">계약 조건 — 병원 기본값 (시술 단위로 상속·예외 설정)</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>수수료율 — 케어브릿지 통역 배정 시 *</Label>
              <div className="flex items-center gap-2"><Input type="number" defaultValue={hospital?.feeInterpreter || 1} className="w-20" /><span className="text-sm font-bold text-slate-500">%</span></div></div>
            <div><Label>수수료율 — 병원 제공/불필요 시 *</Label>
              <div className="flex items-center gap-2"><Input type="number" defaultValue={hospital?.fee || 1} className="w-20" /><span className="text-sm font-bold text-slate-500">%</span></div></div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><Label>수수료 계산 기준 *</Label>
              <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option selected={hospital?.feeBasis?.startsWith("결제액")}>결제액 (VAT 포함 금액)</option>
                <option selected={hospital?.feeBasis?.startsWith("공급가액")}>공급가액 (VAT 제외 금액)</option>
              </select>
              <label className="mt-1 flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" defaultChecked /> VAT 포함</label></div>
            <div><Label>계약 기간</Label><Input placeholder="2026-01-01 ~ " /></div>
          </div>
          <p className="mt-2 text-[11px] text-teal-700">통역을 케어브릿지이 배정하면 통역 비용 반영으로 수수료율이 달라질 수 있습니다. 각 예약의 통역 배정 주체에 맞는 요율이 정산 시 스냅샷됩니다.</p>
        </div>
        <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4">
          <Label>항목 마스터 (병원별 · 시술 포함/옵션 항목의 원천)</Label>
          <ItemMasterEditor defaultItems={hospital ? (ITEM_MASTER[hospital.name] || []) : []} />
        </div>
        <div className="sm:col-span-2">
          <MultiLangField label="내부 메모 (비공개 · 노출 안 됨)" values={{ ko: "협진 가능 여부 등", en: "", ar: "" }} />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">취소</button>
          <button onClick={onClose} className="rounded-lg bg-teal-700 px-6 py-2 text-sm font-bold text-white hover:bg-teal-800">
            {hospital ? "수정 저장" : "병원 등록"}
          </button>
        </div>
      </div>
    </Card>
  );
}

function HospitalDetail({ h, back, onEdit }) {
  const treatments = TREATMENTS.filter((t) => t.hospital === h.name);
  // 시술마다 노출/비노출 설정 (병원 상세에서 즉시 토글)
  const [tVisible, setTVisible] = useState(() => Object.fromEntries(treatments.map((t) => [t.id, t.visible ?? true])));
  const toggleTVisible = (id) => setTVisible((v) => ({ ...v, [id]: !v[id] }));
  const days = [["월","09:30 – 18:30"],["화","09:30 – 18:30"],["수","09:30 – 18:30"],["목","09:30 – 20:00"],["금","09:30 – 18:30"],["토","09:30 – 13:00"],["일","휴무"]];
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <button onClick={back} className="text-sm font-semibold text-slate-500 hover:text-teal-700">← 병원 목록</button>
        <button onClick={onEdit} className="rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-bold text-white">수정</button>
      </div>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{h.name}</h2>
              {h.visible
                ? <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">노출</span>
                : <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400">숨김</span>}
            </div>
            <div className="mt-1 text-sm text-slate-500">{h.field} · {h.region} · 통역 {h.langs.join(", ")}</div>
          </div>
          <div className="rounded-lg border border-teal-100 bg-teal-50/40 px-3 py-2 text-right">
            <div className="text-[10px] font-bold uppercase text-teal-700">수수료 ({h.feeBasis})</div>
            <div className="text-sm font-extrabold text-teal-800">케어브릿지 배정 {h.feeInterpreter}%</div>
            <div className="text-sm font-extrabold text-teal-800">병원 제공/불필요 {h.fee}%</div>
          </div>
        </div>
        <div className="mt-4"><Label>병원 정보</Label>
          <p className="text-sm leading-relaxed text-slate-600">강남 삼성역 인근의 임플란트·보철 전문 치과로, 외국인 환자를 위한 통역 서비스와 픽업 지원을 제공합니다. (상세 본문 예시)</p>
        </div>
        <div className="mt-4"><Label>특장점</Label>
          <div className="flex flex-wrap gap-2">
            {[["JCI 국제 인증","국제의료기관평가위원회 인증"],["영어·중국어 통역 상주","전담 통역 코디네이터"],["당일 예약 가능","긴급 진료 대응"]].map(([t,d])=>(
              <div key={t} className="rounded-lg border border-teal-100 bg-teal-50/40 px-3 py-2">
                <div className="text-sm font-bold text-teal-800">{t}</div>
                <div className="text-[11px] text-teal-600">{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4"><Label>원장 정보</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {[["김태호","대표원장","임플란트·보철","서울대 치의학 박사 · 20년 경력"],["이수진","진료원장","심미보철·교정","연세대 치의학 · 국제학회 정회원"]].map(([n,t,sp,c])=>(
              <div key={n} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400">사진</div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{n} <span className="text-xs font-semibold text-teal-700">{t}</span></div>
                  <div className="text-xs text-slate-500">{sp}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{c}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><Label>대표 이미지</Label><div className="flex h-32 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">대표 이미지 (가로형·정사각형 크롭 파생)</div></div>
          <div>
            <Label>운영시간 (요일별)</Label>
            <div className="grid gap-1">
              {days.map(([d, t]) => (
                <div key={d} className="flex items-center gap-4 rounded bg-slate-50 px-3 py-1 text-sm">
                  <span className="w-6 font-bold text-slate-600">{d}</span>
                  <span className={`tabular-nums ${t === "휴무" ? "text-rose-400" : "text-slate-700"}`}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card pad={false} title={`등록 시술 (${treatments.length})`}>
        {treatments.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">등록된 시술이 없습니다.</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-100 bg-slate-50/50"><tr><Th>시술명</Th><Th>진료과</Th><Th right>케어브릿지가</Th><Th right>수수료</Th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {treatments.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <Td className="font-semibold">
                    {t.name}
                    <button type="button" onClick={() => toggleTVisible(t.id)}
                      className={`ml-2 rounded px-2 py-0.5 text-xs font-bold ${tVisible[t.id] ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-400"}`}>
                      {tVisible[t.id] ? "노출" : "숨김"}
                    </button>
                  </Td>
                  <Td className="text-xs">{t.dept}</Td>
                  <Td right><Money v={t.price} /></Td>
                  <Td right className="text-xs">{t.fee}% · {t.feeBasis}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Hospitals() {
  const [mode, setMode] = useState("list"); // list | form | detail
  const [sel, setSel] = useState(null);
  const [rows, setRows] = useState(HOSPITALS);
  const toggleVisible = (id) => setRows((prev) => prev.map((h) => (h.id === id ? { ...h, visible: !h.visible } : h)));

  if (mode === "form") return <HospitalForm hospital={sel} onClose={() => { setMode(sel ? "detail" : "list"); }} />;
  if (mode === "detail" && sel) return <HospitalDetail h={sel} back={() => { setSel(null); setMode("list"); }} onEdit={() => setMode("form")} />;

  return (
    <Card pad={false} title="병원 목록 — 행 클릭 시 상세 · 노출은 토글로 즉시 변경"
      right={<button onClick={() => { setSel(null); setMode("form"); }} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800">+ 병원 등록</button>}>
      <table className="w-full">
        <thead className="border-b border-slate-100 bg-slate-50/50">
          <tr><Th>병원명</Th><Th>전문영역</Th><Th>지역</Th><Th right>수수료(배정/제공)</Th><Th>계산 기준</Th><Th right>시술</Th><Th>통역</Th><Th>노출</Th></tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((h) => (
            <tr key={h.id} onClick={() => { setSel(h); setMode("detail"); }} className="cursor-pointer transition hover:bg-teal-50/40">
              <Td className="font-semibold text-slate-900">{h.name}</Td>
              <Td>{h.field}</Td>
              <Td className="text-xs">{h.region}</Td>
              <Td right className="font-semibold text-xs">{h.feeInterpreter}% / {h.fee}%</Td>
              <Td><span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${h.feeBasis.startsWith("결제액") ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}>{h.feeBasis}</span></Td>
              <Td right>{h.treatments}</Td>
              <Td className="text-xs text-slate-400">{h.langs.join(" · ")}</Td>
              <Td><div onClick={(e) => e.stopPropagation()}><Toggle on={h.visible} onChange={() => toggleVisible(h.id)} /></div></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function SooyoField() {
  const [v, setV] = useState({});
  return <MiniLangInput value={v} onChange={setV} placeholderKo="예) 3개월" placeholderEn="e.g. 3 months" placeholderAr="مثال: 3 أشهر" />;
}

function TreatmentForm({ treatment, onClose }) {
  const [groups, setGroups] = useState(treatment?.optionGroups?.length ? treatment.optionGroups : []);
  const [pay, setPay] = useState(treatment?.payType || "불필요");
  const [hospName, setHospName] = useState(treatment?.hospital || HOSPITALS[0].name);
  const master = ITEM_MASTER[hospName] || [];
  return (
    <Card title={treatment ? `시술 수정 — ${treatment.name}` : "시술 등록"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>소속 병원 *</Label>
          <select value={hospName} onChange={(e) => setHospName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {HOSPITALS.map((h)=><option key={h.id}>{h.name}</option>)}
          </select></div>
        <div><Label>진료과 *</Label>
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {["건강검진","종합병원","피부과","성형외과","안과","치과","산부인과","비뇨기과","정형외과"].map(v=><option key={v} selected={treatment?.dept===v}>{v}</option>)}
          </select></div>
        <MultiLangField label="시술명 *" values={{ ko: treatment?.name || "", en: "", ar: "" }} />
        <div><Label>시술 대표 이미지 (없으면 병원 대표 폴백)</Label>
          <div className="flex h-[38px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">업로드</div></div>
        <div className="sm:col-span-2"><MultiLangField label="시술 설명 * (카드/목록 노출)" textarea values={{ ko: treatment?.desc || "", en: "", ar: "" }} /></div>
        <div className="sm:col-span-2"><MultiLangField label="시술 정보 (상세 페이지 본문)" textarea values={{ ko: "", en: "", ar: "" }} /></div>
        <div><Label>정가 (KRW) *</Label><Input type="number" defaultValue={treatment?.list || ""} /></div>
        <div><Label>케어브릿지가 (KRW) *</Label><Input type="number" defaultValue={treatment?.price || ""} /></div>
        <div><Label>할인 유형</Label>
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option>(a) 국내 할인가 동일</option><option>(b) 외국인 수가</option><option>(c) 외국인 수가 + 추가 할인</option>
          </select></div>

        <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 sm:col-span-2">
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div><Label>수수료율 (시술 단위) *</Label>
              <div className="flex items-center gap-2"><Input type="number" defaultValue={treatment?.fee || 1} className="w-20" /><span className="text-sm font-bold text-slate-500">%</span></div></div>
            <div><Label>수수료 계산 기준 *</Label>
              <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option selected={treatment?.feeBasis?.startsWith("결제액")}>결제액 (VAT 포함)</option>
                <option selected={treatment?.feeBasis?.startsWith("공급가액")}>공급가액 (VAT 제외)</option>
              </select></div>
          </div>
          <p className="text-[11px] text-teal-700">병원 기본값 상속 · 필요 시 이 시술만 예외 지정. 정산 시 내원 건에 스냅샷됩니다.</p>
        </div>

        <div className="sm:col-span-2">
          <Label>결제 방식 *</Label>
          <div className="flex gap-2">
            {["불필요","예약금","선결제"].map((v)=>(
              <button key={v} type="button" onClick={()=>setPay(v)}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${pay===v?"bg-teal-700 text-white":"bg-slate-100 text-slate-500"}`}>{v}</button>
            ))}
          </div>
          {pay==="예약금" && (
            <div className="mt-2 rounded-lg border border-teal-100 bg-teal-50/40 p-3">
              <Label>예약금 금액 (KRW) *</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue={treatment?.depositAmount || 100000} className="w-40" />
                <span className="text-xs text-slate-500">원</span>
              </div>
              <p className="mt-1 text-[11px] text-teal-700">노쇼 방지용 예약금. <b>방문 완료 시 전액 환불</b>됩니다. 정산 금액과는 무관합니다.</p>
            </div>
          )}
          {pay==="선결제" && (
            <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-700">
              <b>선결제 = 시술비 전액 사전 결제</b>. 환불되지 않으며, 정산 시 결제액에 포함됩니다. (금액은 케어브릿지가 기준)
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label>포함 항목 (병원 항목 마스터에서 선택 · 개별 등록)</Label>
          <ItemListEditor master={master} defaultRows={(treatment?.includes || []).map((code) => ({ code }))} />
          {master.length === 0 && <p className="mt-1 text-[11px] text-orange-600">선택한 병원에 등록된 항목 마스터가 없습니다. 병원 등록에서 항목을 먼저 추가하세요.</p>}
        </div>

        <div className="sm:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <Label>옵션 그룹 (택N)</Label>
            <button type="button" onClick={()=>setGroups([...groups,{name:"새 그룹",pick:1,items:[]}])} className="text-xs font-bold text-teal-700">+ 그룹 추가</button>
          </div>
          {groups.length===0 && <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">옵션 없음</div>}
          {groups.map((g,i)=>(
            <div key={i} className="mb-2 grid gap-2 rounded-lg border border-slate-200 p-2">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="mb-0.5 text-[10px] font-bold text-slate-400">그룹명</div>
                  <MiniLangInput value={typeof g.name === "object" ? g.name : { ko: g.name || "" }}
                    onChange={(v) => setGroups(groups.map((x, j) => j === i ? { ...x, name: v } : x))}
                    placeholderKo="그룹명" placeholderEn="Group name" placeholderAr="اسم المجموعة" />
                </div>
                <div>
                  <div className="mb-0.5 text-[10px] font-bold text-slate-400">택</div>
                  <Input type="number" defaultValue={g.pick} className="w-16" />
                </div>
              </div>
              <div>
                <div className="mb-0.5 text-[10px] font-bold text-slate-400">항목 (마스터에서 개별 선택)</div>
                <ItemListEditor master={master} defaultRows={(g.items || []).map((code) => ({ code }))} />
              </div>
            </div>
          ))}
        </div>

        <div className="sm:col-span-2">
          <MultiLangField label="진행 순서 (단계별, 한 줄에 하나씩)" textarea values={{ ko: "", en: "", ar: "" }} />
        </div>

        <div className="sm:col-span-2"><Label>비포/애프터 (선택 — 있으면 시술 상세에 노출)</Label>
          <div className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
            <div><span className="text-[11px] font-bold text-slate-400">비포 사진</span>
              <div className="mt-1 flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">업로드</div></div>
            <div><span className="text-[11px] font-bold text-slate-400">애프터 사진</span>
              <div className="mt-1 flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">업로드</div></div>
            <div><span className="text-[11px] font-bold text-slate-400">소요기간</span>
              <div className="mt-1"><SooyoField /></div></div>
          </div>
        </div>

        <div className="sm:col-span-2"><MultiLangField label="내원 전 준비사항" textarea values={{ ko: "", en: "", ar: "" }} /></div>

        <div className="sm:col-span-2"><MultiLangField label="안내사항" textarea values={{ ko: "", en: "", ar: "" }} /></div>

        <div className="sm:col-span-2"><MultiLangField label="도착 전 준비사항" textarea values={{ ko: "", en: "", ar: "" }} /></div>

        <div className="sm:col-span-2 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">취소</button>
          <button onClick={onClose} className="rounded-lg bg-teal-700 px-6 py-2 text-sm font-bold text-white hover:bg-teal-800">{treatment ? "수정 저장" : "시술 등록"}</button>
        </div>
      </div>
    </Card>
  );
}

function TreatmentDetail({ t, back, onEdit }) {
  const hosp = HOSPITALS.find((h) => h.name === t.hospital);
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <button onClick={back} className="text-sm font-semibold text-slate-500 hover:text-teal-700">← 시술 목록</button>
        <button onClick={onEdit} className="rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-bold text-white">수정</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid content-start gap-4 lg:col-span-2">
          <Card>
            <div className="text-xs font-bold text-slate-400">{t.dept} · {t.hospital}</div>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">{t.name}</h2>
            {t.desc && <p className="mt-1 text-sm text-slate-500">{t.desc.ko || t.desc.en}</p>}
            <div className="mt-3 flex h-40 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">시술 대표 이미지 (가로형)</div>
            {t.info && (t.info.ko || t.info.en) && (
              <div className="mt-4"><Label>시술 정보</Label>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{t.info.ko || t.info.en}</p>
              </div>
            )}
            <div className="mt-4"><Label>포함 항목</Label>
              <ul className="grid gap-1">{t.includes.map((code)=>(
                <li key={code} className="flex items-center gap-2 rounded bg-slate-50 px-2 py-1 text-sm">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{code}</span>
                  <span>{itemLabel(t.hospital, code, "ko")}</span>
                </li>
              ))}</ul>
            </div>
            <div className="mt-4"><Label>옵션 그룹 (택N)</Label>
              {t.optionGroups.length===0 && <div className="text-sm text-slate-400">옵션 없음</div>}
              {t.optionGroups.map((g)=>(
                <div key={g.name} className="mb-2 rounded-lg border border-slate-200 p-2">
                  <div className="mb-1 flex items-center justify-between"><b className="text-xs">{g.name}</b>
                    <span className="rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-bold text-white">택 {g.pick}</span></div>
                  <div className="flex flex-wrap gap-1">{g.items.map((code)=>(
                    <span key={code} className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                      <span className="mr-1 font-mono text-[9px] text-slate-400">{code}</span>{itemLabel(t.hospital, code, "ko")}
                    </span>
                  ))}</div>
                </div>
              ))}
            </div>
            {t.steps && (t.steps.ko || t.steps.en) && (
              <div className="mt-4"><Label>진행 순서</Label>
                <ol className="grid gap-1">
                  {(t.steps.ko || t.steps.en).split("\n").filter(Boolean).map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white">{i + 1}</span>
                      <span className="text-slate-700">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="mt-4"><Label>비포/애프터</Label>
              {t.beforeAfter ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  <div><div className="text-[11px] font-bold text-slate-400">비포</div>
                    <div className="mt-1 flex h-24 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">비포 사진</div></div>
                  <div><div className="text-[11px] font-bold text-slate-400">애프터</div>
                    <div className="mt-1 flex h-24 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">애프터 사진</div></div>
                  <div><div className="text-[11px] font-bold text-slate-400">소요기간</div>
                    <div className="mt-1 rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">{t.sooyo ? `${t.sooyo.value}${t.sooyo.unit}` : "-"}</div></div>
                </div>
              ) : (
                <div className="text-sm text-slate-400">비포/애프터 미등록{t.sooyo ? ` · 소요기간 ${t.sooyo.value}${t.sooyo.unit}` : ""}</div>
              )}
            </div>
            {t.prep && (t.prep.ko || t.prep.en) && (
              <div className="mt-4"><Label>내원 전 준비사항</Label>
                <ul className="grid gap-1">
                  {(t.prep.ko || t.prep.en).split("\n").filter(Boolean).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {t.notice && (t.notice.ko || t.notice.en) && (
              <div className="mt-4"><Label>안내사항</Label>
                <p className="whitespace-pre-line rounded-lg bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-800">{t.notice.ko || t.notice.en}</p>
              </div>
            )}
          </Card>
        </div>
        <div className="grid content-start gap-4">
          <Card title="가격 · 결제">
            <div className="grid gap-3 text-sm">
              <div><Label>가격</Label>
                <span className="text-slate-300 line-through">{fmtKRW(t.list)}</span>{" "}<Money v={t.price} sub />
                <span className="ml-2 rounded bg-rose-50 px-1.5 py-0.5 text-xs font-bold text-rose-600">-{Math.round((1-t.price/t.list)*100)}%</span>
              </div>
              <div><Label>결제 방식</Label>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                  {t.payType || "불필요"}{t.payType === "예약금" && t.depositAmount ? ` · 예약금 ${fmtKRW(t.depositAmount)}` : ""}
                </span></div>
              {t.discountType && <div><Label>할인 유형</Label>
                <span className="text-sm text-slate-700">{t.discountType}</span></div>}
            </div>
          </Card>
          <Card title="수수료 (시술 단위)">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-extrabold text-teal-800">{t.fee}%</span>
              <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${t.feeBasis.startsWith("결제액")?"bg-blue-50 text-blue-700":"bg-violet-50 text-violet-700"}`}>{t.feeBasis}</span>
              {t.feeInherit
                ? <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500">병원 기본값 상속</span>
                : <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[11px] font-bold text-orange-700">시술 예외</span>}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">병원 기본값: {hosp?.fee}% · {hosp?.feeBasis}</p>
          </Card>
          <Card title="노출 문구 (한/영/아랍어)">
            <div className="flex gap-1 text-[11px] font-bold">
              <span className="rounded bg-teal-50 px-2 py-0.5 text-teal-700">한국어 ●</span>
              <span className="rounded bg-teal-50 px-2 py-0.5 text-teal-700">English ●</span>
              <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-500">العربية ○</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">미등록 언어는 영어 폴백</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Treatments() {
  const [mode, setMode] = useState("list");
  const [sel, setSel] = useState(null);
  const [rows, setRows] = useState(TREATMENTS);
  const toggleVisible = (id) => setRows((prev) => prev.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)));

  if (mode === "form") return <TreatmentForm treatment={sel} onClose={() => setMode(sel ? "detail" : "list")} />;
  if (mode === "detail" && sel) return <TreatmentDetail t={sel} back={() => { setSel(null); setMode("list"); }} onEdit={() => setMode("form")} />;

  return (
    <Card pad={false} title="시술 목록 — 행 클릭 시 상세 · 노출은 토글로 즉시 변경"
      right={<button onClick={() => { setSel(null); setMode("form"); }} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800">+ 시술 등록</button>}>
      <table className="w-full">
        <thead className="border-b border-slate-100 bg-slate-50/50">
          <tr><Th>시술명</Th><Th>병원</Th><Th>진료과</Th><Th right>케어브릿지가</Th><Th right>수수료</Th><Th right>예약</Th><Th>노출</Th></tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((t) => (
            <tr key={t.id} onClick={() => { setSel(t); setMode("detail"); }} className="cursor-pointer transition hover:bg-teal-50/40">
              <Td className="font-semibold text-slate-900">{t.name}</Td>
              <Td className="text-xs">{t.hospital}</Td>
              <Td className="text-xs">{t.dept}</Td>
              <Td right>
                <div className="text-xs text-slate-300 line-through">{fmtKRW(t.list)}</div>
                <Money v={t.price} />
              </Td>
              <Td right className="text-xs">{t.fee}%</Td>
              <Td right>{t.bookings}</Td>
              <Td><div onClick={(e) => e.stopPropagation()}><Toggle on={t.visible} onChange={() => toggleVisible(t.id)} /></div></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ───────────────────────── exports (admin.jsx 운영 그룹에 연결) ───────────────────────── */

/* ───────────────────────── 리치 텍스트 에디터 (블로그 본문) ───────────────────────── */
/* 서식 있는 본문 에디터 — 다국어 탭 + 툴바(글자크기·색·볼드/이탤릭/밑줄·정렬·리스트·링크·이미지) */
function RichEditor({ label, values = {} }) {
  const [lang, setLang] = useState("ko");
  const cur = LANGS.find((l) => l.key === lang);
  const refs = { ko: useRef(null), en: useRef(null), ar: useRef(null) };
  const hasContent = (html) => !!((html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()) || /<(img|iframe|video)/i.test(html || "");
  const [filled, setFilled] = useState({ ko: hasContent(values.ko), en: hasContent(values.en), ar: hasContent(values.ar) });

  const cmd = (command, value = null) => {
    const el = refs[lang].current;
    if (el) el.focus();
    document.execCommand(command, false, value);
  };
  const insertImage = () => {
    const url = typeof window !== "undefined" ? window.prompt("이미지 URL을 입력하세요 (또는 업로드 후 주소)") : null;
    if (url) cmd("insertImage", url);
  };
  const insertLink = () => {
    const url = typeof window !== "undefined" ? window.prompt("링크 URL을 입력하세요") : null;
    if (url) cmd("createLink", url);
  };

  const ToolBtn = ({ onClick, title, children }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className="flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200">{children}</button>
  );
  const Sep = () => <span className="mx-0.5 h-5 w-px bg-slate-200" />;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
          {LANGS.map((l) => (
            <button key={l.key} type="button" onClick={() => setLang(l.key)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${lang === l.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-400"}`}>
              {l.label}
              <span className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${filled[l.key] ? "bg-green-500" : "bg-slate-300"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
        <select onMouseDown={(e) => e.preventDefault()} onChange={(e) => cmd("formatBlock", e.target.value)}
          className="h-7 rounded border border-slate-200 bg-white px-1 text-xs" defaultValue="p" title="문단 스타일">
          <option value="p">본문</option>
          <option value="h2">제목 1</option>
          <option value="h3">제목 2</option>
          <option value="blockquote">인용</option>
        </select>
        <select onMouseDown={(e) => e.preventDefault()} onChange={(e) => cmd("fontSize", e.target.value)}
          className="h-7 rounded border border-slate-200 bg-white px-1 text-xs" defaultValue="3" title="글자 크기">
          <option value="1">아주 작게</option>
          <option value="2">작게</option>
          <option value="3">보통</option>
          <option value="5">크게</option>
          <option value="6">아주 크게</option>
        </select>
        <Sep />
        <ToolBtn title="굵게" onClick={() => cmd("bold")}><span className="font-extrabold">B</span></ToolBtn>
        <ToolBtn title="기울임" onClick={() => cmd("italic")}><span className="italic">I</span></ToolBtn>
        <ToolBtn title="밑줄" onClick={() => cmd("underline")}><span className="underline">U</span></ToolBtn>
        <ToolBtn title="취소선" onClick={() => cmd("strikeThrough")}><span className="line-through">S</span></ToolBtn>
        <label className="flex h-7 cursor-pointer items-center gap-1 rounded px-1.5 hover:bg-slate-200" title="글자 색" onMouseDown={(e) => e.preventDefault()}>
          <span className="text-sm font-bold" style={{ color: "#1B59FA" }}>A</span>
          <input type="color" defaultValue="#1B59FA" onChange={(e) => cmd("foreColor", e.target.value)} className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" />
        </label>
        <label className="flex h-7 cursor-pointer items-center gap-1 rounded px-1.5 hover:bg-slate-200" title="형광펜" onMouseDown={(e) => e.preventDefault()}>
          <span className="rounded bg-yellow-200 px-1 text-xs font-bold">H</span>
          <input type="color" defaultValue="#FEF08A" onChange={(e) => cmd("hiliteColor", e.target.value)} className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" />
        </label>
        <Sep />
        <ToolBtn title="왼쪽 정렬" onClick={() => cmd("justifyLeft")}>≡</ToolBtn>
        <ToolBtn title="가운데 정렬" onClick={() => cmd("justifyCenter")}>☰</ToolBtn>
        <ToolBtn title="글머리 목록" onClick={() => cmd("insertUnorderedList")}>•≡</ToolBtn>
        <ToolBtn title="번호 목록" onClick={() => cmd("insertOrderedList")}>1.</ToolBtn>
        <Sep />
        <ToolBtn title="링크" onClick={insertLink}>🔗</ToolBtn>
        <ToolBtn title="이미지 삽입" onClick={insertImage}>🖼</ToolBtn>
        <ToolBtn title="서식 지우기" onClick={() => cmd("removeFormat")}>✕</ToolBtn>
      </div>

      {/* 편집 영역 (언어별) */}
      {LANGS.map((l) => (
        <div key={l.key}
          ref={refs[l.key]}
          contentEditable
          suppressContentEditableWarning
          dir={l.dir}
          onInput={(e) => { const has = hasContent(e.currentTarget.innerHTML); setFilled((p) => ({ ...p, [l.key]: has })); }}
          dangerouslySetInnerHTML={{ __html: values[l.key] || "" }}
          data-ph={l.key === "ko" ? "본문을 입력하세요…" : l.key === "en" ? "Write the article body…" : "اكتب النص هنا…"}
          className={`${lang === l.key ? "block" : "hidden"} min-h-[220px] w-full rounded-b-lg border border-t-0 border-slate-200 px-3 py-2 text-sm leading-relaxed outline-none focus:border-teal-600 [&:empty:before]:text-slate-400 [&:empty:before]:content-[attr(data-ph)] [&_h2]:my-2 [&_h2]:text-lg [&_h2]:font-extrabold [&_h3]:my-1.5 [&_h3]:text-base [&_h3]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-teal-300 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-teal-700 [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg`}
        />
      ))}
      <p className="mt-1 text-[11px] text-slate-400">글자 크기·색·볼드/밑줄, 목록, 링크, 이미지 삽입을 지원합니다. 언어 탭별로 본문을 각각 작성하세요.</p>
    </div>
  );
}

/* ───────────────────────── 어드민: 블로그 관리 ───────────────────────── */
const INITIAL_POSTS = [
  { id: "B-021", status: "발행", category: "By Health Concern", title: { ko: "한국 임플란트, 왜 인기일까?", en: "Why Korean Dental Implants?", ar: "" }, date: "2026-06-25", author: "케어브릿지 에디터",
    body: { ko: "<h2>한국 임플란트의 강점</h2><p>한국은 <b>정밀 진단</b>과 <span style=\"color:#1B59FA\">숙련된 의료진</span>으로 잘 알려져 있습니다.</p><ul><li>당일 진단 가능</li><li>다국어 통역 지원</li></ul>", en: "<h2>Why Korea</h2><p>Precision and skilled clinicians.</p>", ar: "" } },
  { id: "B-020", status: "임시저장", category: "Medical Guides", title: { ko: "종합검진 전 알아둘 것", en: "", ar: "" }, date: "2026-06-30", author: "케어브릿지 에디터", body: { ko: "", en: "", ar: "" } },
];

function Blog() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [mode, setMode] = useState("list"); // list | form
  const [editing, setEditing] = useState(null);

  const togglePublish = (id) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === "발행" ? "임시저장" : "발행" } : p)));

  if (mode === "form") {
    return (
      <Card title={editing ? "블로그 글 수정" : "블로그 글 작성 — 발행 시 웹사이트에 노출됩니다"}>
        <div className="grid gap-4">
          <MultiLangField label="제목 *" values={editing?.title || { ko: "", en: "", ar: "" }} />
          <div>
            <Label>URL slug</Label>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white focus-within:border-teal-600">
              <span className="select-none pl-3 text-sm text-slate-400">/blog/</span>
              <input defaultValue={editing?.slug || ""} placeholder="korea-checkup-guide"
                className="w-full rounded-lg bg-transparent px-1.5 py-2 text-sm text-slate-800 outline-none" />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">아티클 웹주소(언어 공용·단일). 영문 소문자·하이픈(-)만, 중복 불가. 비우면 제목에서 자동 생성. 발행 후 변경 시 기존 링크가 깨집니다.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><Label>카테고리</Label>
              <select defaultValue={editing?.category || "By Health Concern"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {["By Health Concern","Medical Guides","Doctors & Hospitals"].map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div><Label>작성자</Label>
              <Input defaultValue={editing?.author || ""} placeholder="예: 케어브릿지 에디터 / 김OO 원장" /></div>
            <div><Label>대표 이미지</Label>
              <div className="flex h-[38px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">업로드</div></div>
          </div>
          <RichEditor label="본문 * (한/영/아랍)" values={editing?.body || { ko: "", en: "", ar: "" }} />
          <details className="rounded-lg border border-slate-200 bg-slate-50/40">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-bold text-slate-700">
              SEO 설정 <span className="font-normal text-slate-400">— 검색·SNS 공유 노출용 (선택 · 비우면 자동)</span>
            </summary>
            <div className="grid gap-4 border-t border-slate-200 p-4">
              <MultiLangField label="메타 제목 (meta title)" values={editing?.metaTitle || { ko: "", en: "", ar: "" }} />
              <MultiLangField label="메타 설명 (meta description)" textarea values={editing?.metaDesc || { ko: "", en: "", ar: "" }} />
              <div><Label>OG 이미지 (공유 카드 · 권장 1200×630)</Label>
                <div className="flex h-[38px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">업로드 (비우면 대표 이미지 사용)</div></div>
              <p className="text-[11px] text-slate-400">메타 제목·설명은 언어별 입력, 비우면 제목·본문 발췌로 자동 폴백됩니다.</p>
            </div>
          </details>
          <div className="flex justify-end gap-2">
            <button onClick={() => setMode("list")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">취소</button>
            <button onClick={() => setMode("list")} className="rounded-lg border border-teal-700 px-4 py-2 text-sm font-bold text-teal-700">임시저장</button>
            <button onClick={() => setMode("list")} className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-bold text-white hover:bg-teal-800">발행 → 웹 노출</button>
          </div>
          <p className="text-[11px] text-slate-400">미등록 언어는 영어로 폴백 노출됩니다. 발행 상태의 글만 웹사이트 블로그에 표시됩니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card pad={false} title="블로그 관리 — 발행 상태의 글이 웹사이트에 노출됩니다"
      right={<button onClick={() => { setEditing(null); setMode("form"); }} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white">+ 새 글 작성</button>}>
      <table className="w-full">
        <thead className="border-b border-slate-100 bg-slate-50/50">
          <tr><Th>제목</Th><Th>카테고리</Th><Th>작성일</Th><Th>작성자</Th><Th>노출</Th><Th></Th></tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {posts.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/60">
              <Td className="font-semibold text-slate-800">{p.title.ko || p.title.en || "(제목 없음)"}
                <span className="ml-1 text-[11px] font-normal text-slate-400">{[p.title.ko && "한", p.title.en && "EN", p.title.ar && "AR"].filter(Boolean).join("·")}</span>
              </Td>
              <Td className="text-xs">{p.category}</Td>
              <Td className="text-xs text-slate-400">{p.date}</Td>
              <Td className="text-xs">{p.author}</Td>
              <Td><div onClick={(e) => e.stopPropagation()}><Toggle on={p.status === "발행"} onChange={() => togglePublish(p.id)} labelOn="발행" labelOff="임시저장" /></div></Td>
              <Td><button onClick={() => { setEditing(p); setMode("form"); }} className="text-xs font-bold text-teal-700">수정</button></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* 목업 데이터 강조 배너 (performance-dashboard 스타일) */
function MockBanner() {
  return (
    <div className="sd-admin" style={{ margin: "0 0 14px", padding: "10px 14px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: "#92400E", lineHeight: 1.5 }}>
      ⚠️ 데이터는 목업(데모) 데이터입니다 — 수수료율·가격 등 모든 수치는 예시이며 실제와 무관합니다.
    </div>
  );
}
export function HospitalsPanel() { return <div className="sd-admin"><MockBanner /><Hospitals /></div>; }
export function TreatmentsPanel() { return <div className="sd-admin"><MockBanner /><Treatments /></div>; }
export function BlogPanel() { return <div className="sd-admin"><MockBanner /><Blog /></div>; }
