

// $(document).ready(function () {
//     $(".wrapper").css("margin-top", ($(window).height()) / 5);
//     //DATE AND TIME//
//     //Converted into days, months, hours, day-name, AM/PM
//     var dt = new Date()
//     var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     $('#day').html(days[dt.getDay()]);
//     var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
//     $('#date').html(months[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear());
//     $('#time').html((dt.getHours() > 12 ? (dt.getHours() - 12) : dt.getHours()).toString() + ":" + ((dt.getMinutes() < 10 ? '0' : '').toString() + dt.getMinutes().toString()) + (dt.getHours() < 12 ? ' AM' : ' PM').toString());

//     //CELSIUS TO FAHRENHEIT CONVERTER on Click
//     var temp = 0;
//     $('#fahrenheit').click(function () {
//         $(this).css("color", "white");
//         $('#celsius').css("color", "#b0bec5");
//         $('#temperature').html(Math.round(temp * 1.8 + 32));
//     });

//     $('#celsius').click(function () {
//         $(this).css("color", "white");
//         $('#fahrenheit').css("color", "#b0bec5");
//         $('#temperature').html(Math.round(temp));
//     });

//     //GEOLOCATION and WEATHER API//
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function (position) {
//             var myLatitude = parseFloat(Math.round(position.coords.latitude * 100) / 100).toFixed(2);
//             var myLongitude = parseFloat(Math.round(position.coords.longitude * 100) / 100).toFixed(2);
//             myLatitude = 39.840142;
//             myLongitude = 2.776063;
//             //var utcTime = Math.round(new Date().getTime()/1000.0);

//             // $('.geo').html(position.coords.latitude + " " + position.coords.longitude);
//             $.getJSON("http://api.openweathermap.org/data/2.5/onecall?lat=" + myLatitude + "&lon=" + myLongitude + "&exclude=minutely,hourly,alerts&lang=es&appid=d1546bfd8c828a6a1add9c7173a462ac", function (json) {
//                 $('#city').html(json.name + ", " + json.sys.country);
//                 $('#weather-status').html(json.weather[0].main + " / " + json.weather[0].description);

//                 //WEATHER CONDITIONS FOUND HERE: http://openweathermap.org/weather-conditions
//                 switch (json.weather[0].main) {
//                     case "Clouds":
//                         $('.weather-icon').attr("src", "https://myleschuahiock.files.wordpress.com/2016/02/cloudy.png");
//                         break;
//                     case "Clear":
//                         $('.weather-icon').attr("src", "https://myleschuahiock.files.wordpress.com/2016/02/sunny2.png");
//                         break;
//                     case "Thunderstorm":
//                         $('.weather-icon').attr("src", "https://myleschuahiock.files.wordpress.com/2016/02/thunderstorm.png");
//                         break;
//                     case "Drizzle":
//                         $('.weather-icon').attr("src", "https://myleschuahiock.files.wordpress.com/2016/02/drizzle.png");
//                         break;
//                     case "Rain":
//                         $('.weather-icon').attr("src", "https://myleschuahiock.files.wordpress.com/2016/02/rain.png");
//                         break;
//                     case "Snow":
//                         $('.weather-icon').attr("src", "https://myleschuahiock.files.wordpress.com/2016/02/snow.png");
//                         break;
//                     case "Extreme":
//                         $('.weather-icon').attr("src", "https://myleschuahiock.files.wordpress.com/2016/02/warning.png");
//                         break;
//                 }
//                 temp = (json.main.temp - 273);
//                 $('#temperature').html(Math.round(temp));
//                 $('.windspeed').html(json.wind.speed + " Km/h")
//                 $('.humidity').html(json.main.humidity + " %");
//                 $('.pressure').html(json.main.pressure + " hPa");
//                 var sunriseUTC = json.sys.sunrise * 1000;
//                 var sunsetUTC = json.sys.sunset * 1000;
//                 var sunriseDt = new Date(sunriseUTC);
//                 var sunsetDt = new Date(sunsetUTC);
//                 $('.sunrise-time').html((sunriseDt.getHours() > 12 ? (sunriseDt.getHours() - 12) : sunriseDt.getHours()).toString() + ":" + ((sunriseDt.getMinutes() < 10 ? '0' : '').toString() + sunriseDt.getMinutes().toString()) + (sunriseDt.getHours() < 12 ? ' AM' : ' PM').toString());
//                 $('.sunset-time').html((sunsetDt.getHours() > 12 ? (sunsetDt.getHours() - 12) : sunsetDt.getHours()).toString() + ":" + ((sunsetDt.getMinutes() < 10 ? '0' : '').toString() + sunsetDt.getMinutes().toString()) + (sunsetDt.getHours() < 12 ? ' AM' : ' PM').toString());
//                 // $('.sunrise-time').html(json.sys.sunrise);
//                 // $('.sunset-time').html(json.sys.sunset);
//             });

//         });
//     } else {
//         $("#city").html("Please turn on Geolocator on Browser.")
//     }
// });

function cargarMapa(nombre, lat, lon) {
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
        name: nombre,
    });

    var vectorSource = new ol.source.Vector({
        features: [iconFeature]
    });
      
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 41],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 0.9,
          src: 'imagenes/marcador.png'
        }))
    });


    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: iconStyle
    });

    var map = new ol.Map({
        layers: [
          new ol.layer.Tile({source: new ol.source.OSM()}),
          vectorLayer
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([lon, lat]),
          zoom: 9
        }),
        controls: ol.control.defaults({ attribution: false }),
        target: 'cala-mapa'
    });

    map.on('pointermove', function(evt) {
        map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
    });

    // var popup = new ol.Overlay.Popup();
    // map.addOverlay(popup);

    // map.on('singleclick', function(evt) {
    //     var name = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
    //         popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + feature.get('name') + '</p></div>');
    //         return feature.get('name');
    //     });
    // });

    // map.on('click', function(evt) {
    //     var prettyCoord = ol.coordinate.toStringHDMS(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
    //     popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
    // });
}