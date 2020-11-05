
const app = document.getElementById('root');

var request = new XMLHttpRequest();
request.open('GET', 'https://helsingborg.opendatasoft.com/api/records/1.0/search/?dataset=leder&q=&facet=lednamn', true);

request.onload = function() {
    let dataset = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
        // create div element to contain the trail list
        const mainDiv = document.createElement('div');
        const mapDiv = document.createElement('div');
        mainDiv.setAttribute('class', 'main_container');
        mapDiv.setAttribute('class', 
        );
        mapDiv.setAttribute('id', 'map_canvas');
        app.appendChild(mainDiv);
        app.appendChild(mapDiv);
        dataset.records.forEach(item => {
            // create button element for each trail
            const h3 = document.createElement('h3');
            h3.style.color = "blue";
            h3.textContent = "Leden Namn: ";
            mainDiv.appendChild(h3);

            // Create a <button> element with lednamn
            var btn = document.createElement("button");
            btn.innerHTML = item.fields.lednamn;

            // start - define event for button
            btn.addEventListener("click", () => {
                showMapLoc(item.fields.geo_point_2d[0], item.fields.geo_point_2d[1]);
                ctx = canvas.getContext("2d");
                drawShape(item.fields.geo_shape.coordinates);
                var minX,minY,maxX,maxY; 
                item.fields.geo_shape.coordinates.forEach((p,i) => {
                    if(i === 0){ // if first point 
                        minX = maxX = p[0];
                        minY = maxY = p[1]; 
                    }else{
                        minX = Math.min(p[0],minX);
                        minY = Math.min(p[1],minY);
                        maxX = Math.max(p[0],maxX);
                        maxY = Math.max(p[1],maxY);
                    }
                });

                // get the map width and heigth in its local coords
                const mapWidth = maxX-minX;
                const mapHeight = maxY-minY;
                const mapCenterX = (maxX + minX) /2;
                const mapCenterY = (maxY + minY) /2;
                console.log(ctx.canvas.width, ctx.canvas.height, mapWidth, mapHeight); 

                // to find the scale that will fit the canvas get the min scale to fit height or width
                const scale = Math.min(ctx.canvas.width / mapWidth,ctx.canvas.height / mapHeight);

                console.log(scale);
                // draw the map centered on the cavas
                ctx.beginPath();
                ctx.strokeStyle = 'blue';

                item.fields.geo_shape.coordinates.forEach(p => { 
                    ctx.lineTo(
                        (p[0] - mapCenterX) * scale + ctx.canvas.width /2 ,
                        (p[1] - mapCenterY) * scale + ctx.canvas.height / 2 
                    );
                });
                ctx.stroke();
            });
            // end - define event for button
            h3.appendChild(btn);        
        });
    }
    else{
        console.log('Fel');
    }
}

request.send();

let map;

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        (position) => {
            lat = position.coords.latitude;
            long = position.coords.longitude;
            showMapLoc(lat, long);
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function showMapLoc(lat, long) {
    var myOptions = {
        center: new google.maps.LatLng(lat, long),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}
function drawShape(shapeCoordinates) {
    const map = new google.maps.Map(document.getElementById("map_canvas"), {
      zoom: 5,
      center: { lat: 24.886, lng: -70.268 },
      mapTypeId: "terrain",
    });
    // Construct the polygon.
    const canvas = new google.maps.Polygon({
      paths: shapeCoordinates,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
    });
    canvas.setMap(map);
  }