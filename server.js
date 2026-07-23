// server.js
// Minimal backend for store-visit-manager.html.
// - Serves the static HTML file
// - Provides GET /api/geocode?address=... which looks up lat/lng server-side,
//   so your geocoding provider's API key never reaches the browser.
//
// Setup:
//   1. npm install
//   2. copy .env.example to .env and fill in your API key
//   3. node server.js
//   4. open http://localhost:3000

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve store-visit-manager.html (and any other static files in this folder)
app.use(express.static(__dirname));

// Simple in-memory cache so repeat lookups (e.g. re-uploading the same file)
// don't burn extra API quota.
const cache = new Map();

app.get('/api/geocode', async (req, res) => {
  const address = (req.query.address || '').toString().trim();
  if (!address) {
    return res.status(400).json({ error: 'address query parameter is required' });
  }

  const cacheKey = address.toLowerCase();
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const result = await geocodeWithGoogle(address);
    if (!result) {
      return res.status(404).json({ error: 'not found' });
    }
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('geocode error:', err);
    res.status(500).json({ error: 'geocoding request failed' });
  }
});

// ---------------------------------------------------------------------------
// Provider: Google Geocoding API
// Docs: https://developers.google.com/maps/documentation/geocoding/overview
// Requires GOOGLE_MAPS_API_KEY in your .env file.
// ---------------------------------------------------------------------------
async function geocodeWithGoogle(address) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY is not set in .env');

  const url = 'https://maps.googleapis.com/maps/api/geocode/json'
    + '?address=' + encodeURIComponent(address)
    + '&key=' + key;

  const resp = await fetch(url);
  const data = await resp.json();

  if (data.status !== 'OK' || !data.results || !data.results[0]) {
    return null;
  }
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

/* ---------------------------------------------------------------------------
 * Alternative provider: Kakao Local API (good fit for Korean addresses)
 * Docs: https://developers.kakao.com/docs/latest/ko/local/dev-guide
 * Requires KAKAO_REST_API_KEY in your .env file.
 * To use this instead of Google, replace the geocodeWithGoogle(address) call
 * above with geocodeWithKakao(address).
 * ---------------------------------------------------------------------------
async function geocodeWithKakao(address) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) throw new Error('KAKAO_REST_API_KEY is not set in .env');

  const url = 'https://dapi.kakao.com/v2/local/search/address.json?query=' + encodeURIComponent(address);
  const resp = await fetch(url, { headers: { Authorization: 'KakaoAK ' + key } });
  const data = await resp.json();

  if (!data.documents || !data.documents[0]) return null;
  const doc = data.documents[0];
  return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
}
--------------------------------------------------------------------------- */

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
