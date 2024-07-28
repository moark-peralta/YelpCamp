const axios = require('axios');

// Function to get latitude and longitude from an address using Nominatim
const getGeoCoordinates = async (address) => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            }
        });
        const data = response.data[0];
        if (data) {
            return {
                lat: parseFloat(data.lat),
                lon: parseFloat(data.lon)
            };
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        throw error;
    }
};



module.exports = { getGeoCoordinates };