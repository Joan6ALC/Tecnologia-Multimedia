var objIndex; //JSON propio de index
var objComentarios;
var fotosRandom = []; //array de fotos aleatorias del carousel
var path; //path de las imagenes del carousel de dia o de noche

function leerIndex() {
    var xmlhttp = new XMLHttpRequest();
    var url = "_json/index.json";
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            objIndex = JSON.parse(xmlhttp.responseText);
            //escribirIndex(objIndex);
            var xmlhttp2 = new XMLHttpRequest();
            xmlhttp2.open("GET", "https://calasdemallorca.pythonanywhere.com/leerComentarios", true);
            xmlhttp2.send();
            xmlhttp2.onreadystatechange = function () {
                if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
                    objComentarios = JSON.parse(xmlhttp2.responseText);
                    escribirIndex(objIndex);
                    //escribirComentariosIndex(objComentarios["index"]);
                }
            };
        }
    };
}

//Funcion que rellena dinamicamente el index
function escribirIndex(obj) {
    ($.getJSON("https://api.openweathermap.org/data/2.5/onecall?lat=39.550598&lon=2.657367&exclude=minutely,hourly,alerts&lang=es&appid=d1546bfd8c828a6a1add9c7173a462ac", function (json) {
        var sr = new Date(json.current.sunrise * 1000);
        var sunrise = (sr.getHours()) + 1;
        var ss = new Date(json.current.sunset * 1000);
        var sunset = (ss.getHours()) + 1;
        var now = new Date().getHours();

        //elegir fotos nocturnas segun la hora
        path = "carousel-n"; //carousel noche
        if (now > sunrise && now < sunset) { //dia
            path = "carousel" //carousel dia
        }

        while (fotosRandom.length < 5) {
            var r = Math.floor(Math.random() * (obj["index"][path].length));
            if (fotosRandom.indexOf(r) == -1) fotosRandom.push(r);
        }
        for (i = 0; i < 5; i++) {
            $(`#carousel-foto-${i}`).attr("src", obj["index"][path][fotosRandom[i]]);
        }

        //Comentarios
        escribirComentariosIndex(objComentarios["index"]);
    }));

    $(".titulo-main").html(obj["index"]["titulo"]);
    $(".subtitulo-main").html(obj["index"]["subtitulo"]);


    //Video se carga despues del carousel
    var src = document.createElement("source");
    src.setAttribute("src", "videos/video-paraiso.mp4");
    src.setAttribute("type", "video/mp4");
    var src2 = document.createElement("source");
    src2.setAttribute("src", "videos/video-paraiso.webm");
    src2.setAttribute("type", "video/webm");
    document.getElementById("video").appendChild(src);
    document.getElementById("video").appendChild(src2);
}

//Funcion que rellena el carousel de comentarios de manera dinámica
function escribirComentariosIndex(objComentarios) {
    for (i = 0; i < 9; i++) {
        tarjeta = document.createElement("div");
        tarjeta.setAttribute("class", "carousel__item");
        comentario = document.createElement("div");
        comentario.setAttribute("class", "comment");

        div_img = document.createElement("div");
        div_img.setAttribute("class", "comment-avatar");
        img = document.createElement("img");
        img.setAttribute("src", "imagenes/avatar.png");
        img.setAttribute("alt", "Comentario")
        div_img.appendChild(img);

        caja = document.createElement("div");
        caja.setAttribute("class", "comment-box");

        nombre = document.createElement("div");
        nombre.setAttribute("class", "comment-name my-auto");
        nombre.innerHTML = objComentarios[i]["nombre"] + " en <a class='link-comment' href='cala.html?" +
            objComentarios[i]["idCala"] + "'>" + objComentarios[i]["nombreCala"] + "</a>";
        texto = document.createElement("div");
        texto.setAttribute("class", "comment-text text-start");
        texto.innerHTML = objComentarios[i]["texto"];
        footer = document.createElement("div");
        footer.setAttribute("class", "comment-footer");

        flex = document.createElement("div");
        flex.setAttribute("class", "d-flex justify-content-between");
        fecha = document.createElement("div");
        fecha.setAttribute("class", "comment-date");
        date = new Date(objComentarios[i]["fecha"]);
        fecha.innerHTML = date.getDate() + " de " + getMes(date.getMonth()) + " de " + date.getFullYear();
        estrellas = pintarEstrellas(objComentarios[i]["valoracion"]);

        flex.appendChild(fecha);
        flex.appendChild(estrellas);
        footer.appendChild(flex);

        caja.appendChild(nombre);
        caja.appendChild(texto);
        caja.appendChild(footer);
        comentario.appendChild(div_img);
        comentario.appendChild(caja);
        tarjeta.appendChild(comentario);
        document.getElementById("index-contenedor").appendChild(tarjeta);
    }

    //Web Semantica
    var info = generarJsonLDIndex();
    cargarJsonLD(info);
}

//Funcion que dibuja las estrellas segun la valoracion de cada cala
function pintarEstrellas(n) {
    estrellas = document.createElement("div");
    estrellas.setAttribute("class", "comment-stars my-auto");

    stars = [];
    var j = 0;
    for (j; j < Math.round(n); j++) {
        stars[j] = document.createElement("span");
        stars[j].setAttribute("class", "mg-stars fa fa-star checked"); //tamaño estrellas en moviles en horizontal
    }
    for (j; j < 5; j++) {
        stars[j] = document.createElement("span");
        stars[j].setAttribute("class", "mg-stars fa fa-star");
    }
    for (y = 0; y < 5; y++) {
        estrellas.appendChild(stars[y]);
    }
    return estrellas;
}

