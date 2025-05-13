let googleMap, googleMarker;
let osmMap, osmMarker;

function initGoogleMap(lat, lng) {
  const center = { lat, lng };
  googleMap = new google.maps.Map(document.getElementById('google-map'), {
    center,
    zoom: 15,
  });
  googleMarker = new google.maps.Marker({
    position: center,
    map: googleMap,
  });
}

function updateGoogleMarker(lat, lng) {
  const pos = { lat, lng };
  googleMarker.setPosition(pos);
  googleMap.panTo(pos);
}

function initOsmMap(lat, lng) {
  osmMap = L.map('osm-map').setView([lat, lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(osmMap);
  osmMarker = L.marker([lat, lng]).addTo(osmMap);
}

function updateOsmMarker(lat, lng) {
  osmMarker.setLatLng([lat, lng]);
  osmMap.panTo([lat, lng]);
}

function setMaps(lat, lng) {
  if (!googleMap) initGoogleMap(lat, lng);
  else updateGoogleMarker(lat, lng);
  
  if (!osmMap) initOsmMap(lat, lng);
  else updateOsmMarker(lat, lng);
}

navigator.geolocation.getCurrentPosition(
  (pos) => {
    setMaps(pos.coords.latitude, pos.coords.longitude);
    document.getElementById('latitude').value = pos.coords.latitude.toFixed(6);
    document.getElementById('longitude').value = pos.coords.longitude.toFixed(6);
  },
  () => {
    setMaps(-23.55052, -46.633308); // São Paulo como fallback
    document.getElementById('latitude').value = (-23.55052).toFixed(6);
    document.getElementById('longitude').value = (-46.633308).toFixed(6);
  }
);

document.getElementById('coords-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const lat = parseFloat(document.getElementById('latitude').value);
  const lng = parseFloat(document.getElementById('longitude').value);
  if (!isNaN(lat) && !isNaN(lng)) {
    setMaps(lat, lng);
  }
});
