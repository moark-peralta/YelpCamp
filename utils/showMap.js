const axios = require('axios');

async function getGeoCoordinates(address) {
    try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                q: address,
                key: process.env.OPENCAGE_API_KEY
            },
            headers: {
                'User-Agent': `YelpCamp/1.0 (${process.env.MY_EMAIL})`
            }
        });

        if (response.data.results.length > 0) {
            const location = response.data.results[0].geometry;
            return {
                lat: location.lat,
                lon: location.lng
            };
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error fetching geocoding data:', error);
        throw error;
    }
}

module.exports.getGeoCoordinates = getGeoCoordinates;