//Funcion que devuelve el mes actual segun el numero
function getMes(n) {
    switch (n) {
        case 0: return "Enero";
        case 1: return "Febrero";
        case 2: return "Marzo";
        case 3: return "Abril";
        case 4: return "Mayo";
        case 5: return "Junio";
        case 6: return "Julio";
        case 7: return "Agosto";
        case 8: return "Septiembre";
        case 9: return "Octubre";
        case 10: return "Noviembre";
        case 11: return "Diciembre";
    }
}

//Funcion que reproduce el audio al entrar en la página
function playAudio() {
    audio = document.getElementById("index-audio");
    audio.muted = false;
    audio.play();
    audio.volume = 0.35;
}


//WEB SEMANTICA
function generarJsonLDIndex() {
    let info = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "applicationCategory": "Calas de Mallorca",
        "applicationSubCategory": "Playas, Calas",
        "about": "Una webapp para descubrir los rincones más bonitos de la costa mallorquina",
        "name": "Calas de Mallorca",
        "description": "Una pequeña recopilación de las mejores Calas de Mallorca hecha por un grupo de estudiantes de Ingeniería Informática en la Universitat de les Illes Balears. El formato de presentación es una webapp que usa HTML, CSS y JavaScript.",
        "author": [
            {
                "@type": "Person",
                "givenName": "Carlos",
                "familyName": "Veny",
                "gender": "Male",
                "image": "imagenes/nosotros_carlos.jpg",
                "url": "https://www.instagram.com/carlos_veny/"
            },
            {
                "@type": "Person",
                "givenName": "Juanjo",
                "familyName": "Nieto",
                "gender": "Male",
                "image": "imagenes/nosotros_juanjo.jpg",
                "url": "https://www.instagram.com/juanjo_nieto9/"
            },
            {
                "@type": "Person",
                "givenName": "Joan",
                "familyName": "Alcover",
                "gender": "Male",
                "image": "imagenes/nosotros_joan.jpg",
                "url": "https://www.instagram.com/joan6alcover/"
            }
        ],
        "audience": {
            "@type": "Audience",
            "audienceType": "Familias, locales, excursionistas, turistas",
            "geographicArea": "Islas Baleares"
        },
        "contentLocation": {
            "address": "Mallorca, Islas Baleares, Spain",
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "39.65494",
                "longitude": "2.86866"
            },
        },
        "genre": "Playas",
        "operatingSystem": "Windows, MacOS, iOS, Android, Linux",
        "video": {
            "@type": "VideoObject",
            "name": "Vídeo paraíso",
            "description": "Video de las calas y paísajes mallorquines",
            "contentUrl": ["videos/video-paraiso.mp4", "videos/video-paraiso.webm"],
            "about": {
                "@type": "Beach"
            },
            "uploadDate": "2021-03-28",
            "thumbnailUrl": objIndex["index"][path][fotosRandom[0]]
        },
        "image": [
            {
                "@type": "ImageObject",
                "contentUrl": objIndex["index"][path][fotosRandom[0]],
                "about": {
                    "@type": "Beach"
                }
            },
            {
                "@type": "ImageObject",
                "contentUrl": objIndex["index"][path][fotosRandom[1]],
                "about": {
                    "@type": "Beach"
                }
            },
            {
                "@type": "ImageObject",
                "contentUrl": objIndex["index"][path][fotosRandom[2]],
                "about": {
                    "@type": "Beach"
                }
            },
            {
                "@type": "ImageObject",
                "contentUrl": objIndex["index"][path][fotosRandom[3]],
                "about": {
                    "@type": "Beach"
                }
            },
            {
                "@type": "ImageObject",
                "contentUrl": objIndex["index"][path][fotosRandom[4]],
                "about": {
                    "@type": "Beach"
                }
            }
        ],
        "review": [],
        "aggregateRating": {
            "@type": "AggregateRating",
            "bestRating": "5",
            "worstRating": "0",
            "ratingValue": "5",
            "reviewCount": "1"
        },
    }
    //comentarios
    var comentarios = objComentarios["index"];
    for (p = 0; p < 9; p++) {
        var autor = comentarios[p]["nombre"];
        var texto = comentarios[p]["texto"];
        var fecha = new Date(comentarios[p]["fecha"]).toISOString();
        var valoracion = comentarios[p]["valoracion"];
        var cala = comentarios[p]["nombreCala"];
        var url = "calasdemallorca.netlify.app/cala.html?calas&" + comentarios[p]["idCala"];
        info["review"].push({"@type": "Review", "author": {"@type": "Person", "name": autor}, "reviewBody": texto, "datePublished": fecha, "reviewRating":{"@type":"Rating", "bestRating":"5", "worstRating":"0", "ratingValue":valoracion}, "about": {"@type": "Beach", "name": cala, "url": url }});
    }
    return info;
}

function cargarJsonLD(info) {
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(info);
    document.head.appendChild(script);
}