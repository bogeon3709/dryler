// =====================================
// DRYLER (드라일러)
// 우산 공유 운영 관리자 페이지
// =====================================

const STORAGE_KEY = "dryler-state-v2";

// 대여기 1대에 우산 10개 보관
const UMBRELLAS_PER_MACHINE = 10;

// ---------- 예시 데이터 ----------
const SUBWAY_DATA = [
  ["강남역",               "강남구",   "2호선·신분당선",      37.4979, 127.0276, 4, 22],
  ["시청역",               "중구",     "1·2호선",             37.5657, 126.9769, 3, 6],
  ["홍대입구역",           "마포구",   "2호선·공항철도",      37.5572, 126.9245, 4, 27],
  ["서울역",               "용산구",   "1·4호선",             37.5547, 126.9707, 4, 0],
  ["잠실역",               "송파구",   "2·8호선",             37.5133, 127.1001, 3, 5],
  ["종로3가역",            "종로구",   "1·3·5호선",           37.5704, 126.9921, 2, 14],
  ["신촌역",               "서대문구", "2호선",               37.5552, 126.9369, 2, 11],
  ["건대입구역",           "광진구",   "2·7호선",             37.5404, 127.0692, 3, 19],
  ["왕십리역",             "성동구",   "2·5호선·수인분당선",  37.5612, 127.0371, 2, 3],
  ["고속터미널역",         "서초구",   "3·7·9호선",           37.5049, 127.0049, 3, 17],
  ["사당역",               "동작구",   "2·4호선",             37.4765, 126.9816, 2, 9],
  ["신림역",               "관악구",   "2호선·신림선",        37.4842, 126.9297, 2, 12],
  ["여의도역",             "영등포구", "5·9호선",             37.5216, 126.9243, 3, 21],
  ["광화문역",             "종로구",   "5호선",               37.5710, 126.9768, 2, 0],
  ["동대문역사문화공원역", "중구",     "2·4·5호선",           37.5653, 127.0079, 2, 13],
  ["노원역",               "노원구",   "4·7호선",             37.6551, 127.0613, 2, 15],
  ["수유역",               "강북구",   "4호선",               37.6380, 127.0257, 1, 7],
  ["구로디지털단지역",     "구로구",   "2호선",               37.4852, 126.9015, 2, 4],
  ["합정역",               "마포구",   "2·6호선",             37.5495, 126.9139, 2, 16],
  ["삼성역",               "강남구",   "2호선",               37.5088, 127.0631, 3, 20],
  ["성수역",               "성동구",   "2호선",               37.5446, 127.0559, 2, 10],
  ["이태원역",             "용산구",   "6호선",               37.5345, 126.9946, 1, 8]
];

const SCHOOL_DATA = [
  ["서울대학교",     "관악구",   37.4600, 126.9519, 2, 13],
  ["연세대학교",     "서대문구", 37.5658, 126.9386, 2, 9],
  ["고려대학교",     "성북구",   37.5894, 127.0322, 2, 16],
  ["서강대학교",     "마포구",   37.5509, 126.9410, 1, 2],
  ["한양대학교",     "성동구",   37.5574, 127.0453, 2, 11],
  ["건국대학교",     "광진구",   37.5420, 127.0796, 1, 6],
  ["이화여자대학교", "서대문구", 37.5619, 126.9468, 1, 0],
  ["성균관대학교",   "종로구",   37.5875, 126.9940, 1, 7],
  ["중앙대학교",     "동작구",   37.5048, 126.9572, 2, 14],
  ["경희대학교",     "동대문구", 37.5965, 127.0520, 1, 5]
];

const defaultStations = [
  ...SUBWAY_DATA.map(([name, gu, lines, lat, lng, machines, available]) => ({
    type: "subway", name, location: `서울 ${gu} · ${lines}`, lat, lng, machines, available
  })),
  ...SCHOOL_DATA.map(([name, gu, lat, lng, machines, available]) => ({
    type: "school", name, location: `서울 ${gu} · 교내`, lat, lng, machines, available
  }))
].map((s, i) => ({ id: i + 1, ...s, total: s.machines * UMBRELLAS_PER_MACHINE }));

