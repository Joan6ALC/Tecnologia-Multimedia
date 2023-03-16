var idObjeto; //numero de cala/actividad/pueblo
var obj; //JSON de calas/actividades
var objComentarios; //JSON de comentarios
var tema; //calas o actividades o pueblos
var subtema; //pueblo o lugar de interes

function leerCala() {
    idObjetoS = parent.document.URL.substring(parent.document.URL.indexOf('?'), parent.document.URL.length);
    idObjetoS = idObjetoS.replace("?", "");
    idObjetoS = idObjetoS.split("&");
    tema = idObjetoS[0];
    if (tema == "pueblos") {
        subtema = idObjetoS[1];
        idObjeto = parseInt(idObjetoS[2]);
    }
    else idObjeto = parseInt(idObjetoS[1]);

    var url;
    if (tema == "calas") url = "_json/datos.json";
    else if (tema == "actividades") url = "https://sweetmallorca.netlify.app/json/actividades.json";
    else if (tema == "pueblos") url = "https://beyls.netlify.app/json/pobles.json";

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            obj = JSON.parse(xmlhttp.responseText);

            if (tema == "calas") escribirCala();
            else if (tema == "actividades") escribirActividad();
            else if (tema == "pueblos") escribirPueblo();
        }
    };
}

function escribirCala() {
    AOS.init({
        once: true,
        easing: "ease-in-out"
    });

    $('#title-cala').html("Calas de Mallorca - " + obj[idObjeto]["nom"]);
    //Introduccion
    $('#cala-titulo').html("<strong>" + obj[idObjeto]["nom"] + "</strong>");
    $('#cala-descripcion').html(obj[idObjeto]["descripcio"]);
    $('#cala-municipio').html("<strong>Municipio:</strong> &nbsp" + obj[idObjeto]["geoposicionament1"]["city"]);
    escribirFavoritos(idObjeto);

    //Servicios
    $('#cala-tipoCala').html(obj[idObjeto]["dadesPropies"]["serveis"]["tipusCala"]);
    $('#cala-tipoAcceso').html(obj[idObjeto]["dadesPropies"]["serveis"]["tipusAcces"]);
    $('#cala-minusvalidos').html(obj[idObjeto]["dadesPropies"]["serveis"]["accesMinusvalids"]);
    $('#cala-nudista').html(obj[idObjeto]["dadesPropies"]["serveis"]["nudista"]);
    $('#cala-hamacas').html(obj[idObjeto]["dadesPropies"]["serveis"]["hamacas"]);
    $('#cala-sombrillas').html(obj[idObjeto]["dadesPropies"]["serveis"]["sombrillas"]);
    $('#cala-parking').html(obj[idObjeto]["dadesPropies"]["serveis"]["parking"]);
    $('#cala-animales').html(obj[idObjeto]["dadesPropies"]["serveis"]["animals"]);
    $('#cala-duchas').html(obj[idObjeto]["dadesPropies"]["serveis"]["dutxes"]);
    $('#cala-lavabos').html(obj[idObjeto]["dadesPropies"]["serveis"]["lavabos"]);
    $('#cala-embarcaciones').html(obj[idObjeto]["dadesPropies"]["serveis"]["alquilerEmbarcacions"]);
    $('#cala-socorrista').html(obj[idObjeto]["dadesPropies"]["serveis"]["socorrista"]);
    $('#cala-boyas').html(obj[idObjeto]["dadesPropies"]["serveis"]["boies"]);
    $('#cala-pier').html(obj[idObjeto]["dadesPropies"]["serveis"]["pier"]);
    $('#cala-bar').html(obj[idObjeto]["dadesPropies"]["serveis"]["bar"]);

    //Galeria de imagenes
    cargarImagenes();

    //Valoraciones
    var xmlhttp = new XMLHttpRequest();
    var url = "https://calasdemallorca.pythonanywhere.com/leerComentarios";
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            objComentarios = JSON.parse(xmlhttp.responseText);
            escribirComentarios(objComentarios["calas"][idObjeto]["comentarios"], objComentarios["calas"][idObjeto]["valoracionGlobal"]);
        }
    };

    //Mapa
    cargarMapaCala(obj[idObjeto]["nom"], obj[idObjeto]["geoposicionament1"]["lat"], obj[idObjeto]["geoposicionament1"]["long"]);

    //Meteo
    cargarMeteo(obj[idObjeto]["nom"]);

    //Pueblo cercano
    var xmlhttp2 = new XMLHttpRequest();
    xmlhttp2.open("GET", "https://beyls.netlify.app/json/pobles.json", true);
    xmlhttp2.send();
    xmlhttp2.onreadystatechange = function () {
        if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
            pueblos = JSON.parse(xmlhttp2.responseText);
            escribirPuebloCercano(pueblos);
        }
    };

}

