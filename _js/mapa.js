var obj; //JSON
var objComentarios; //JSON
var map; //variable que contiene el mapa de la API de OpenLayers3
var layerCalasCercanas; //capa calas cercanas
var layerUbicacionActual; //capa ubicacion actual
var layerAccuracyActual; //capa precision actual
var calasEscritas = []; //array de las 5 calas mas cercanas

function leerMapa() {
    var xmlhttp = new XMLHttpRequest();
    var url = "_json/datos.json";
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            obj = JSON.parse(xmlhttp.responseText);
            //peticion de GET al servidor de comentarios
            var xmlhttp2 = new XMLHttpRequest();
            xmlhttp2.open("GET", "https://calasdemallorca.pythonanywhere.com/leerComentarios", true);
            xmlhttp2.send();
            xmlhttp2.onreadystatechange = function () {
                if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
                    objComentarios = JSON.parse(xmlhttp2.responseText);
                    escribirMapa();
                }
            };
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function escribirMapa() {
    AOS.init({
        once: true,
        easing: "ease-in-out"
    });
    //GEO
    if (navigator.geolocation) {
        var myLat;
        var myLon;
        navigator.geolocation.getCurrentPosition(function (position) {
            myLat = position.coords.latitude;
            myLon = position.coords.longitude;
            accuracy = position.coords.accuracy;

            //MAPA-CALAS CERCANAS
            getDistanciaCalas(myLat, myLon, accuracy);
            navigator.geolocation.watchPosition(watchGeolocation); //actualizar cuando el usuario se mueve
        });
        //no se ha dado permiso de geo
        cargarMapa(obj, [], 0.0, 0.0); //siempre cargamos el mapa (sin calas cercanas ni ubicacion actual)
        escribirCalasCercanas(false, [[0]]);
    }
    else { //el navegador no soporta geo
        cargarMapa([], 0.0, 0.0); //siempre cargamos el mapa (sin calas cercanas ni ubicacion actual)
        escribirCalasCercanas(false, [[-1]]);
    }
}

//Funcion que se ejecuta cada vez que se modifica la ubicacion actual
function watchGeolocation(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    acc = position.coords.accuracy;
    getDistanciaCalas(lat, lon, accuracy);
}

//Funcion que devuelve las 5 calas mas cercanas a la ubicacion actual
function getCalasCercanas(distanciasSinOrdenar) {
    distancias = distanciasSinOrdenar.slice(); //duplicar array para tener uno ordenado y otro sin ordenar
    distancias.sort((a, b) => a - b); //ordenar por distancia (menor a mayor)
    distancias = distancias.slice(0, 5); //coger solo los 5 primeros elementos

    //$("#prueba").html($("#prueba").html() + " " + distanciasSinOrdenar.toString());
    //$("#prueba").html($("#prueba").html() + " / " + distancias.toString());

    var calasCercanas = [] //array que contiene el numero de las 5 calas mas cercanas
    for (i = 0; i < distancias.length; i++) {
        var n = distanciasSinOrdenar.indexOf(distancias[i]);
        if (!calasCercanas.includes(n)) {
            calasCercanas.push(n);
        }
    }
    return [calasCercanas, distancias];
}

