mapboxgl.accessToken = 'pk.eyJ1IjoicnVudGVyeWEiLCJhIjoiY21hOWI3ZXd0MWMzaDJvc2lwMXlkeWxociJ9.xxxPliryWuE49_0tGLDS6g';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true
});

function successLocation(position) {
    loadDataAndSetupMap([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
  fetch('https://ip-api.io/json')
    .then(res => res.json())
    .then(data => {
      if (data && typeof data.longitude === 'number' && typeof data.latitude === 'number') {
        loadDataAndSetupMap([data.longitude, data.latitude]);
      } else {
        loadDataAndSetupMap([32.854038, 39.920863]);
      }
    })
    .catch(() => {
        loadDataAndSetupMap([32.854038, 39.920863]);
    });
}

function loadDataAndSetupMap(center) {
  fetch('/data.json')
    .then(res => res.json())
    .then(cafes => setupMap(center, cafes));
}

function setupMap(center, cafes) {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: center,
    zoom: 14
  });

  map.on('style.load', () => {
    const layers = map.getStyle().layers;
    layers.forEach(layer => {
      if (
        layer.id.startsWith('poi-') ||
        layer.id.includes('poi') ||
        layer.id.includes('place')
      ) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    });
  });

  new mapboxgl.Marker({ color: 'blue' })
    .setLngLat(center)
    .setPopup(new mapboxgl.Popup().setHTML('<h4>You</h4>'))
    .addTo(map);

  cafes.forEach((cafe, idx) => {
    if (
      typeof cafe.lat === 'number' && !isNaN(cafe.lat) &&
      typeof cafe.lng === 'number' && !isNaN(cafe.lng)
    ) {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';

      const markerIcon = document.createElement('div');
      markerIcon.style.width = '32px';
      markerIcon.style.height = '32px';
      markerIcon.style.display = 'flex';
      markerIcon.style.alignItems = 'center';
      markerIcon.style.justifyContent = 'center';
      markerIcon.style.fontSize = '28px';

      if (cafe.type === 'cafe') {
        markerIcon.textContent = '☕';
      } else if (cafe.type === 'grocery') {
        markerIcon.textContent = '🛒';
      } else {
        markerIcon.textContent = '📍';
      }
      el.appendChild(markerIcon);

      const label = document.createElement('div');
      label.textContent = cafe.name;
      label.style.background = 'rgba(255,255,255,0.9)';
      label.style.padding = '2px 8px';
      label.style.borderRadius = '2px';
      label.style.fontSize = '13px';
      label.style.marginTop = '4px';
      label.style.whiteSpace = 'nowrap';
      el.appendChild(label);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([cafe.lng, cafe.lat])
        .addTo(map);

      marker.getElement().addEventListener('click', () => {
        const googleUrl = cafe.googledata
          ? `https://www.google.com/maps/@${cafe.lat},${cafe.lng}/${cafe.googledata}`
          : `https://www.google.com/maps/search/?api=1&query=${cafe.name} ${cafe.lat},${cafe.lng}`;
        document.getElementById('burgerContent').innerHTML = `
          <h2>${cafe.name}</h2>
          <p><strong>WiFi Şifresi:</strong> ${cafe.wifi}</p>
          <p><strong>WC Şifresi:</strong> ${cafe.wc}</p>
          <p><strong>Comments:</strong> ${cafe.comments || 'No comments yet.'}</p>
          ${cafe.menu ? `<p><a href="${cafe.menu}" target="_blank" style="color:#0074d9;">📋 Menüye Git</a></p>` : ''}
          <button onclick="window.open('${googleUrl}', '_blank')">Google Maps'te Aç</button>
        `;
        document.getElementById('burgerbar').style.display = 'block';
      });
    }
  });

  document.getElementById('closeBurger').onclick = function() {
    document.getElementById('burgerbar').style.display = 'none';
  }
}