const TYPE_LABEL = { subway: "지하철역", school: "학교" };

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function createDefaultState() {
  const historySeed = [
    [1, "rent", 0.3], [24, "return", 0.8], [2, "rent", 1.5], [5, "rent", 2.1],
    [25, "return", 3.4], [3, "rent", 5], [13, "rent", 7.2], [23, "rent", 26],
    [8, "return", 30], [20, "rent", 50], [27, "rent", 75], [1, "return", 120]
  ];

  return {
    stations: defaultStations.map(s => ({ ...s })),
    favorites: [1, 4, 23],
    history: historySeed.map(([stationId, type, h], i) => ({
      id: Date.now() - i,
      stationId,
      stationName: defaultStations.find(s => s.id === stationId).name,
      type,
      time: hoursAgo(h)
    })),
    notices: [
      { id: 1, title: "11월 대여소 정기 점검 안내", content: "11월 10일(화) 02:00~05:00 동안 전체 대여소 시스템 점검이 진행됩니다.", pinned: true, date: hoursAgo(48) },
      { id: 2, title: "대학교 대여기 추가 설치 안내", content: "2학기 이용량 증가에 따라 서강대학교와 이화여자대학교에 대여기를 추가 설치합니다.", pinned: false, date: hoursAgo(96) }
    ],
    inquiries: [
      { id: 1, user: "김*연", title: "반납했는데 대여 중으로 표시돼요", content: "어제 저녁 시청역에 반납했는데 앱에서 아직 대여 중으로 나옵니다.", date: hoursAgo(2), answer: null }
    ],
    profile: {
      name: "관리자",
      email: "admin@dryler.kr",
      phone: "010-1234-5678",
      area: "서울 전 지역",
      alertLow: true,
      alertInquiry: true
    }
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.stations)) return saved;
  } catch (e) {
    console.warn("저장된 데이터를 불러오지 못했습니다.", e);
  }
  return createDefaultState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("데이터를 저장하지 못했습니다.", e);
  }
}

let state = loadState();

function $(id) {
  return document.getElementById(id);
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

function isToday(iso) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

let toastTimer;
function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function findStation(id) {
  return state.stations.find(s => s.id === id);
}

function getStatus(station) {
  if (station.available === 0) return { text: "재고 없음", className: "empty" };
  if (station.available <= station.total * 0.2) return { text: "재고 부족", className: "low" };
  return { text: "정상 운영", className: "normal" };
}

const PAGES = {
  home:      { title: "통합 운영 대시보드", crumb: "홈" },
  map:       { title: "대여기 설치 위치",   crumb: "위치" },
  favorites: { title: "즐겨찾기",          crumb: "즐겨찾기" },
  history:   { title: "이용내역",          crumb: "이용내역" },
  notice:    { title: "공지사항 관리",     crumb: "공지사항" },
  support:   { title: "고객센터",          crumb: "고객센터" },
  profile:   { title: "내정보",            crumb: "내정보" }
};

let pendingFocusId = null;
const LANDING_SECTIONS = ["", "top", "service", "how", "eco", "contact"];

function showPage() {
  const hash = location.hash.slice(1);
  const onLanding = LANDING_SECTIONS.includes(hash);

  const landingEl = $("landing");
  const appEl = document.querySelector(".app");
  if (landingEl) landingEl.hidden = !onLanding;
  if (appEl) appEl.hidden = onLanding;

  if (onLanding) {
    document.title = "DRYLER — 당신의 일상에 가장 가까운 우산";
    const target = hash && hash !== "top" ? document.getElementById(hash) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
    return;
  }

  let pageId = hash;
  if (!PAGES[pageId]) pageId = "home";

  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === `page-${pageId}`);
  });

  document.querySelectorAll(".menu-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === pageId);
  });

  const pageTitleEl = $("pageTitle");
  const breadcrumbEl = $("breadcrumb");
  if (pageTitleEl) pageTitleEl.textContent = PAGES[pageId].title;
  if (breadcrumbEl) breadcrumbEl.textContent = `드라일러 / ${PAGES[pageId].crumb}`;
  document.title = `${PAGES[pageId].title} | 드라일러`;

  if (pageId === "map") initMap();
  if (pageId === "profile") fillProfileForm();

  window.scrollTo({ top: 0, behavior: "instant" });
}

// ---------- 통계 및 홈 화면 렌더링 ----------

