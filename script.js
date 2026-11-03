// =====================================
// DRYLER (드라일러)
// 우산 공유 운영 관리자 페이지
// =====================================
// 데이터는 브라우저 localStorage에 저장됩니다.
// 실제 운영 시에는 서버 데이터베이스와 연결해야 합니다.

const STORAGE_KEY = "dryler-state-v2";

// 대여기 1대에 우산 10개 보관
const UMBRELLAS_PER_MACHINE = 10;

// ---------- 예시 데이터 ----------
// 설치 대수와 재고는 예시 값입니다.
// [이름, 구, 노선, 위도, 경도, 대여기 대수, 대여 가능 우산]

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

// [이름, 구, 위도, 경도, 대여기 대수, 대여 가능 우산]
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
      { id: 1, title: "11월 대여소 정기 점검 안내", content: "11월 10일(화) 02:00~05:00 동안 전체 대여소 시스템 점검이 진행됩니다. 점검 시간에는 대여와 반납이 일시 중단됩니다.", pinned: true, date: hoursAgo(48) },
      { id: 2, title: "대학교 대여기 추가 설치 안내", content: "2학기 이용량 증가에 따라 서강대학교와 이화여자대학교에 대여기를 1대씩 추가 설치할 예정입니다.", pinned: false, date: hoursAgo(96) },
      { id: 3, title: "장마철 반납 기한 안내", content: "우천 시 대여 후 48시간 이내 반납을 권장드립니다.", pinned: false, date: hoursAgo(240) }
    ],
    inquiries: [
      { id: 1, user: "김*연", title: "반납했는데 대여 중으로 표시돼요", content: "어제 저녁 시청역에 반납했는데 앱에서 아직 대여 중으로 나옵니다. 확인 부탁드립니다.", date: hoursAgo(2), answer: null },
      { id: 2, user: "박*호", title: "서울역 대여소에 우산이 없어요", content: "오늘 아침부터 서울역 대여소에 우산이 하나도 없습니다. 언제 채워지나요?", date: hoursAgo(5), answer: null },
      { id: 3, user: "이*진", title: "우산 손잡이가 파손되어 있었습니다", content: "강남역에서 빌린 우산 손잡이가 깨져 있었습니다.", date: hoursAgo(30), answer: "불편을 드려 죄송합니다. 해당 우산은 회수 후 교체 조치했습니다." },
      { id: 4, user: "최*우", title: "대여 가능 시간이 궁금합니다", content: "새벽에도 대여가 가능한가요?", date: hoursAgo(72), answer: "모든 대여소는 지하철 운행 시간 동안 이용하실 수 있습니다." }
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

// ---------- 저장 / 불러오기 ----------

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

// ---------- 공통 유틸 ----------

function $(id) {
  return document.getElementById(id);
}

// 사용자가 입력한 글자를 안전하게 화면에 표시
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
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function findStation(id) {
  return state.stations.find(s => s.id === id);
}

// ---------- 대여소 상태 ----------

function getStatus(station) {
  if (station.available === 0) return { text: "재고 없음", className: "empty" };
  if (station.available <= station.total * 0.2) return { text: "재고 부족", className: "low" };
  return { text: "정상 운영", className: "normal" };
}

// ---------- 페이지 이동 ----------

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

// 랜딩 페이지에 속한 주소(#)들: 비어 있거나 이 중 하나면 랜딩을 보여줌
const LANDING_SECTIONS = ["", "top", "service", "how", "eco", "contact"];

function showPage() {
  const hash = location.hash.slice(1);
  const onLanding = LANDING_SECTIONS.includes(hash);

  $("landing").hidden = !onLanding;
  document.querySelector(".app").hidden = onLanding;

  if (onLanding) {
    document.title = "DRYLER — 당신의 일상에 가장 가까운 우산";
    const target = hash && hash !== "top" ? document.getElementById(hash) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event("scroll")); // 비 → 맑음 효과 다시 계산
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

  $("pageTitle").textContent = PAGES[pageId].title;
  $("breadcrumb").textContent = `드라일러 / ${PAGES[pageId].crumb}`;
  document.title = `${PAGES[pageId].title} | 드라일러`;

  if (pageId === "map") initMap();

  if (pageId === "profile") fillProfileForm();

  window.scrollTo({ top: 0, behavior: "instant" });
}

// ---------- 홈: 통계 ----------

function updateStats() {
  const total = state.stations.reduce((sum, s) => sum + s.total, 0);
  const available = state.stations.reduce((sum, s) => sum + s.available, 0);
  const machines = state.stations.reduce((sum, s) => sum + s.machines, 0);
  const subways = state.stations.filter(s => s.type === "subway").length;

  $("totalStations").textContent = state.stations.length;
  $("stationBreakdown").textContent = `지하철역 ${subways} · 학교 ${state.stations.length - subways}`;
  $("totalMachines").textContent = `${machines}대`;
  $("totalUmbrellas").textContent = `전체 우산 ${total}개`;
  $("availableUmbrellas").textContent = available;
  $("rentedUmbrellas").textContent = total - available;

  $("todayDate").textContent = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long"
  });
}