//Funcion que escribe comentarios en el div correspondiente
function escribirComentarios(comentarios, valGlobal) {
    //Web Semantica
    var info = generarJsonLDCala(obj[idObjeto]);
    cargarJsonLD(info);


    var valoracion = Math.round(valGlobal * 10) / 10;
    $('#cala-puntuacion').html(valoracion.toString().replace(".", ",") + " de 5");
    if (comentarios.length == 0 && document.getElementById("alerta-comments") == null) {
        var alerta = document.createElement("div");
        alerta.setAttribute("id", "alerta-comments");
        alerta.setAttribute("class", "alert alert-success fade show fs-6 mx-auto mg-top-md comments-aviso");
        alerta.setAttribute("role", "alert");
        alerta.innerHTML = "Aún no hay ningún comentario en esta cala. ¡Puedes ser el primero en comentar!";
        document.getElementById("cala-contenedor").appendChild(alerta);
        return;
    }

    const container = document.getElementById("cala-contenedor");
    //eliminar todas las tarjetas existentes (asi se repite la animacion)
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    for (i = 0; i < comentarios.length; i++) {
        tarjeta = document.createElement("div");
        tarjeta.setAttribute("class", "comment");

        div_img = document.createElement("div");
        div_img.setAttribute("class", "comment-avatar");
        img = document.createElement("img");
        img.setAttribute("src", "imagenes/avatar.png");
        img.setAttribute("alt", "...");
        div_img.appendChild(img);

        caja = document.createElement("div");
        caja.setAttribute("class", "comment-box");
        flex = document.createElement("div");
        flex.setAttribute("class", "d-flex justify-content-between");

        nombre = document.createElement("div");
        nombre.setAttribute("class", "comment-name my-auto");
        nombre.innerHTML = comentarios[i]["nombre"];
        estrellas = pintarEstrellas(comentarios[i]["valoracion"]);
        flex.appendChild(nombre);
        flex.appendChild(estrellas);

        texto = document.createElement("div");
        texto.setAttribute("class", "comment-text text-start");
        texto.innerHTML = comentarios[i]["texto"];

        footer = document.createElement("div");
        footer.setAttribute("class", "comment-footer");
        info = document.createElement("div");
        info.setAttribute("class", "comment-info");
        fecha = document.createElement("div");
        fecha.setAttribute("class", "comment-date");
        date = new Date(comentarios[i]["fecha"]);
        fecha.innerHTML = date.getDate() + " de " + getMes(date.getMonth()) + " de " + date.getFullYear();
        info.appendChild(fecha);
        footer.appendChild(info);

        caja.appendChild(flex);
        caja.appendChild(texto);
        caja.appendChild(footer);
        tarjeta.appendChild(div_img);
        tarjeta.appendChild(caja);
        document.getElementById("cala-contenedor").appendChild(tarjeta);
    }
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

//Funcion que carga el mapa con las coordenadas que tocan
function cargarMapaCala(nombre, lat, lon) {
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
        name: nombre,
    });

    var vectorSource = new ol.source.Vector({
        features: [iconFeature]
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

    var zoom = 12;
    if (tema == "calas") zoom = 11;
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }),
            vectorLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: zoom
        }),
        controls: ol.control.defaults({ attribution: false }),
        target: 'cala-mapa'
    });
}