function updateStats() {
  const total = state.stations.reduce((sum, s) => sum + s.total, 0);
  const available = state.stations.reduce((sum, s) => sum + s.available, 0);
  const machines = state.stations.reduce((sum, s) => sum + s.machines, 0);
  const subways = state.stations.filter(s => s.type === "subway").length;

  if ($("totalStations")) $("totalStations").textContent = state.stations.length;
  if ($("stationBreakdown")) $("stationBreakdown").textContent = `지하철역 ${subways} · 학교 ${state.stations.length - subways}`;
  if ($("totalMachines")) $("totalMachines").textContent = `${machines}대`;
  if ($("totalUmbrellas")) $("totalUmbrellas").textContent = `전체 우산 ${total}개`;
  if ($("availableUmbrellas")) $("availableUmbrellas").textContent = available;
  if ($("rentedUmbrellas")) $("rentedUmbrellas").textContent = total - available;

  if ($("todayDate")) {
    $("todayDate").textContent = new Date().toLocaleDateString("ko-KR", {
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    });
  }
}

function stationCardHTML(station) {
  const rented = station.total - station.available;
  const percentage = Math.round((station.available / station.total) * 100);
  const status = getStatus(station);
  const isFav = state.favorites.includes(station.id);

  return `
    <article class="station-card">
      <div class="station-top">
        <span class="type-tag ${station.type}">${TYPE_LABEL[station.type]} · 대여기 ${station.machines}대</span>
        <div class="station-top-right">
          <span class="status ${status.className}">${status.text}</span>
          <button class="fav-btn ${isFav ? "on" : ""}" data-action="fav" data-id="${station.id}"
            aria-pressed="${isFav}" aria-label="${station.name} 즐겨찾기" title="즐겨찾기">
            ${isFav ? "★" : "☆"}
          </button>
        </div>
      </div>

      <h3>${station.name}</h3>
      <span class="station-location">${station.location}</span>

      <div class="stock-numbers">
        <div><span>대여 가능</span><strong>${station.available}개</strong></div>
        <div class="borrowed"><span>대여 중</span><strong>${rented}개</strong></div>
      </div>

      <div class="stock-bar"><div class="stock-fill ${status.className}" style="width:${percentage}%"></div></div>

      <div class="stock-percent"><span>현재 재고 비율</span><span>${percentage}%</span></div>

      <div class="station-actions">
        <button data-action="rent" data-id="${station.id}">대여 처리</button>
        <button class="return-btn" data-action="return" data-id="${station.id}">반납 처리</button>
        <button class="map-btn" data-action="locate" data-id="${station.id}" aria-label="지도에서 보기">⌖</button>
      </div>
    </article>
  `;
}

function renderStations() {
  const searchInput = $("searchInput");
  const statusFilter = $("statusFilter");
  const typeFilter = $("typeFilter");
  if (!searchInput || !$("stationList")) return;

  const search = searchInput.value.trim().toLowerCase();
  const filter = statusFilter ? statusFilter.value : "all";
  const type = typeFilter ? typeFilter.value : "all";

  const list = state.stations.filter(s => {
    if (type !== "all" && s.type !== type) return false;
    const matchesSearch = s.name.toLowerCase().includes(search) || s.location.toLowerCase().includes(search);
    const matchesFilter = filter === "all" || getStatus(s).className === filter;
    return matchesSearch && matchesFilter;
  });

  if ($("stationCount")) $("stationCount").textContent = `${list.length}개 대여소`;
  $("stationList").innerHTML = list.length
    ? list.map(stationCardHTML).join("")
    : '<div class="empty-state">조건에 맞는 대여소가 없습니다. 검색어나 필터를 바꿔보세요.</div>';
}

function renderFavorites() {
  const list = state.stations.filter(s => state.favorites.includes(s.id));
  if ($("favoriteCount")) $("favoriteCount").textContent = `${list.length}곳`;
  if ($("favoriteList")) {
    $("favoriteList").innerHTML = list.length
      ? list.map(stationCardHTML).join("")
      : `<div class="empty-state">아직 즐겨찾기한 대여소가 없습니다.<br>홈의 대여소 카드에서 ☆를 눌러 추가하세요.<a href="#home" class="ghost-btn">대여소 목록으로 가기</a></div>`;
  }
}