//Funcion que escribe las 5 calas más cercanas o muestra una alerta si no hay geo
function escribirCalasCercanas(geo, calasDistancias) {
    var calas = calasDistancias[0];
    var dist = calasDistancias[1];
    if (!geo && calas[0] == 0) { //no se han dado permisos de geo
        if (document.getElementById("alerta-geo") == null) {
            var alerta = document.createElement("div");
            alerta.setAttribute("id", "alerta-geo");
            alerta.setAttribute("class", "alert alert-warning fade show fs-6 mx-auto mg-top-md");
            alerta.setAttribute("role", "alert");
            alerta.innerHTML = "Por favor, acepta los permisos de ubicación para poder ver las calas cercanas a tu ubicación actual.";
            document.getElementById("mapa-cercanas").appendChild(alerta);
        }
        return;
    }
    if (!geo && calas[0] == -1) {//el navegador no soporta geo
        if (document.getElementById("alerta-geo") == null) {
            var alerta = document.createElement("div");
            alerta.setAttribute("id", "alerta-geo");
            alerta.setAttribute("class", "alert alert-warning fade show fs-6 mx-auto mg-top-md");
            alerta.setAttribute("role", "alert");
            alerta.innerHTML = "Lo sentimos, tu navegador no soporta la geolocalización. Considera cambiar de dispositivo.";
            document.getElementById("mapa-cercanas").appendChild(alerta);
        }
        return;
    }

    //Comprobar que las calas ya escritas no son las mismas a escribir otra vez (evitamos la animacion)
    var iguales = true;
    for (i = 0; i < calasEscritas.length; i++) {
        if (calas[i] != calasEscritas[i]) {
            iguales = false;
            break;
        }
    }
    if (iguales && calasEscritas.length != 0) return;

    const container = document.getElementById("mapa-cercanas");
    //eliminar todas las tarjetas existentes (asi se repite la animacion)
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
    var infoCalas = []; //array que contiene toda la web semantica de las calas filtradas
    for (i = 0; i < calas.length; i++) {
        infoCalas[i] = generarJsonLDCala(obj[calas[i]], calas[i]); //Web semantica

        tarjeta = document.createElement("div");
        tarjeta.setAttribute("class", "card float-start favorites-size favorites-borde mg-bt-md");

        aos = document.createElement("div");
        aos.setAttribute("data-aos", "fade-up");
        aos.setAttribute("data-aos-delay", "0");
        aos.setAttribute("data-aos-duration", "800");

        fila = document.createElement("div");
        fila.setAttribute("class", "row");

        col_img = document.createElement("div");
        col_img.setAttribute("class", "col-sm-3 favorites-col-3");
        a = document.createElement("a");
        a.setAttribute("href", "cala.html?calas&" + calas[i]);
        img = document.createElement("img");
        img.setAttribute("class", "d-block w-100 favorites-img");
        img.setAttribute("src", obj[calas[i]]["imatges"][0]);
        img.setAttribute("alt", "...");
        a.appendChild(img);
        col_img.appendChild(a);

        col_txt = document.createElement("div");
        col_txt.setAttribute("class", "col-sm-9 favorites-col-9");
        block = document.createElement("div");
        block.setAttribute("class", "card-block");
        flex = document.createElement("div");
        flex.setAttribute("class", "d-flex justify-content-between");
        titulo = document.createElement("div");
        titulo.setAttribute("class", "card-title fs-4-card-title");
        titulo.innerHTML = obj[calas[i]]["nom"];
        estrellas = pintarEstrellas(objComentarios["calas"][calas[i]]["valoracionGlobal"]);
        flex.appendChild(titulo);
        flex.appendChild(estrellas);

        distancia = document.createElement("div");
        distancia.setAttribute("class", "mg-top-sm-neg mg-bt-xsm fs-5-card-text");
        distancia.innerHTML = "Distancia: a " + (Math.round(dist[i] * 100) / 100) + " km de ti";

        texto = document.createElement("div");
        texto.setAttribute("class", "fs-5-card-text");
        texto.innerHTML = obj[calas[i]]["descripcio"].substr(0, 170).replace("<br><br>", "") + " (...)";

        btn = document.createElement("a");
        btn.setAttribute("href", "cala.html?calas&" + calas[i]);
        btn.setAttribute("class", "btn btn-primary btn-sm float-right mg-top-xsm");
        btn.innerHTML = "Ver más";

        block.appendChild(flex);
        block.appendChild(distancia);
        block.appendChild(texto);
        block.appendChild(btn);
        col_txt.appendChild(block);
        fila.appendChild(col_img);
        fila.appendChild(col_txt);

        tarjeta.appendChild(fila);
        aos.appendChild(tarjeta);
        document.getElementById("mapa-cercanas").appendChild(aos);
    }
    calasEscritas = calas;
    cargarJsonLD(infoCalas); //cargar web semantica
}

