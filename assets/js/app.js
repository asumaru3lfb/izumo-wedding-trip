/* 須内達也 結婚式 in 島根 - app.js
   データ読み込み、タブ制御、タイムライン⇄地図連動、モーダル表示 */
(function () {
  const TYPE_ICON = {
    depart: "🚗", move: "🚌", hotel: "🏨", sightseeing: "📸",
    ceremony: "💒", reception: "🥂", afterparty: "🍻",
    meal: "🍚", dismiss: "👋", arrival: "🏠",
  };
  const TYPE_LABEL = {
    depart: "出発", move: "移動", hotel: "ホテル", sightseeing: "観光",
    ceremony: "挙式", reception: "披露宴", afterparty: "二次会",
    meal: "食事", dismiss: "解散", arrival: "到着",
  };
  const TEAM_LABEL = { all: "全員", staying: "滞在班", direct_return: "直帰班" };
  const AVATAR_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#D9333F", "#C9A227", "#8E44AD"];

  const state = {
    days: [],
    spots: [],
    members: [],
    currentDayId: null,
    currentTeam: "all",
    activeEventId: null,
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  async function loadData() {
    const [itinerary, spots, members] = await Promise.all([
      fetch("data/itinerary.json").then((r) => r.json()),
      fetch("data/spots.json").then((r) => r.json()),
      fetch("data/members.json").then((r) => r.json()),
    ]);
    state.days = itinerary.days;
    state.spots = spots.spots;
    state.members = members.members;
    state.currentDayId = state.days[0].id;
  }

  /* ---------- members ---------- */
  function memberCard(m, i) {
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
    const badge = `<span class="badge badge-${m.team}">${TEAM_LABEL[m.team]}</span>`;
    const carBadge = m.car ? `<span class="badge badge-car">${m.car}</span>` : "";
    return `
    <div class="member-card team-${m.team}">
      <div class="member-avatar" style="background:${color}">${m.nickname.slice(0, 2)}</div>
      <p class="member-nickname">${m.nickname}</p>
      <p class="member-name">${m.name}</p>
      <p class="member-role">${m.role}</p>
      <div class="member-badges">${badge}${carBadge}</div>
    </div>`;
  }

  function renderMembers() {
    const wrap = $("#members-groups");
    const groups = [
      { team: "direct_return", label: "直帰班" },
      { team: "staying", label: "滞在班" },
    ];
    wrap.innerHTML = groups
      .map((g) => {
        const members = state.members.filter((m) => m.team === g.team);
        return `
        <div class="member-group team-${g.team}">
          <h3 class="member-group-title"><span class="dot-team"></span>${g.label}<span class="member-group-count">（${members.length}名）</span></h3>
          <div class="members-grid">
            ${members.map((m) => memberCard(m, state.members.indexOf(m))).join("")}
          </div>
        </div>`;
      })
      .join("");
  }

  /* ---------- open issues ---------- */
  function renderOpenIssues() {
    const issues = [
      "直帰班の9/13観光先（未定）",
      "滞在班の9/14午前観光先（未定）",
    ];
    $("#open-issues-list").innerHTML = issues.map((t) => `<li>${t}</li>`).join("");
  }

  /* ---------- tabs ---------- */
  function currentDay() {
    return state.days.find((d) => d.id === state.currentDayId);
  }

  function renderDayTabs() {
    const wrap = $("#day-tabs");
    wrap.innerHTML = state.days
      .map(
        (d) => `<button class="tab-btn${d.id === state.currentDayId ? " active" : ""}" data-day="${d.id}" role="tab">${d.shortLabel}</button>`
      )
      .join("");
    $$(".tab-btn", wrap).forEach((btn) => btn.addEventListener("click", () => selectDay(btn.dataset.day)));
  }

  function renderTeamTabs() {
    const day = currentDay();
    const wrap = $("#team-tabs");
    const teams = day.teams.filter((t) => t !== "all");
    if (teams.length === 0) {
      wrap.hidden = true;
      wrap.innerHTML = "";
      return;
    }
    wrap.hidden = false;
    if (!teams.includes(state.currentTeam)) state.currentTeam = teams[0];
    wrap.innerHTML = teams
      .map(
        (t) => `<button class="tab-btn${t === state.currentTeam ? " active" : ""}" data-team="${t}" role="tab">${TEAM_LABEL[t]}</button>`
      )
      .join("");
    $$(".tab-btn", wrap).forEach((btn) => btn.addEventListener("click", () => selectTeam(btn.dataset.team)));
  }

  function selectDay(dayId) {
    state.currentDayId = dayId;
    state.currentTeam = "all";
    state.activeEventId = null;
    renderDayTabs();
    renderTeamTabs();
    renderTimeline();
    renderMobileNav();
  }

  function selectTeam(team) {
    state.currentTeam = team;
    state.activeEventId = null;
    renderTeamTabs();
    renderTimeline();
  }

  /* ---------- timeline ---------- */
  function visibleEvents() {
    const day = currentDay();
    return day.events.filter((ev) => ev.team === "all" || ev.team === state.currentTeam || day.teams.length <= 1);
  }

  function renderTimeline() {
    const events = visibleEvents();
    const list = $("#timeline-list");
    list.innerHTML = events
      .map((ev) => {
        const tags = [];
        if (ev.tbd) tags.push('<span class="tag-tbd">未定</span>');
        if (ev.approx) tags.push('<span class="tag-approx">座標概算</span>');
        return `
        <li class="timeline-item" data-type="${ev.type}" data-id="${ev.id}">
          <div class="timeline-icon">${TYPE_ICON[ev.type] || "📍"}</div>
          <div class="timeline-body">
            <span class="timeline-time">${ev.time}</span>
            <p class="timeline-title">${ev.title}</p>
            ${ev.place ? `<p class="timeline-place">📍 ${ev.place}</p>` : ""}
            <div class="timeline-tags">${tags.join("")}</div>
          </div>
        </li>`;
      })
      .join("");

    $$(".timeline-item", list).forEach((li) => {
      li.addEventListener("click", () => {
        const ev = events.find((e) => e.id === li.dataset.id);
        setActiveEvent(ev.id, { openModal: true, fromMap: false });
      });
    });

    WeddingMap.setConfirmedEvents(events);
  }

  function setActiveEvent(eventId, { openModal, fromMap }) {
    state.activeEventId = eventId;
    $$(".timeline-item").forEach((li) => li.classList.toggle("active", li.dataset.id === eventId));
    const ev = visibleEvents().find((e) => e.id === eventId);
    if (!ev) return;

    if (ev.lat != null && ev.lng != null) {
      WeddingMap.highlight(eventId);
    }
    if (!fromMap) {
      const li = $(`.timeline-item[data-id="${eventId}"]`);
      if (li) li.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (openModal) openEventModal(ev);
  }

  /* ---------- modal ---------- */
  function openEventModal(ev) {
    const backdrop = $("#modal-backdrop");
    $("#modal-content").innerHTML = `
      <p class="modal-eyebrow">${TYPE_LABEL[ev.type] || ""}・${ev.time}</p>
      <h3 class="modal-title" id="modal-title">${ev.title}</h3>
      <div class="modal-figure">${TYPE_ICON[ev.type] || "📍"}</div>
      ${ev.place ? `<p class="modal-row">📍 ${ev.place}</p>` : ""}
      ${ev.tbd ? `<p class="modal-row">🚧 詳細未定：観光候補地レイヤーから選定予定</p>` : ""}
      ${ev.approx ? `<p class="modal-row">📐 座標は概算です（要Geocoding確認）</p>` : ""}
      ${ev.note ? `<p class="modal-note">${ev.note}</p>` : ""}
    `;
    backdrop.hidden = false;
  }

  function closeModal() {
    $("#modal-backdrop").hidden = true;
  }

  /* ---------- mobile bottom nav ---------- */
  function renderMobileNav() {
    const nav = $("#mobile-nav");
    nav.innerHTML = state.days
      .map((d) => `<button data-day="${d.id}" class="${d.id === state.currentDayId ? "active" : ""}">${d.shortLabel}</button>`)
      .join("");
    $$("[data-day]", nav).forEach((b) => b.addEventListener("click", () => { selectDay(b.dataset.day); window.scrollTo({ top: $("#itinerary").offsetTop - 60, behavior: "smooth" }); }));
  }

  /* ---------- events wiring ---------- */
  function wireStatic() {
    $("#modal-close").addEventListener("click", closeModal);
    $("#modal-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "modal-backdrop") closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
    $("#celebrate-btn").addEventListener("click", () => window.WeddingConfetti.celebrate());

    WeddingMap.onMarkerClick((eventId) => setActiveEvent(eventId, { openModal: false, fromMap: true }));
  }

  /* ---------- init ---------- */
  async function init() {
    WeddingMap.init();
    await loadData();
    WeddingMap.setCandidateSpots(state.spots);

    renderMembers();
    renderOpenIssues();
    renderDayTabs();
    renderTeamTabs();
    renderTimeline();
    renderMobileNav();
    wireStatic();

    // 初回の祝福演出
    setTimeout(() => window.WeddingConfetti && window.WeddingConfetti.celebrate(), 600);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
