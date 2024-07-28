const axios = require('axios');

async function getGeoCoordinates(address) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json'
      },
      headers: {
        'User-Agent': `YelpCamp/1.0 (${process.env.MY_EMAIL})`
      }
    });

    if (response.data.length > 0) {
      return {
        lat: response.data[0].lat,
        lon: response.data[0].lon
      };
    } else {
      throw new Error('No results found');
    }
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    throw error;
  }
}
