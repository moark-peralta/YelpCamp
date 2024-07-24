const axios = require('axios');

async function getGeoCoordinates(location) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: location,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': `YelpCamp/1.0 (${process.env.MY_EMAIL})`,  // Replace with your app name and contact information
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
}

module.exports = getGeoCoordinates;