//Funcion que dibuja las estrellas segun la valoracion de cada cala
function pintarEstrellas(n) {
    estrellas = document.createElement("div");
    estrellas.setAttribute("class", "estrellas mg-top-stars");

    stars = [];
    var j = 0;
    for (j; j < Math.round(n); j++) {
        stars[j] = document.createElement("span");
        stars[j].setAttribute("class", "mg-stars fs-5-card-star fa fa-star checked"); //tamaño estrellas en moviles en horizontal
    }
    for (j; j < 5; j++) {
        stars[j] = document.createElement("span");
        stars[j].setAttribute("class", "mg-stars fs-5-card-star fa fa-star");
    }
    for (y = 0; y < 5; y++) {
        estrellas.appendChild(stars[y]);
    }
    return estrellas;
}

//Funcion que actualiza el mapa con la ubicacion actual y calas cercanas
function actualizarMapa(cercanas, myLat, myLon, accuracy) {
    map.removeLayer(layerCalasCercanas);
    map.removeLayer(layerUbicacionActual);
    map.removeLayer(layerAccuracyActual);

    var iconFeaturesC = []; //array de marcadores de calas cercanas
    for (i = 0; i < obj.length; i++) {
        if (cercanas.includes(i)) {
            var f = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([obj[i]["geoposicionament1"]["long"], obj[i]["geoposicionament1"]["lat"]])),
                nombre: obj[i]["nom"],
                distancia: "<div class='mapa-popup-mun'>" + "Distancia: " + obj[i]["geoposicionament1"]["city"] + "</div>",
                imagen: "<img class='mapa-popup-img' src='" + obj[i]["imatges"][0] + "'>",
                boton: "<a href='cala.html?calas&" + i + "' class='btn btn-primary btn-sm float-right fs-8 mapa-popup-bt'>Ver más</a>"
            });
            iconFeaturesC.push(f);
        }
    }
    var iconFeaturesActual = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([myLon, myLat])),
        nombre: "-1" //asi sabemos que es la ubicacion actual y no mostramos popup
    });

    var vectorSourceC = new ol.source.Vector({
        features: iconFeaturesC
    });
    var vectorSourceActual = new ol.source.Vector({
        features: [iconFeaturesActual]
    });

    var iconStyleC = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 41],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            opacity: 0.9,
            src: 'imagenes/marcador_cercano.png'
        }))
    });
    var iconStyleActual = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 12.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            opacity: 0.9,
            src: 'imagenes/marcador_ubicacion_actual.png'
        }))
    });

    layerCalasCercanas = new ol.layer.Vector({
        source: vectorSourceC,
        style: iconStyleC
    });
    layerUbicacionActual = new ol.layer.Vector({
        source: vectorSourceActual,
        style: iconStyleActual
    });
    var centerLongitudeLatitude = ol.proj.fromLonLat([myLon, myLat]);
    layerAccuracyActual = new ol.layer.Vector({
        source: new ol.source.Vector({
            projection: 'EPSG:4326',
            features: [new ol.Feature({geometry: new ol.geom.Circle(centerLongitudeLatitude, accuracy), nombre: "-1"})]
        }),
        style: [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.08)'
                })
            })
        ]
    });


    map.addLayer(layerAccuracyActual);
    map.addLayer(layerCalasCercanas);
    map.addLayer(layerUbicacionActual);
}

