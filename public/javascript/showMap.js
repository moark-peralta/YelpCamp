const initMap = (latitude, longitude, apiKey) => {
    const map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer(`https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=0702a258f7be4991ac42a58d786a3cc4`, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.thunderforest.com/">Thunderforest</a>',
        maxZoom: 18
    }).addTo(map);

    L.marker([latitude, longitude]).addTo(map);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      const { lat, lon, apiKey } = mapElement.dataset;
      initMap(lat, lon, apiKey);
    }
  });