//Funcion que escribe la meteorologia
function cargarMeteo(nombre) {
    var lat = obj[idObjeto]["geoposicionament1"]["lat"];
    var long = obj[idObjeto]["geoposicionament1"]["long"];
    $.getJSON("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&exclude=minutely,hourly,alerts&lang=es&appid=d1546bfd8c828a6a1add9c7173a462ac", function (json) {
        //Ahora
        $('#ahora-lugar').html("Ahora en " + nombre);
        $('#ahora-icono').attr("src", "http://openweathermap.org/img/wn/" + json.current.weather[0].icon + "@2x.png");
        $('#ahora-descripcion').html(capitalize(json.current.weather[0].description));
        $('#ahora-temperatura').html((Math.round((json.current.temp - 273.15) * 10) / 10) + " °C");
        $('#ahora-viento').html((Math.round(json.current.wind_speed * 3.6)) + " kmh");
        $('#ahora-humedad').html(json.current.humidity + "%");
        $('#ahora-uv').html(json.current.uvi);
        $('#ahora-nubes').html(json.current.clouds + "%");
        var sunrise = new Date(json.current.sunrise * 1000);
        $('#ahora-sunrise').html(sunrise.toLocaleTimeString().substr(0, 4));
        var sunset = new Date(json.current.sunset * 1000);
        $('#ahora-sunset').html(sunset.toLocaleTimeString().substr(0, 5));

        //Proximos 5 dias
        for (var i = 0; i < 5; i++) {
            if (i == 0) {
                $('#dia0-dia').html("Hoy");
            }
            else if (i == 1) {
                $('#dia1-dia').html("Mañana");
            }
            else {
                var fecha = new Date(json.daily[i].dt * 1000);
                $(`#dia${i}-dia`).html(fecha.getDate() + " de " + getMes(fecha.getMonth()));
            }
            $(`#dia${i}-icono`).attr("src", "http://openweathermap.org/img/wn/" + json.daily[i].weather[0].icon + "@2x.png");
            var max_t = Math.round(json.daily[i].temp.max - 273.15);
            var min_t = Math.round(json.daily[i].temp.min - 273.15);
            $(`#dia${i}-temperatura`).html(min_t + " - " + max_t + " °C");
            $(`#dia${i}-viento`).html((Math.round(json.daily[i].wind_speed * 3.6)) + " kmh");
        }
    });
}

//Funcion que carga las imagenes en el carousel
function cargarImagenes() {
    var nFotos = obj[idObjeto]["imatges"].length;
    if (nFotos > 5) nFotos = 5;
    for (var i = 0; i < nFotos; i++) {
        //fotos
        var item = document.createElement("div");
        if (i == 0) item.setAttribute("class", "carousel-item active");
        else item.setAttribute("class", "carousel-item");
        var img = document.createElement("img");
        img.setAttribute("class", "d-block car-img");
        img.setAttribute("src", obj[idObjeto]["imatges"][i]);
        img.setAttribute("alt", "...");
        item.appendChild(img);
        document.getElementById("carousel-fotos").appendChild(item);

        //thumbnails
        var th = document.createElement("li");
        th.setAttribute("class", "list-inline-item");
        var a = document.createElement("a");
        if (i == 0) {
            a.setAttribute("class", "active");
            a.setAttribute("aria-current", "true");
        }
        a.setAttribute("data-bs-slide-to", i);
        a.setAttribute("data-bs-target", "#mi-carousel2");
        var img2 = document.createElement("img");
        img2.setAttribute("class", "img-fluid car-thumbnail");
        img2.setAttribute("src", obj[idObjeto]["imatges"][i]);
        img2.setAttribute("alt", "...");
        a.appendChild(img2);
        th.appendChild(a);
        document.getElementById("carousel-fotos-t").appendChild(th);
    }
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

function enviarComentario() {
    //alerta enviado
    if (document.getElementById("alerta-enviado") != null) {
        document.getElementById("alerta-enviado").remove();
    }
    var hayAlerta = false;
    //comprobar que los campos son correctos
    if (document.getElementById("comment-nombre").value == "" && !document.getElementById("comment-anonymous").checked) { //no hay nombre
        hayAlerta = true;
        var enviado = document.createElement("div");
        enviado.setAttribute("id", "alerta-enviado");
        enviado.setAttribute("class", "alert alert-danger fade show alerta-enviar");
        enviado.setAttribute("role", "alert");
        enviado.innerHTML = "Error: nombre";
        document.getElementById("container-enviar").appendChild(enviado);
    }
    else {
        var enviado = document.createElement("div");
        enviado.setAttribute("id", "alerta-enviado");
        enviado.setAttribute("class", "alert alert-success fade show alerta-enviar");
        enviado.setAttribute("role", "alert");
        enviado.innerHTML = "<strong>Enviado!</strong>";
        document.getElementById("container-enviar").appendChild(enviado);
    }

    window.setTimeout(function () {
        $("#alerta-enviado").fadeTo(500, 0).slideUp(500, function () {
            $(this).remove();
        });
    }, 2000);
    if (hayAlerta) return;

    //peticion de POST al servidor de comentarios
    var nombre;
    if ($("#comment-anonymous").is(":checked")) {
        nombre = "Anónimo"
    }
    else {
        nombre = document.getElementById("comment-nombre").value; //nombre
    }
    var texto = document.getElementById("comment-texto").value; //texto
    var valoracion = $("#comment-puntuacion").html(); //puntuacion
    var fecha = new Date().getTime();

    $.post("https://calasdemallorca.pythonanywhere.com/enviarComentarios", {
        cala: idObjeto,
        nombreCala: obj[idObjeto]["nom"],
        nombre: nombre,
        texto: texto,
        valoracion: parseFloat(valoracion),
        fecha: fecha
    });

    //eliminar los campos
    document.getElementById("comment-nombre").value = "";
    document.getElementById("comment-anonymous").checked = false;
    document.getElementById("comment-texto").value = "";
    $("#comment-puntuacion").html("0");
    document.getElementById("val-1").checked = false;
    document.getElementById("val-2").checked = false;
    document.getElementById("val-3").checked = false;
    document.getElementById("val-4").checked = false;
    document.getElementById("val-5").checked = false;

    window.setTimeout(function () {
        //peticion de GET al servidor de comentarios
        var xmlhttp = new XMLHttpRequest();
        var url = "https://calasdemallorca.pythonanywhere.com/leerComentarios";
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var myArr = JSON.parse(xmlhttp.responseText);
                escribirComentarios(myArr["calas"][idObjeto]["comentarios"], myArr["calas"][idObjeto]["valoracionGlobal"]);
            }
        };
    }, 300);

}

