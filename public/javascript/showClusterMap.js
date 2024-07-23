document.addEventListener('DOMContentLoaded', () => {
    const campgrounds = JSON.parse(document.getElementById('map').dataset.campgrounds);

    // Initialize the map
    const map = L.map('map').setView([51.505, -0.09], 2);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize the marker cluster group
    const markers = L.markerClusterGroup();

    // Add markers to the cluster group
    campgrounds.forEach(campground => {
        const marker = L.marker([campground.geometry.coordinates[1], campground.geometry.coordinates[0]])
            .bindPopup(`
                <strong>${campground.title}</strong><br>
                ${campground.location}<br>
                <a href="/campgrounds/${campground._id}">View Details</a>
            `);
        markers.addLayer(marker);
    });

    // Add the cluster group to the map
    map.addLayer(markers);
});
