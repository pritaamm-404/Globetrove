mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  // center: coordinates,
  center: listing.geometry.coordinates,
  // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 9, // starting zoom
});

console.log(coordinates);
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.FullscreenControl());
map.addControl(new mapboxgl.NavigationControl());

// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 100 }).setHTML(
      "<p>Exact Location Provided after booking</p>"
    )
  )
  .addTo(map);