//Funcion que actualiza el valor de las estrellas del nuevo comentario
function setRating(val) {
    $("#comment-puntuacion").html(val);
}

//Funcion que pone la primera letra en mayusculas
function capitalize(string) {
    return string.replace(/(^|\s)\S/g, l => l.toUpperCase());
}

//Funcion que cambia el icono de favorito
function toggleFavorito(id) {

    $(`#${id}`).toggleClass("press", 1000);
    if ($("#cala-favorito-label").html().includes("Añadir a")) {
        $("#cala-favorito-label").html($("#cala-favorito-label").html().replace("Añadir a", "Eliminar de"));
        editarFavoritos(idObjeto, true); //añadir a favoritos
    }
    else {
        $("#cala-favorito-label").html($("#cala-favorito-label").html().replace("Eliminar de", "Añadir a"));
        editarFavoritos(idObjeto, false); //eliminar de favoritos
    }
}
//Funcion que escribe el icono de favoritos segun si la cala está o no en favoritos
function escribirFavoritos(numCala) {
    var favJSON = localStorage.getItem("favoritos");
    if (favJSON === null) { //no hay favoritos
        $('#cala-favorito-label').html("Añadir a favoritos" + $('#cala-favorito-label').html());
        return;
    }
    else {
        var favoritos = JSON.parse(favJSON); //parsear el array del JSON
        if (favoritos.includes(numCala)) { //esta en favoritos
            $('#fav-1').addClass("press");
            $('#cala-favorito-label').html("Eliminar de favoritos" + $('#cala-favorito-label').html());
        }
        else { //no esta en favoritos
            $('#cala-favorito-label').html("Añadir a favoritos" + $('#cala-favorito-label').html());
        }
    }
}