function toggleFavorite(id) {
  const station = findStation(id);
  if (!station) return;

  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(f => f !== id);
    showToast(`${station.name}을(를) 즐겨찾기에서 뺐습니다.`);
  } else {
    state.favorites.push(id);
    showToast(`${station.name}을(를) 즐겨찾기에 추가했습니다.`);
  }

  saveState();
  renderStations();
  renderFavorites();
  renderMapList();
}

// ---------- 대여 / 반납 / QR 및 결제 ----------

let currentTargetStation = null;
let qrcodeInstance = null;

function addHistory(station, type) {
  state.history.unshift({
    id: Date.now(),
    stationId: station.id,
    stationName: station.name,
    type,
    time: new Date().toISOString()
  });
  state.history = state.history.slice(0, 500);
}

function rentUmbrella(id) {
  const station = findStation(id);
  if (!station) return;

  if (station.available <= 0) {
    showToast("이 대여소에는 남은 우산이 없습니다.");
    return;
  }

  currentTargetStation = station;
  if ($("qrStationName")) $("qrStationName").textContent = station.name;

  const qrContainer = $("qrcode");
  if (qrContainer) {
    qrContainer.innerHTML = "";
    const payUrl = `${window.location.origin}${window.location.pathname}#pay?stationId=${station.id}`;
    if (typeof QRCode !== "undefined") {
      qrcodeInstance = new QRCode(qrContainer, {
        text: payUrl,
        width: 180,
        height: 180,
        colorDark: "#0D2454",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }

  if ($("qrModal")) $("qrModal").hidden = false;
}

function closeQrModal() {
  if ($("qrModal")) $("qrModal").hidden = true;
}

function closePayModal() {
  if ($("payModal")) $("payModal").hidden = true;
}

function openPayModal(station) {
  closeQrModal();
  currentTargetStation = station;
  if ($("payStationName")) $("payStationName").textContent = station.name;
  if ($("payModal")) $("payModal").hidden = false;
}

function processPayment() {
  if (!currentTargetStation) return;

  const station = currentTargetStation;
  if (station.available <= 0) {
    showToast("그사이 우산 재고가 소진되었습니다.");
    closePayModal();
    return;
  }

  station.available--;
  addHistory(station, "rent");
  saveState();
  refreshAll();

  closePayModal();
  showToast(`[결제 완료] ${station.name}: 우산 대여가 시작되었습니다!`);
}

function returnUmbrella(id) {
  const station = findStation(id);
  if (!station) return;

  if (station.available >= station.total) {
    showToast("이 대여소는 이미 우산이 가득 차 있습니다.");
    return;
  }

  if (!confirm(`${station.name}\n우산 1개를 반납 처리하시겠습니까?`)) return;

  station.available++;
  addHistory(station, "return");
  saveState();
  refreshAll();
  showToast(`${station.name}: 반납 처리했습니다.`);
}

// ---------- 이용내역 ----------

function historyRowHTML(item) {
  return `
    <div class="table-row">
      <strong>${item.stationName}</strong>
      <span class="activity-type ${item.type}">${item.type === "rent" ? "대여" : "반납"}</span>
      <span>1개</span>
      <span>${formatDateTime(item.time)}</span>
    </div>
  `;
}

const EMPTY_ROW = `<div class="table-row"><span>기록이 없습니다.</span><span>-</span><span>-</span><span>-</span></div>`;

function renderRecent() {
  const recent = state.history.slice(0, 5);
  if ($("recentList")) $("recentList").innerHTML = recent.length ? recent.map(historyRowHTML).join("") : EMPTY_ROW;
}

function renderHistory() {
  const historySearch = $("historySearch");
  const historyType = $("historyType");
  const historyPeriod = $("historyPeriod");
  if (!historySearch || !$("historyList")) return;

  const search = historySearch.value.trim().toLowerCase();
  const type = historyType ? historyType.value : "all";
  const period = historyPeriod ? historyPeriod.value : "all";
  const weekAgo = Date.now() - 7 * 24 * 3600000;

  const list = state.history.filter(item => {
    if (!item.stationName.toLowerCase().includes(search)) return false;
    if (type !== "all" && item.type !== type) return false;
    if (period === "today" && !isToday(item.time)) return false;
    if (period === "week" && new Date(item.time).getTime() < weekAgo) return false;
    return true;
  });

  if ($("historyCount")) $("historyCount").textContent = `${list.length}건`;
  $("historyList").innerHTML = list.length ? list.map(historyRowHTML).join("") : EMPTY_ROW;
}

// ---------- 지도 (카카오맵) ----------

let map = null;
let mapLoading = false;
const overlays = {};
let infoOverlay = null;
let openInfoId = null;
let mapFilter = "all";

function kakaoAvailable() {
  return typeof kakao !== "undefined" && kakao.maps && typeof kakao.maps.load === "function";
}

function showMapError() {
  if ($("map")) {
    $("map").innerHTML = `
      <div class="map-error">
        <strong>카카오맵을 불러오지 못했습니다.</strong>
        <p>1. appkey 확인 및 로컬/웹서버 환경을 확인하세요.</p>
      </div>
    `;
  }
}

function initMap() {
  if (map) {
    map.relayout();
    consumePendingFocus();
    return;
  }
  if (!kakaoAvailable()) {
    showMapError();
    return;
  }
  if (mapLoading) return;
  mapLoading = true;

  kakao.maps.load(() => {
    try {
      createMap();
    } catch (e) {
      console.error(e);
      showMapError();
    }
  });
}

function createMap() {
  map = new kakao.maps.Map($("map"), {
    center: new kakao.maps.LatLng(37.545, 126.99),
    level: 8
  });
  map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

  const bounds = new kakao.maps.LatLngBounds();
  state.stations.forEach(s => {
    const position = new kakao.maps.LatLng(s.lat, s.lng);
    const pin = document.createElement("button");
    pin.type = "button";
    pin.title = s.name;
    pin.addEventListener("click", () => openInfo(s.id));

    overlays[s.id] = new kakao.maps.CustomOverlay({
      position, content: pin, xAnchor: 0.5, yAnchor: 0.5, clickable: true
    });
    bounds.extend(position);
  });

  infoOverlay = new kakao.maps.CustomOverlay({ xAnchor: 0.5, yAnchor: 1, clickable: true, zIndex: 10 });
  kakao.maps.event.addListener(map, "click", closeInfo);

  map.setBounds(bounds);
  updateMapMarkers();
  consumePendingFocus();
}

function updateMapMarkers() {
  if (!map) return;
  state.stations.forEach(s => {
    const overlay = overlays[s.id];
    if (!overlay) return;
    const pin = overlay.getContent();
    pin.className = `pin ${s.type} ${getStatus(s).className}`;
    pin.textContent = s.machines;

    const visible = mapFilter === "all" || s.type === mapFilter;
    overlay.setMap(visible ? map : null);
  });
  if (openInfoId !== null) openInfo(openInfoId);
}

function popupHTML(s) {
  const status = getStatus(s);
  return `
    <span class="type-tag ${s.type}">${TYPE_LABEL[s.type]}</span>
    <strong>${s.name}</strong>
    <small>${s.location}</small>
    <div class="popup-grid">
      <span>설치 대여기</span><b>${s.machines}대</b>
      <span>대여 가능</span><b>${s.available} / ${s.total}개</b>
      <span>상태</span><b class="status-text ${status.className}">${status.text}</b>
    </div>
  `;
}

function openInfo(id) {
  const s = findStation(id);
  if (!map || !s) return;

  const box = document.createElement("div");
  box.className = "map-popup";
  box.innerHTML = `<button type="button" class="popup-close" aria-label="닫기">×</button>${popupHTML(s)}`;
  box.querySelector(".popup-close").addEventListener("click", closeInfo);

  infoOverlay.setContent(box);
  infoOverlay.setPosition(new kakao.maps.LatLng(s.lat, s.lng));
  infoOverlay.setMap(map);
  openInfoId = id;
}

function closeInfo() {
  if (infoOverlay) infoOverlay.setMap(null);
  openInfoId = null;
}

function renderMapSummary() {
  ["subway", "school"].forEach(type => {
    const list = state.stations.filter(s => s.type === type);
    const machines = list.reduce((sum, s) => sum + s.machines, 0);
    const key = type === "subway" ? "Subway" : "School";
    if ($(`sum${key}`)) $(`sum${key}`).textContent = `${list.length}곳`;
    if ($(`sum${key}Machines`)) $(`sum${key}Machines`).textContent = `대여기 ${machines}대`;
  });
}

function renderMapList() {
  renderMapSummary();
  const list = state.stations.filter(s => mapFilter === "all" || s.type === mapFilter);
  if ($("mapList")) {
    $("mapList").innerHTML = list.map(s => {
      const status = getStatus(s);
      const isFav = state.favorites.includes(s.id);
      return `
        <button class="map-item" data-action="locate" data-id="${s.id}">
          <i class="pin-sample ${s.type} ${status.className}"></i>
          <span class="map-item-text">
            <strong>${isFav ? "★ " : ""}${s.name}</strong>
            <small>대여기 ${s.machines}대 · ${s.location.split(" · ")[1]}</small>
          </span>
          <span class="map-item-count">${s.available}<small>/${s.total}</small></span>
        </button>
      `;
    }).join("");
  }
}

const mapTabsEl = $("mapTabs");
if (mapTabsEl) {
  mapTabsEl.addEventListener("click", event => {
    const tab = event.target.closest(".tab");
    if (!tab) return;
    mapFilter = tab.dataset.filter;
    document.querySelectorAll("#mapTabs .tab").forEach(t => t.classList.toggle("active", t === tab));
    const open = openInfoId !== null ? findStation(openInfoId) : null;
    if (open && mapFilter !== "all" && open.type !== mapFilter) closeInfo();
    renderMapList();
    updateMapMarkers();
  });
}

function focusOnMap(id) {
  const station = findStation(id);
  if (!map || !station) return;
  if (mapFilter !== "all" && station.type !== mapFilter) {
    const allTab = document.querySelector('#mapTabs [data-filter="all"]');
    if (allTab) allTab.click();
  }
  map.setLevel(4);
  map.panTo(new kakao.maps.LatLng(station.lat, station.lng));
  openInfo(id);
}

function consumePendingFocus() {
  if (pendingFocusId === null) return;
  const id = pendingFocusId;
  pendingFocusId = null;
  setTimeout(() => focusOnMap(id), 50);
}

function locateStation(id) {
  if (location.hash === "#map" && map) {
    focusOnMap(id);
  } else {
    pendingFocusId = id;
    if (location.hash === "#map") initMap();
    else location.hash = "map";
  }
}

// ---------- 공지사항 및 고객센터 ----------

function renderNotices() {
  const list = [...state.notices].sort((a, b) => (b.pinned - a.pinned) || (new Date(b.date) - new Date(a.date)));
  if ($("noticeCount")) $("noticeCount").textContent = `${list.length}건`;
  if ($("noticeList")) {
    $("noticeList").innerHTML = list.length
      ? list.map(n => `
          <details class="item ${n.pinned ? "pinned" : ""}">
            <summary>
              ${n.pinned ? '<span class="tag">고정</span>' : ""}
              <span class="item-title">${escapeHTML(n.title)}</span>
              <span class="item-date">${formatDate(n.date)}</span>
            </summary>
            <div class="item-body">
              <p>${escapeHTML(n.content).replace(/\n/g, "<br>")}</p>
              <div class="item-actions">
                <button class="ghost-btn" data-action="pin-notice" data-id="${n.id}">${n.pinned ? "고정 해제" : "상단 고정"}</button>
                <button class="ghost-btn danger" data-action="delete-notice" data-id="${n.id}">삭제</button>
              </div>
            </div>
          </details>
        `).join("")
      : '<div class="empty-state">등록된 공지가 없습니다.</div>';
  }
}

const noticeForm = $("noticeForm");
if (noticeForm) {
  noticeForm.addEventListener("submit", event => {
    event.preventDefault();
    const title = $("noticeTitle").value.trim();
    const content = $("noticeContent").value.trim();
    if (!title || !content) return;

    state.notices.push({
      id: Date.now(),
      title,
      content,
      pinned: $("noticePinned").checked,
      date: new Date().toISOString()
    });
    saveState();
    noticeForm.reset();
    renderNotices();
    showToast("공지를 등록했습니다.");
  });
}

let supportFilter = "all";

function renderInquiries() {
  const list = state.inquiries.filter(q =>
    supportFilter === "all" ||
    (supportFilter === "pending" && !q.answer) ||
    (supportFilter === "done" && q.answer)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  if ($("inquiryList")) {
    $("inquiryList").innerHTML = list.length
      ? list.map(q => `
          <details class="item">
            <summary>
              <span class="tag ${q.answer ? "done" : "pending"}">${q.answer ? "답변 완료" : "답변 대기"}</span>
              <span class="item-title">${escapeHTML(q.title)}</span>
              <span class="item-date">${escapeHTML(q.user)} · ${formatDate(q.date)}</span>
            </summary>
            <div class="item-body">
              <p>${escapeHTML(q.content)}</p>
              ${q.answer
                ? `<div class="answer"><strong>관리자 답변</strong><p>${escapeHTML(q.answer).replace(/\n/g, "<br>")}</p></div>`
                : `<textarea id="answer-${q.id}" rows="3" placeholder="답변을 입력하세요."></textarea>
                   <div class="item-actions"><button class="solid-btn" data-action="answer" data-id="${q.id}">답변 등록</button></div>`
              }
            </div>
          </details>
        `).join("")
      : '<div class="empty-state">이 조건에 해당하는 문의가 없습니다.</div>';
  }
  updateSupportBadge();
}

function updateSupportBadge() {
  const pending = state.inquiries.filter(q => !q.answer).length;
  const badge = $("supportBadge");
  if (badge) {
    badge.textContent = pending;
    badge.hidden = pending === 0;
  }
}

function answerInquiry(id) {
  const input = $(`answer-${id}`);
  const text = input ? input.value.trim() : "";
  if (!text) {
    showToast("답변 내용을 입력하세요.");
    input && input.focus();
    return;
  }
  const inquiry = state.inquiries.find(q => q.id === id);
  if (inquiry) {
    inquiry.answer = text;
    saveState();
    renderInquiries();
    renderProfileSummary();
    showToast("답변을 등록했습니다.");
  }
}

const supportTabs = $("supportTabs");
if (supportTabs) {
  supportTabs.addEventListener("click", event => {
    const tab = event.target.closest(".tab");
    if (!tab) return;
    supportFilter = tab.dataset.filter;
    document.querySelectorAll("#supportTabs .tab").forEach(t => t.classList.toggle("active", t === tab));
    renderInquiries();
  });
}

// ---------- 내정보 ----------

function renderProfileSummary() {
  const p = state.profile;
  const initial = p.name.trim().charAt(0) || "관";

  if ($("topName")) $("topName").textContent = p.name;
  if ($("topAvatar")) $("topAvatar").textContent = initial;
  if ($("profileName")) $("profileName").textContent = p.name;
  if ($("profileAvatar")) $("profileAvatar").textContent = initial;
  if ($("profileArea")) $("profileArea").textContent = p.area || "-";
  if ($("profileToday")) $("profileToday").textContent = `${state.history.filter(h => isToday(h.time)).length}건`;
  if ($("profilePending")) $("profilePending").textContent = `${state.inquiries.filter(q => !q.answer).length}건`;
}

function fillProfileForm() {
  const p = state.profile;
  if ($("pfName")) $("pfName").value = p.name;
  if ($("pfEmail")) $("pfEmail").value = p.email;
  if ($("pfPhone")) $("pfPhone").value = p.phone;
  if ($("pfArea")) $("pfArea").value = p.area;
  if ($("pfAlertLow")) $("pfAlertLow").checked = p.alertLow;
  if ($("pfAlertInquiry")) $("pfAlertInquiry").checked = p.alertInquiry;
}

const profileForm = $("profileForm");
if (profileForm) {
  profileForm.addEventListener("submit", event => {
    event.preventDefault();
    state.profile = {
      name: $("pfName").value.trim() || "관리자",
      email: $("pfEmail").value.trim(),
      phone: $("pfPhone").value.trim(),
      area: $("pfArea").value.trim(),
      alertLow: $("pfAlertLow").checked,
      alertInquiry: $("pfAlertInquiry").checked
    };
    saveState();
    renderProfileSummary();
    showToast("계정 정보를 저장했습니다.");
  });
}

function resetData() {
  if (!confirm("모든 변경 내용을 지우고 예시 데이터로 되돌릴까요?")) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  state = createDefaultState();
  refreshAll();
  fillProfileForm();
  showToast("예시 데이터로 초기화했습니다.");
}

// ---------- 이벤트 위 délégation ----------

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);

  switch (button.dataset.action) {
    case "rent":   rentUmbrella(id); break;
    case "return": returnUmbrella(id); break;
    case "fav":    toggleFavorite(id); break;
    case "locate": locateStation(id); break;
    case "answer": answerInquiry(id); break;

    case "pin-notice": {
      const notice = state.notices.find(n => n.id === id);
      if (notice) {
        notice.pinned = !notice.pinned;
        saveState();
        renderNotices();
      }
      break;
    }

    case "delete-notice":
      if (!confirm("이 공지를 삭제할까요?")) return;
      state.notices = state.notices.filter(n => n.id !== id);
      saveState();
      renderNotices();
      showToast("공지를 삭제했습니다.");
      break;

    case "reset-data": resetData(); break;
  }
});

// ---------- 모달 및 QR 관련 이벤트 리스너 ----------

if ($("closeQrModal")) $("closeQrModal").addEventListener("click", closeQrModal);
if ($("closePayModal")) $("closePayModal").addEventListener("click", closePayModal);
if ($("cancelPayBtn")) $("cancelPayBtn").addEventListener("click", closePayModal);

if ($("simScanBtn")) {
  $("simScanBtn").addEventListener("click", () => {
    if (currentTargetStation) openPayModal(currentTargetStation);
  });
}

if ($("completePayBtn")) {
  $("completePayBtn").addEventListener("click", processPayment);
}

function checkQrUrlHash() {
  const hash = window.location.hash;
  if (hash.startsWith("#pay?stationId=")) {
    const stationId = Number(hash.split("=")[1]);
    const station = findStation(stationId);
    if (station) {
      history.replaceState(null, "", window.location.pathname + "#home");
      showPage();
      openPayModal(station);
    }
  }
}

// ---------- 검색 및 필터 이벤트 ----------

if ($("searchInput")) $("searchInput").addEventListener("input", renderStations);
if ($("statusFilter")) $("statusFilter").addEventListener("change", renderStations);
if ($("typeFilter")) $("typeFilter").addEventListener("change", renderStations);
if ($("historySearch")) $("historySearch").addEventListener("input", renderHistory);
if ($("historyType")) $("historyType").addEventListener("change", renderHistory);
if ($("historyPeriod")) $("historyPeriod").addEventListener("change", renderHistory);

// ---------- 전체 새로고침 ----------

function refreshAll() {
  updateStats();
  renderStations();
  renderFavorites();
  renderRecent();
  renderHistory();
  renderMapList();
  updateMapMarkers();
  renderNotices();
  renderInquiries();
  renderProfileSummary();
}

// ---------- 앱 초기화 ----------

window.addEventListener("hashchange", () => {
  checkQrUrlHash();
  showPage();
});

refreshAll();
checkQrUrlHash();
showPage();
// ---------- 모달 닫기 및 버튼 이벤트 확실하게 연결 ----------

function closeQrModal() {
  const qrModal = document.getElementById("qrModal");
  if (qrModal) qrModal.hidden = true;
}

function closePayModal() {
  const payModal = document.getElementById("payModal");
  if (payModal) payModal.hidden = true;
}

// 닫기(×) 버튼과 취소 버튼에 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
  const closeQrBtn = document.getElementById("closeQrModal");
  const closePayBtn = document.getElementById("closePayModal");
  const cancelPayBtn = document.getElementById("cancelPayBtn");

  if (closeQrBtn) closeQrBtn.addEventListener("click", closeQrModal);
  if (closePayBtn) closePayBtn.addEventListener("click", closePayModal);
  if (cancelPayBtn) cancelPayBtn.addEventListener("click", closePayModal);

  // 모달 바깥 배경(어두운 부분)을 눌러도 닫히게 설정
  const qrModal = document.getElementById("qrModal");
  const payModal = document.getElementById("payModal");

  if (qrModal) {
    qrModal.addEventListener("click", (e) => {
      if (e.target === qrModal) closeQrModal();
    });
  }

  if (payModal) {
    payModal.addEventListener("click", (e) => {
      if (e.target === payModal) closePayModal();
    });
  }
});
