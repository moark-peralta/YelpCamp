document.addEventListener('DOMContentLoaded', () => {
    const mapElement = document.getElementById('map');
    const lat = parseFloat(mapElement.dataset.lat);
    const lon = parseFloat(mapElement.dataset.lon);
    const location = mapElement.dataset.location;

    // Initialize the map
    const map = L.map('map').setView([lat, lon], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker with dynamic location information in the popup
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<strong>Campground Location</strong><br>${location}`)
        .openPopup();
});
