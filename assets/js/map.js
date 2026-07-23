/* Leaflet map controller: confirmed itinerary pins + always-on candidate spot layer */
(function () {
  const TYPE_ICON = {
    depart: "🚗", move: "🚌", hotel: "🏨", sightseeing: "📸",
    ceremony: "💒", reception: "🥂", afterparty: "🍻",
    meal: "🍚", dismiss: "👋", arrival: "🏠",
  };
  const CATEGORY_ICON = {
    museum: "🖼️", nature: "🌿", history: "⛩️", shrine: "⛩️",
    sightseeing: "📍", food: "🍤", hotel: "🏨",
  };

  let map = null;
  let confirmedLayer = null;
  let candidateLayer = null;
  const markerById = {};
  let onMarkerClick = null;

  function init() {
    map = L.map("map", { scrollWheelZoom: false }).setView([35.42, 133.0], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    confirmedLayer = L.layerGroup().addTo(map);
    candidateLayer = L.layerGroup().addTo(map);

    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());

    return map;
  }

  function confirmedIcon(type, highlighted) {
    return L.divIcon({
      className: "",
      html: `<div class="pin-confirmed${highlighted ? " highlight" : ""}"><span>${TYPE_ICON[type] || "📍"}</span></div>`,
      iconSize: highlighted ? [36, 36] : [30, 30],
      iconAnchor: highlighted ? [18, 36] : [15, 30],
    });
  }

  function candidateIcon(category) {
    return L.divIcon({
      className: "",
      html: `<div class="pin-candidate"><span>${CATEGORY_ICON[category] || "📍"}</span></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });
  }

  function setCandidateSpots(spots) {
    candidateLayer.clearLayers();
    spots.forEach((s) => {
      L.marker([s.lat, s.lng], { icon: candidateIcon(s.category), zIndexOffset: -100 })
        .bindPopup(`<strong>${s.name}</strong><br>${s.area}<br><span style="color:#8a7300">観光候補地・${s.note || ""}</span>`)
        .addTo(candidateLayer);
    });
  }

  function setConfirmedEvents(events) {
    confirmedLayer.clearLayers();
    Object.keys(markerById).forEach((k) => delete markerById[k]);

    const points = [];
    events.forEach((ev) => {
      if (ev.lat == null || ev.lng == null) return;
      const marker = L.marker([ev.lat, ev.lng], { icon: confirmedIcon(ev.type, false) })
        .bindPopup(`<strong>${ev.time}　${ev.title}</strong><br>${ev.place || ""}`)
        .addTo(confirmedLayer);
      marker.on("click", () => {
        if (onMarkerClick) onMarkerClick(ev.id);
      });
      markerById[ev.id] = { marker, event: ev };
      points.push([ev.lat, ev.lng]);
    });

    if (points.length) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
    }
  }

  function highlight(eventId) {
    Object.entries(markerById).forEach(([id, { marker, event }]) => {
      marker.setIcon(confirmedIcon(event.type, id === eventId));
    });
    const target = markerById[eventId];
    if (target) {
      map.flyTo(target.marker.getLatLng(), Math.max(map.getZoom(), 12), { duration: 0.6 });
      target.marker.openPopup();
    }
  }

  function invalidateSize() {
    if (map) map.invalidateSize();
  }

  window.WeddingMap = {
    init,
    setCandidateSpots,
    setConfirmedEvents,
    highlight,
    invalidateSize,
    onMarkerClick(fn) { onMarkerClick = fn; },
  };
})();