//Funcion que carga el mapa con todas las calas (sin geoposicionamiento)
function cargarMapa() {
    var iconFeatures = [] //array con todas las calas
    for (i = 0; i < obj.length; i++) {
        var f = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([obj[i]["geoposicionament1"]["long"], obj[i]["geoposicionament1"]["lat"]])),
            nombre: obj[i]["nom"],
            municipio: "<div class='mapa-popup-mun'>" + "Municipio: " + obj[i]["geoposicionament1"]["city"] + "</div>",
            imagen: "<img class='mapa-popup-img' src='" + obj[i]["imatges"][0] + "'>",
            boton: "<a href='cala.html?calas&" + i + "' class='btn btn-primary btn-sm float-right fs-8 mapa-popup-bt'>Ver más</a>"
        });
        iconFeatures.push(f);
    }

    var vectorSource = new ol.source.Vector({
        features: iconFeatures
    });

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
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

    map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ(
                    {
                        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2FybG9zdmVueSIsImEiOiJja284dDNiYmMwbnhjMm9tcTM5bjFhdmh5In0.upIiNatXtRXfWz0FOn1g_g'
                    })
            }),
            vectorLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([2.905714, 39.630531]),
            zoom: 10
        }),
        controls: ol.control.defaults({ attribution: false }),
        target: 'mapa-mapa',
        pixelRatio: 1
    });
    map.on('pointermove', function (evt) {
        map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
    });

    var popup = new ol.Overlay.Popup();
    map.addOverlay(popup);

    //Muestra el popup al pulsar en un marcador
    map.on('singleclick', function (evt) {
        map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            if (feature.get("nombre") != "-1") {
                popup.show(evt.coordinate, "<div class='mapa-popup'><h4>" + feature.get("nombre") + "</h4>" +
                    feature.get("municipio") + feature.get("imagen") + feature.get("boton") + "</div>");
            }
        });
    });

    //Oculta el popup al pulsar en cualquier sitio del mapa que no sea un marcador
    map.on('click', function (evt) {
        popup.hide();
    });
}

//Funcion que cambia el zoom del mapa segun el ancho de la ventana
function cambiarZoomMapa() {
    var w = document.documentElement.clientWidth;
    var zActual = map.getView().getZoom(); //zoom actual
    if (zActual != 9 && zActual != 10) return; //el usuario tiene el zoom modificado

    if (w < 980) {
        map.getView().setZoom(9);
    }
    else {
        map.getView().setZoom(10);
    }
}
function resizeMapa() {
    window.addEventListener("resize", cambiarZoomMapa);
}

//Funcion que calcula la distancia entre dos puntos y actualiza el mapa (por carretera)
function getDistanciaCalas(lat1, lon1, acc) {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=" + lat1 + "," + lon1 + "&destinations=";
    for (l=0; l<obj.length; l++) {
        url += obj[l]["geoposicionament1"]["lat"] + "," + obj[l]["geoposicionament1"]["long"];
        if (l < (obj.length-1)) url += ";";
    }
    url += "&travelMode=driving&key=Aq4r7Sjg24ktC2N-8CfobSzEJNwXA_wD1aZXNKP6NIC12Iuj0b7ad3iYINUgpnSt";

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var myArr = JSON.parse(xmlhttp.responseText);
            calasDistancias = [];
            for (l=0; l < myArr["resourceSets"][0]["resources"][0]["results"].length; l++) {
                calasDistancias[l] = myArr["resourceSets"][0]["resources"][0]["results"][l]["travelDistance"];
            }
            calas = getCalasCercanas(calasDistancias); //obtener array con las 5 calas mas cercanas
            actualizarMapa(calas[0], lat1, lon1, acc); //actualizar el mapa
            escribirCalasCercanas(true, calas); //escribir las tarjetas de las 5 calas cercanas
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Funcion que devuelve la distancia entre dos puntos (linea recta)
function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


//WEB SEMANTICA
function generarJsonLDCala(cala, numero) {
    likes = cala["likes"]
    if (likes == 0) likes = 1;
    var url = "calasdemallorca.netlify.app/cala.html?calas&" + numero;
    let info = {
        "@context": "http://www.schema.org",
        "@type": "Beach",
        "name": cala["nom"],
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": cala["geoposicionament1"]["lat"],
            "longitude": cala["geoposicionament1"]["long"]
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "itemReviewed": "Thing",
            "ratingValue": cala["puntuacio"],
            "reviewCount": likes
        },
        "description": cala["descripcio"].substr(0, 170).replace("<br><br>", "") + " (...)",
        "photo": cala["imatges"][0],
        "url": url
    }
    return info;
}

function cargarJsonLD(info){
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(info);
    document.head.appendChild(script);
}