//Funcion que añade o elimina de favoritos. numCala: numero de cala, añadir: true es añadir y false es eliminar
function editarFavoritos(numCala, añadir) {
    var favoritos;
    var favJSON = localStorage.getItem("favoritos");
    if (favJSON === null) favoritos = []; //crear array de favoritos
    else favoritos = JSON.parse(favJSON); //parsear el array del JSON

    if (añadir) {
        favoritos.push(numCala);
    }
    else {
        var i = favoritos.indexOf(numCala);
        favoritos.splice(i, 1);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

//Funcion que evita el refresco de la pagina al enviar un comentario
$(function () {
    $("form").submit(function () { return false; });
});


//ACTIVIDADES
function escribirActividad() {
    document.getElementById("bg-cala").setAttribute("class", "bg-cala-verde");
    $("#pueblo-label").remove(); //borrar pueblo mas cercano
    $("#pueblo").remove(); //borrar pueblo mas cercano
    $('#title-cala').html("Calas de Mallorca - " + obj[idObjeto]["nom"]);
    //Introduccion
    $('#cala-titulo').html("<strong>" + obj[idObjeto]["nom"] + "</strong>");
    $('#cala-descripcion').html(obj[idObjeto]["descripcio"]);
    $('#cala-municipio').html("<strong>Municipio:</strong> &nbsp" + obj[idObjeto]["geoposicionament1"]["city"]);
    var precio = parseFloat(obj[idObjeto]["preu"]["import"].replace("€", ""));
    if (precio == 0) $('#cala-favorito-label').html("<strong>Precio:</strong> &nbsp" + "Gratuito");
    else $('#cala-favorito-label').html("<strong>Precio:</strong> &nbsp" + obj[idObjeto]["preu"]["import"]);
    $('#cala-favorito-label').removeClass("like-div");
    //escribirFavoritos(idObjeto);

    //Informacion extra
    $('#cala-servicios').html("Información extra");
    $('#cala-tipoCala-l').html("<strong> Duración: </strong>");
    $('#cala-tipoCala').html(obj[idObjeto]["dadesPropies"]["duracio"]);
    $('#cala-tipoAcceso-l').html("<strong> Personas: </strong>");
    $('#cala-tipoAcceso').html(obj[idObjeto]["dadesPropies"]["numPersonasMin"] + " - " + obj[idObjeto]["dadesPropies"]["numPersonasMax"]);
    $('#cala-minusvalidos-l').html("<strong> Cancelación: </strong>");
    if (obj[idObjeto]["dadesPropies"]["cancelacio"]) $('#cala-minusvalidos').html("Sí");
    else $('#cala-minusvalidos').html("No");
    $('#cala-nudista-l').html("<strong> Mascotas: </strong>");
    if (obj[idObjeto]["dadesPropies"]["mascotes"]) $('#cala-nudista').html("Sí");
    else $('#cala-nudista').html("No");
    $('#cala-hamacas-l').html("<strong> Niños: </strong>");
    if (obj[idObjeto]["dadesPropies"]["nins"]) $('#cala-hamacas').html("Sí");
    else $('#cala-hamacas').html("No");
    $('#cala-sombrillas-l').html("<strong> Minusválidos: </strong>");
    if (obj[idObjeto]["dadesPropies"]["access"]) $('#cala-sombrillas').html("Sí");
    else $('#cala-sombrillas').html("No");
    $('#cala-parking-l').html("<strong> Teléfono: </strong>");
    $('#cala-parking').html("<a href='tel:" + obj[idObjeto]["contacte"]["telf"] + "'>" + obj[idObjeto]["contacte"]["telf"] + "</a>");
    $('#cala-animales-l').html("<strong> Email: </strong>");
    $('#cala-animales').html("<a href=mailto:'" + obj[idObjeto]["contacte"]["email"] + "'><i class='fa fa-envelope'></i></a>");
    $('#cala-duchas-l').html("<strong> Página web: </strong>");
    $('#cala-duchas').html("<a target='_blank' href='" + obj[idObjeto]["contacte"]["xarxes"]["web"] + "'><i class='fa fa-globe'></i></a>");
    $('#cala-lavabos-l').html("<strong> Facebook: </strong>");
    $('#cala-lavabos').html("<a target='_blank' href='" + obj[idObjeto]["contacte"]["xarxes"]["facebook"] + "'><i class='fa fa-facebook'></i></a>");
    $('#cala-embarcaciones-l').html("<strong> Twitter: </strong>");
    $('#cala-embarcaciones').html("<a target='_blank' href='" + obj[idObjeto]["contacte"]["xarxes"]["twitter"] + "'><i class='fa fa-twitter'></i></a>");
    $('#cala-socorrista-l').html("<strong> Instagram: </strong>");
    $('#cala-socorrista').html("<a target='_blank' href='" + obj[idObjeto]["contacte"]["xarxes"]["instagram"] + "'><i class='fa fa-instagram'></i></a>");
    const container = document.getElementById("servicios-fila-5");
    while (container.firstChild) container.removeChild(container.lastChild);
    container.setAttribute("class", "");

    //Galeria de imagenes
    cargarImagenes();

    //Valoraciones
    var val = Math.round(obj[idObjeto]["puntuacio"] * 10) / 10;
    $("#valoraciones").html("Puntuación - " + val.toString().replace(".", ",") + " de 5");
    const container2 = document.getElementById("escribir-comentario");
    while (container2.firstChild) container2.removeChild(container2.lastChild);
    container2.setAttribute("class", "");
    var a = document.createElement("a");
    a.setAttribute("class", "fa fa-star checked inactive-link mg-left-xsm");
    document.getElementById("valoraciones").appendChild(a);

    //Mapa
    cargarMapaCala(obj[idObjeto]["nom"], obj[idObjeto]["geoposicionament1"]["lat"], obj[idObjeto]["geoposicionament1"]["long"]);

    //Meteo
    cargarMeteo(obj[idObjeto]["geoposicionament1"]["city"]);

    //Web Semantica
    var info = generarJsonLDActividad(obj[idObjeto]);
    cargarJsonLD(info);
}


//PUEBLOS
function escribirPueblo() {
    document.getElementById("bg-cala").setAttribute("class", "bg-cala-verde");
    $("#pueblo-label").remove(); //borrar pueblo mas cercano
    $("#pueblo").remove(); //borrar pueblo mas cercano
    $('#title-cala').html("Calas de Mallorca - " + obj[idObjeto]["nom"]);
    //Introduccion
    $('#cala-titulo').html("<strong>" + obj[idObjeto]["nom"] + "</strong>");
    if (subtema == "pueblo") { //pueblo
        //Web Semantica
        var info = generarJsonLDPueblo(obj[idObjeto]);
        cargarJsonLD(info);

        $('#cala-municipio').html("<strong>Tipo:</strong> &nbspPueblo");
        $('#cala-favorito-label').html("");
        $('#cala-favorito-label').removeClass("like-div");
        $('#cala-descripcion').html(obj[idObjeto]["dadesPropies"]["introduccio"]);

        for (i = 1; i < 6; i++) $(`#servicios-fila-${i}`).remove();
        $('#cala-servicios').html("Historia");
        $('#cala-historia').html(obj[idObjeto]["dadesPropies"]["historia"]);
    }
    else { //lugar de interes
        //Web Semantica
        var info = generarJsonLDLugar(obj[idObjeto]);
        cargarJsonLD(info);

        $('#cala-descripcion').html(obj[idObjeto]["dadesPropies"]["historia"]);
        $('#cala-municipio').html("<strong>Municipio:</strong> &nbsp" + obj[idObjeto]["geoposicionament1"]["city"]);
        var precio = parseFloat(obj[idObjeto]["preu"]["import"].replace("€", ""));
        if (precio == 0) $('#cala-favorito-label').html("<strong>Precio:</strong> &nbsp" + "Gratuito");
        else $('#cala-favorito-label').html("<strong>Precio:</strong> &nbsp" + precio + " €");
        $('#cala-favorito-label').removeClass("like-div");

        //informacion extra
        $('#cala-servicios').html("Información extra");
        $('#cala-tipoCala-l').html("<strong> Teléfono: </strong>");
        var tel = obj[idObjeto]["contacte"]["telf"];
        if (tel == "") $('#cala-tipoCala').html("No disponible");
        else $('#cala-tipoCala').html("<a href='tel:" + tel + "'>" + obj[idObjeto]["contacte"]["telf"] + "</a>");
        $('#cala-tipoAcceso-l').html("<strong> Página web: </strong>");
        var web = obj[idObjeto]["contacte"]["xarxes"]["web"];
        if (web == "") $('#cala-tipoAcceso').html("No disponible");
        else $('#cala-tipoAcceso').html("<a target='_blank' href='" + web + "'><i class='fa fa-globe'></i></a>");
        $('#cala-minusvalidos-l').html("<strong> Facebook: </strong>");
        var fac = obj[idObjeto]["contacte"]["xarxes"]["facebook"];
        if (fac == "") $('#cala-minusvalidos').html("No disponible");
        else $('#cala-minusvalidos').html("<a target='_blank' href='https://www.facebook.com/" + fac.replace("@", "") + "/'><i class='fa fa-facebook'></i></a>");
        for (i = 2; i < 6; i++) $(`#servicios-fila-${i}`).remove();

        //Horario
        var tit = document.createElement("h5");
        tit.innerHTML = "Horario";
        document.getElementById("cala-horario").appendChild(tit);
        var dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        var di = ["di", "dm", "dx", "dj", "dv", "ds", "dg"];
        var abrir = [];
        var cerrar = [];
        for (i = 0; i < di.length; i++) {
            abrir[i] = obj[idObjeto]["horari"][di[i]][0]["in"].replace("h", "");
            cerrar[i] = obj[idObjeto]["horari"][di[i]][0]["out"].replace("h", "");
        }
        //contar cuantos dias no tienen horario
        var cont = 0;
        for (i = 0; i < abrir.length; i++) if (abrir[i] == "") cont++;

        //rellenar el dia de cada horario
        for (i = 0; i < di.length; i++) {
            var row = document.createElement("p");
            row.setAttribute("class", "row fs-6");
            var col1 = document.createElement("div");
            col1.setAttribute("class", "col-5-horario");
            col1.innerHTML = "&emsp;<strong>" + dias[i] + ":</strong>";
            var col2 = document.createElement("div");
            col2.setAttribute("class", "col-5");

            if (cont == 7) { //ningun dia tiene horario
                col2.innerHTML = "Todo el día"
            }
            else { //hay horario definido
                if (abrir[i] == "") col2.innerHTML = "Cerrado";
                else col2.innerHTML = abrir[i] + " - " + cerrar[i];
            }
            row.appendChild(col1);
            row.appendChild(col2);
            document.getElementById("cala-horario").appendChild(row);
        }
    }

    //Galeria de imagenes
    cargarImagenes();

    //Valoraciones
    var val = Math.round(obj[idObjeto]["puntuacio"] * 10) / 10;
    $("#valoraciones").html("Puntuación - " + val.toString().replace(".", ",") + " de 5");
    const container2 = document.getElementById("escribir-comentario");
    while (container2.firstChild) container2.removeChild(container2.lastChild);
    container2.setAttribute("class", "");
    var a = document.createElement("a");
    a.setAttribute("class", "fa fa-star checked inactive-link mg-left-xsm");
    document.getElementById("valoraciones").appendChild(a);

    //Mapa
    cargarMapaCala(obj[idObjeto]["nom"], obj[idObjeto]["geoposicionament1"]["lat"], obj[idObjeto]["geoposicionament1"]["long"]);

    //Meteo
    cargarMeteo(obj[idObjeto]["geoposicionament1"]["city"]);
}

//Funcion que escribe el pueblo más cercano (si hay) cuando se muestra una cala
function escribirPuebloCercano(pueblos) {
    var p = []
    for (i = 0; i < pueblos.length; i++) {
        if (obj[idObjeto]["geoposicionament1"]["city"] == pueblos[i]["geoposicionament1"]["city"] && pueblos[i]["tipus"] == "poble") {
            p.push(i);
        }
    }

    if (p.length != 0) {
        $("#pueblo-a").attr("href", "cala.html?pueblos&pueblo&" + p[0]);
        $("#pueblo-img").attr("src", pueblos[p[0]]["imatges"][0]);
        $("#pueblo-img").attr("alt", "...");
        $("#pueblo-nombre").html(pueblos[p[0]]["nom"]);
        var desc = pueblos[p[0]]["dadesPropies"]["introduccio"].replace("<p>", "").replace("<p>", "");
        if (desc.length < 150) $("#pueblo-descripcion").html(desc);
        else $("#pueblo-descripcion").html(desc.substr(0, 150) + " (...)");
        $("#pueblo-bt").attr("href", "cala.html?pueblos&pueblo&" + p[0]);

        var dist = distance(obj[idObjeto]["geoposicionament1"]["lat"], obj[idObjeto]["geoposicionament1"]["long"],
            pueblos[p[0]]["geoposicionament1"]["lat"], pueblos[p[0]]["geoposicionament1"]["long"]);
        $("#pueblo-distancia").html("Distancia: " + (Math.round(dist * 100) / 100) + " km");
    }
    else {
        $("#pueblo-label").remove();
        $("#pueblo").remove();
    }

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
function generarJsonLDCala(cala) {
    likes = cala["likes"]
    if (likes == 0) likes = 1;

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
            "bestRating": "5",
            "worstRating": "0",
            "ratingValue": objComentarios["calas"][idObjeto]["valoracionGlobal"],
            "reviewCount": likes
        },
        "description": cala["descripcio"],
        "photos": [],
        "amenityFeature": [],
        "review": [],
        "hasMap": {
            "@type": "Map",
            "mapType": { "@id": "https://schema.org/VenueMap" },
        }
    }
    //fotos
    for (p = 0; p < cala["imatges"].length; p++) {
        info["photos"][p] = cala["imatges"][p];
    }
    //servicios
    var servicios = ["Tipo de cala", "Tipo de acceso", "Acceso minusválidos", "Nudista", "Hamacas", "Sombrillas", "Parking", "Animales", "Duchas", "Lavabos", "Alquiler botes", "Socorrista", "Boyas", "Pier", "Bar"];
    var clave = ["tipusCala", "tipusAcces", "accesMinusvalids", "nudista", "hamacas", "sombrillas", "parking", "animals", "dutxes", "lavabos", "alquilerEmbarcacions", "socorrista", "boies", "pier", "bar"];
    for (p = 0; p < servicios.length; p++) {
        var nombre = servicios[p];
        var valor = cala["dadesPropies"]["serveis"][clave[p]];
        info["amenityFeature"].push({ "@type": "LocationFeatureSpecification", "name": nombre, "value": valor });
    }
    //comentarios
    var comentarios = objComentarios["calas"][idObjeto]["comentarios"];
    for (p = 0; p < comentarios.length; p++) {
        var autor = comentarios[p]["nombre"];
        var texto = comentarios[p]["texto"];
        var fecha = new Date(comentarios[p]["fecha"]).toISOString();
        var valoracion = comentarios[p]["valoracion"];
        info["review"].push({ "@type": "Review", "author": { "@type": "Person", "name": autor }, "reviewBody": texto, "datePublished": fecha, "reviewRating": { "@type": "Rating", "bestRating": "5", "worstRating": "0", "ratingValue": valoracion } });
    }

    return info;
}

function generarJsonLDActividad(act) {
    likes = act["likes"]
    if (likes == 0) likes = 1;
    var precio = act["preu"]["import"].replace("€", "");
    let info = {
        "@context": "http://www.schema.org",
        "@type": "Product",
        "name": act["nom"],
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": act["geoposicionament1"]["lat"],
            "longitude": act["geoposicionament1"]["long"]
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "itemReviewed": "Thing",
            "bestRating": "5",
            "worstRating": "0",
            "ratingValue": act["puntuacio"],
            "reviewCount": likes
        },
        "description": act["descripcio"],
        "image": [],
        "hasMap": {
            "@type": "Map",
            "mapType": { "@id": "https://schema.org/VenueMap" },
        },
        "offers": {
            "@type": "Offer",
            "price": precio,
            "priceCurrency": "EUR"
        }
    }
    //fotos
    for (p = 0; p < act["imatges"].length; p++) {
        info["image"][p] = act["imatges"][p];
    }

    return info;
}