// ---------- 대여소 카드 (홈 + 즐겨찾기 공용) ----------

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
  const search = $("searchInput").value.trim().toLowerCase();
  const filter = $("statusFilter").value;
  const type = $("typeFilter").value;

  const list = state.stations.filter(s => {
    if (type !== "all" && s.type !== type) return false;
    const matchesSearch =
      s.name.toLowerCase().includes(search) ||
      s.location.toLowerCase().includes(search);
    const matchesFilter = filter === "all" || getStatus(s).className === filter;
    return matchesSearch && matchesFilter;
  });

  $("stationCount").textContent = `${list.length}곳`;

  $("stationList").innerHTML = list.length
    ? list.map(stationCardHTML).join("")
    : '<div class="empty-state">조건에 맞는 대여소가 없습니다. 검색어나 필터를 바꿔보세요.</div>';
}

// ---------- 즐겨찾기 ----------

function renderFavorites() {
  const list = state.stations.filter(s => state.favorites.includes(s.id));

  $("favoriteCount").textContent = `${list.length}곳`;

  $("favoriteList").innerHTML = list.length
    ? list.map(stationCardHTML).join("")
    : `<div class="empty-state">
         아직 즐겨찾기한 대여소가 없습니다.<br>
         홈의 대여소 카드에서 ☆를 눌러 추가하세요.
         <a href="#home" class="ghost-btn">대여소 목록으로 가기</a>
       </div>`;
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

// ---------- 대여 / 반납 ----------

function addHistory(station, type) {
  state.history.unshift({
    id: Date.now(),
    stationId: station.id,
    stationName: station.name,
    type,
    time: new Date().toISOString()
  });

  // 기록은 최대 500건까지 보관
  state.history = state.history.slice(0, 500);
}

function rentUmbrella(id) {
  const station = findStation(id);
  if (!station) return;

  if (station.available <= 0) {
    showToast("이 대여소에는 남은 우산이 없습니다.");
    return;
  }

  if (!confirm(`${station.name}\n우산 1개를 대여 처리하시겠습니까?`)) return;

  station.available--;
  addHistory(station, "rent");
  saveState();
  refreshAll();
  showToast(`${station.name}: 대여 처리했습니다.`);
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

const EMPTY_ROW = `
  <div class="table-row">
    <span>기록이 없습니다.</span><span>-</span><span>-</span><span>-</span>
  </div>
`;

function renderRecent() {
  const recent = state.history.slice(0, 5);
  $("recentList").innerHTML = recent.length ? recent.map(historyRowHTML).join("") : EMPTY_ROW;
}

function renderHistory() {
  const search = $("historySearch").value.trim().toLowerCase();
  const type = $("historyType").value;
  const period = $("historyPeriod").value;
  const weekAgo = Date.now() - 7 * 24 * 3600000;

  const list = state.history.filter(item => {
    if (!item.stationName.toLowerCase().includes(search)) return false;
    if (type !== "all" && item.type !== type) return false;
    if (period === "today" && !isToday(item.time)) return false;
    if (period === "week" && new Date(item.time).getTime() < weekAgo) return false;
    return true;
  });

  $("historyCount").textContent = `${list.length}건`;
  $("historyList").innerHTML = list.length ? list.map(historyRowHTML).join("") : EMPTY_ROW;
}

// ---------- 지도 (카카오맵) ----------
// 실제 지도 위에 예시 데이터의 대여기 위치를 핀으로 표시합니다.

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
  $("map").innerHTML = `
    <div class="map-error">
      <strong>카카오맵을 불러오지 못했습니다.</strong>
      <p>
        1. index.html 아래쪽 appkey= 뒤에 JavaScript 키를 넣었는지<br>
        2. 카카오 디벨로퍼스 Web 플랫폼에 지금 주소(${location.origin})를 등록했는지<br>
        3. VS Code Live Server로 열었는지 확인하세요.
      </p>
    </div>
  `;
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
      position,
      content: pin,
      xAnchor: 0.5,
      yAnchor: 0.5,
      clickable: true
    });

    bounds.extend(position);
  });

  infoOverlay = new kakao.maps.CustomOverlay({
    xAnchor: 0.5,
    yAnchor: 1,
    clickable: true,
    zIndex: 10
  });

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

  // 열려 있는 정보창 내용도 최신 재고로 갱신
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
    $(`sum${key}`).textContent = `${list.length}곳`;
    $(`sum${key}Machines`).textContent = `대여기 ${machines}대`;
  });
}

