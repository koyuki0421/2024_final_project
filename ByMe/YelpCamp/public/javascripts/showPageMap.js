mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location 地圖的樣式
    center: campground.geometry.coordinates, // starting position [lng, lat]拿到經緯度
    zoom: 10 // starting zoom
});

// 新增地圖右上角可以放大縮小旋轉的圖標  // https://docs.mapbox.com/mapbox-gl-js/example/navigation/
map.addControl(new mapboxgl.NavigationControl());

// 創建一個包含圖片的 HTML 元素
const el = document.createElement('div');
el.className = 'marker';
el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/128/5373/5373971.png)';
el.style.width = '40px';  
el.style.height = '40px'; 
el.style.backgroundSize = '100%'; // 確保圖片完全填充



new mapboxgl.Marker(el) // 做一個地圖上的標記marker
    .setLngLat(campground.geometry.coordinates)
    .setPopup(        // 滑鼠點標記時跳出小視窗的功能
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)

// 監聽標記的點擊事件，zoom:15+顯示彈出視窗
el.addEventListener('click', () => {
    map.flyTo({
        center: campground.geometry.coordinates,
        zoom: 15
    });
    marker.togglePopup(); // 確保彈出視窗顯示
});