function generarJsonLDPueblo(pueb) {
    likes = pueb["likes"]
    if (likes == 0) likes = 1;
    let info = {
        "@context": "http://www.schema.org",
        "@type": "Place",
        "name": pueb["nom"],
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": pueb["geoposicionament1"]["lat"],
            "longitude": pueb["geoposicionament1"]["long"]
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "itemReviewed": "Thing",
            "bestRating": "5",
            "worstRating": "0",
            "ratingValue": pueb["puntuacio"],
            "reviewCount": likes
        },
        "description": pueb["dadesPropies"]["introduccio"],
        "image": [],
        "hasMap": {
            "@type": "Map",
            "mapType": { "@id": "https://schema.org/VenueMap" },
        }
    }
    //fotos
    for (p = 0; p < pueb["imatges"].length; p++) {
        info["image"][p] = pueb["imatges"][p];
    }

    return info;
}

function generarJsonLDLugar(pueb) {
    likes = pueb["likes"]
    if (likes == 0) likes = 1;
    var precio = pueb["preu"]["import"].replace("€", "");
    let info = {
        "@context": "http://www.schema.org",
        "@graph": [
            {
                "@type": "Place",
                "name": pueb["nom"],
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": pueb["geoposicionament1"]["lat"],
                    "longitude": pueb["geoposicionament1"]["long"]
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "itemReviewed": "Thing",
                    "bestRating": "5",
                    "worstRating": "0",
                    "ratingValue": pueb["puntuacio"],
                    "reviewCount": likes
                },
                "description": pueb["dadesPropies"]["historia"],
                "image": [],
                "hasMap": {
                    "@type": "Map",
                    "mapType": { "@id": "https://schema.org/VenueMap" },
                }
            },
            {
                "@type": "Offer",
                "price": precio,
                "priceCurrency": "EUR",
            }
        ]
    }
    //fotos
    for (p = 0; p < pueb["imatges"].length; p++) {
        info["@graph"][0]["image"][p] = pueb["imatges"][p];
    }

    return info;
}

function cargarJsonLD(info) {
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(info);
    document.head.appendChild(script);
}