function renderMapList() {
  renderMapSummary();

  const list = state.stations.filter(s => mapFilter === "all" || s.type === mapFilter);

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

$("mapTabs").addEventListener("click", event => {
  const tab = event.target.closest(".tab");
  if (!tab) return;

  mapFilter = tab.dataset.filter;
  document.querySelectorAll("#mapTabs .tab").forEach(t =>
    t.classList.toggle("active", t === tab)
  );

  const open = openInfoId !== null ? findStation(openInfoId) : null;
  if (open && mapFilter !== "all" && open.type !== mapFilter) closeInfo();

  renderMapList();
  updateMapMarkers();
});

function focusOnMap(id) {
  const station = findStation(id);
  if (!map || !station) return;

  // 숨겨진 종류의 장소를 고르면 필터를 전체로 되돌림
  if (mapFilter !== "all" && station.type !== mapFilter) {
    $("mapTabs").querySelector('[data-filter="all"]').click();
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

// ---------- 공지사항 ----------

function renderNotices() {
  const list = [...state.notices].sort((a, b) =>
    (b.pinned - a.pinned) || (new Date(b.date) - new Date(a.date))
  );

  $("noticeCount").textContent = `${list.length}건`;

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
              <button class="ghost-btn" data-action="pin-notice" data-id="${n.id}">
                ${n.pinned ? "고정 해제" : "상단 고정"}
              </button>
              <button class="ghost-btn danger" data-action="delete-notice" data-id="${n.id}">삭제</button>
            </div>
          </div>
        </details>
      `).join("")
    : '<div class="empty-state">등록된 공지가 없습니다. 왼쪽에서 첫 공지를 작성하세요.</div>';
}

$("noticeForm").addEventListener("submit", event => {
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
  event.target.reset();
  renderNotices();
  showToast("공지를 등록했습니다.");
});

// ---------- 고객센터 ----------

let supportFilter = "all";

function renderInquiries() {
  const list = state.inquiries
    .filter(q =>
      supportFilter === "all" ||
      (supportFilter === "pending" && !q.answer) ||
      (supportFilter === "done" && q.answer)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
                 <div class="item-actions">
                   <button class="solid-btn" data-action="answer" data-id="${q.id}">답변 등록</button>
                 </div>`
            }
          </div>
        </details>
      `).join("")
    : '<div class="empty-state">이 조건에 해당하는 문의가 없습니다.</div>';

  updateSupportBadge();
}

function updateSupportBadge() {
  const pending = state.inquiries.filter(q => !q.answer).length;
  const badge = $("supportBadge");
  badge.textContent = pending;
  badge.hidden = pending === 0;
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
  inquiry.answer = text;

  saveState();
  renderInquiries();
  renderProfileSummary();
  showToast("답변을 등록했습니다.");
}

$("supportTabs").addEventListener("click", event => {
  const tab = event.target.closest(".tab");
  if (!tab) return;

  supportFilter = tab.dataset.filter;
  document.querySelectorAll("#supportTabs .tab").forEach(t =>
    t.classList.toggle("active", t === tab)
  );
  renderInquiries();
});

// ---------- 내정보 ----------

function renderProfileSummary() {
  const p = state.profile;
  const initial = p.name.trim().charAt(0) || "관";

  $("topName").textContent = p.name;
  $("topAvatar").textContent = initial;
  $("profileName").textContent = p.name;
  $("profileAvatar").textContent = initial;
  $("profileArea").textContent = p.area || "-";
  $("profileToday").textContent = `${state.history.filter(h => isToday(h.time)).length}건`;
  $("profilePending").textContent = `${state.inquiries.filter(q => !q.answer).length}건`;
}

function fillProfileForm() {
  const p = state.profile;
  $("pfName").value = p.name;
  $("pfEmail").value = p.email;
  $("pfPhone").value = p.phone;
  $("pfArea").value = p.area;
  $("pfAlertLow").checked = p.alertLow;
  $("pfAlertInquiry").checked = p.alertInquiry;
}

$("profileForm").addEventListener("submit", event => {
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

function resetData() {
  if (!confirm("모든 변경 내용을 지우고 예시 데이터로 되돌릴까요?")) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* 무시 */ }

  state = createDefaultState();
  refreshAll();
  fillProfileForm();
  showToast("예시 데이터로 초기화했습니다.");
}

// ---------- 버튼 클릭 (한 곳에서 처리) ----------

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
      notice.pinned = !notice.pinned;
      saveState();
      renderNotices();
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

// ---------- 검색 / 필터 ----------

$("searchInput").addEventListener("input", renderStations);
$("statusFilter").addEventListener("change", renderStations);
$("typeFilter").addEventListener("change", renderStations);
$("historySearch").addEventListener("input", renderHistory);
$("historyType").addEventListener("change", renderHistory);
$("historyPeriod").addEventListener("change", renderHistory);

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

// ---------- 시작 ----------

window.addEventListener("hashchange", showPage);
refreshAll();
showPage();


// =====================================
// 랜딩 페이지: 빗방울 + 스크롤하면 비가 그치는 효과
// 빗줄기 양은 아래 RAIN_COUNT 숫자로 조절
// =====================================
(function () {
  // ----- 빗방울 생성 -----
  var RAIN_COUNT = 120;   // 빗줄기 양
  var SPLASH_COUNT = 22;  // 바닥 물방울 수
  var rain = document.querySelector('.dr-rain');
  var splashes = document.querySelector('.dr-splashes');
  var seed = 11;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  var html = '';
  for (var i = 0; i < RAIN_COUNT; i++) {
    html += '<i style="left:' + (rnd() * 100).toFixed(2) + '%;width:' + (rnd() < 0.3 ? 2 : 1) +
      'px;height:' + Math.round(50 + rnd() * 60) + 'px;opacity:' + (0.3 + rnd() * 0.5).toFixed(2) +
      ';animation-duration:' + (0.45 + rnd() * 0.5).toFixed(2) + 's;animation-delay:-' + (rnd() * 2).toFixed(2) + 's"></i>';
  }
  rain.innerHTML = html;
  html = '';
  for (var j = 0; j < SPLASH_COUNT; j++) {
    html += '<i style="left:' + (3 + rnd() * 94).toFixed(1) + '%;bottom:' + (rnd() * 70).toFixed(1) +
      '%;animation-delay:-' + (rnd() * 1.1).toFixed(2) + 's"></i>';
  }
  splashes.innerHTML = html;

  // ----- 스크롤에 따라 비 → 맑음 -----
  var hero = document.querySelector('.dr-hero');
  var stage = document.querySelector('.dr-stage');
  var el = {
    sun: document.querySelector('.dr-sun'),
    clouds: document.querySelector('.dr-clouds'),
    intro: document.querySelector('.dr-intro'),
    product: document.querySelector('.dr-product'),
    copy: document.querySelector('.dr-copy'),
    hint: document.querySelector('.dr-hint'),
    logoW: document.querySelector('.dr-logo .white'),
    logoN: document.querySelector('.dr-logo .navy'),
    links: document.querySelectorAll('.dr-links a')
  };
  function c(x) { return Math.min(1, Math.max(0, x)); }
  function mix(a, b, t) {
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  var ticking = false;
  function update() {
    ticking = false;
    var r = hero.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = total > 0 ? c(-r.top / total) : 0;

    var sky = c((p - 0.25) / 0.45);
    var q = c((p - 0.18) / 0.42);
    var ease = 1 - Math.pow(1 - q, 3);
    var txt = c((p - 0.55) / 0.25);
    var rainOp = 1 - c((p - 0.3) / 0.35);

    var bg = mix([24, 32, 47], [234, 243, 251], sky);
    hero.style.background = bg;
    stage.style.background = bg;
    el.sun.style.opacity = sky;
    el.clouds.style.opacity = 1 - c((p - 0.25) / 0.4);
    el.clouds.style.transform = 'translateY(' + (-p * 320) + 'px)';
    rain.style.opacity = rainOp;
    splashes.style.opacity = rainOp;
    el.intro.style.opacity = 1 - c((p - 0.1) / 0.18);
    el.intro.style.transform = 'translateY(' + (-p * 160) + 'px)';
    el.product.style.opacity = c(q * 1.6);
    el.product.style.transform = 'translateY(' + ((1 - ease) * 720) + 'px) scale(' + (0.9 + ease * 0.1) + ')';
    el.copy.style.opacity = txt;
    el.copy.style.transform = 'translateY(' + ((1 - txt) * 32) + 'px)';
    el.hint.style.opacity = 1 - c(p / 0.08);
    el.logoW.style.opacity = 1 - sky;
    el.logoN.style.opacity = sky;
    var navColor = mix([230, 238, 250], [13, 36, 84], sky);
    for (var k = 0; k < el.links.length; k++) el.links[k].style.color = navColor;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
