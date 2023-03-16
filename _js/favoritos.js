var objComentarios;

function leerFavoritos() {
    //localStorage.clear();

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
                    escribirFavoritos();
                }
            };
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function escribirFavoritos() {
    AOS.init({
        once: true,
        easing: "ease-in-out"
    });

    var favoritos = JSON.parse(localStorage.getItem("favoritos"));
    if (favoritos == null || favoritos.length == 0) {
        avisoSinFavoritos();
        $('#num-resultados').html("<strong>0 Resultados</strong>");
        return;
    }

    //Mostrar numero de resultados
    if (favoritos.length == 1) $('#num-resultados').html("<strong>" + favoritos.length + " Resultado</strong>");
    else $('#num-resultados').html("<strong>" + favoritos.length + " Resultados</strong>");

    var infoCalas = []; //array que contiene toda la web semantica de las calas filtradas
    favoritos = favoritos.reverse(); //invertir para mantener las mas recientes arriba
    for (i=0; i<favoritos.length; i++) {
        infoCalas[i] = generarJsonLDCala(obj[favoritos[i]], favoritos[i]); //Web semantica

        tarjeta = document.createElement("div");
        tarjeta.setAttribute("id", "fav-card2-" + i);
        tarjeta.setAttribute("class", "card float-start favorites-size favorites-borde mg-bt-md");

        aos = document.createElement("div");
        aos.setAttribute("id", "fav-card-" + i);
        aos.setAttribute("data-aos", "fade-up");
        aos.setAttribute("data-aos-delay", "0");
        aos.setAttribute("data-aos-duration", "800");

        fila = document.createElement("div");
        fila.setAttribute("class", "row");

        col_img = document.createElement("div");
        col_img.setAttribute("class", "col-sm-3 favorites-col-3");
        a = document.createElement("a");
        a.setAttribute("href", "cala.html?calas&" + favoritos[i]);
        img = document.createElement("img");
        img.setAttribute("class", "d-block w-100 favorites-img");
        img.setAttribute("src", obj[favoritos[i]]["imatges"][0]);
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
        titulo.innerHTML = obj[favoritos[i]]["nom"];
        fav = document.createElement("div");
        fav.setAttribute("class", "like-div");
        fav_i = document.createElement("i");
        fav_i.setAttribute("id", "fav-" + i);
        fav_i.setAttribute("class", "like-i press");
        fav_i.setAttribute("onclick", "eliminarFavorito('" + i + "')");
        fav.appendChild(fav_i);

        flex.appendChild(titulo);
        flex.appendChild(fav);

        estrellas = pintarEstrellas(objComentarios["calas"][favoritos[i]]["valoracionGlobal"]);
        texto = document.createElement("div");
        texto.setAttribute("class", "fs-5-card-text");
        texto.innerHTML = obj[favoritos[i]]["descripcio"].substr(0, 170).replace("<br><br>", "") + " (...)";

        btn = document.createElement("a");
        btn.setAttribute("href", "cala.html?calas&" + favoritos[i]);
        btn.setAttribute("class", "btn btn-primary btn-sm float-right mg-top-xsm");
        btn.innerHTML = "Ver más";
        
        block.appendChild(flex);
        block.appendChild(estrellas);
        block.appendChild(texto);
        block.appendChild(btn);

        col_txt.appendChild(block);
        fila.appendChild(col_img);
        fila.appendChild(col_txt);

        tarjeta.appendChild(fila);
        aos.appendChild(tarjeta);
        document.getElementById("favoritos-contenedor").appendChild(aos);
    }
    cargarJsonLD(infoCalas); //cargar web semantica
}

//Funcion que dibuja las estrellas segun la valoracion de cada cala
function pintarEstrellas(n) {
    estrellas = document.createElement("div");
    estrellas.setAttribute("class", "estrellas mg-top-sm-neg mg-bt-xsm");

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

function eliminarFavorito(id) {
    $(`#fav-${id}`).toggleClass("press", 1000);

    idCala = parseInt(id);
    var favJSON = localStorage.getItem("favoritos");
    var favoritos = JSON.parse(favJSON);
    var i = favoritos.indexOf(idCala);
    favoritos.splice(i, 1);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    //Eliminar tarjeta
    var del = document.getElementById("fav-card-" + id);
    $(`#fav-card2-${id}`).fadeOut(400, function(){
        del.remove();

        //Actualizar numero de resultados
        if (favoritos.length == 1) $('#num-resultados').html("<strong>" + favoritos.length + " Resultado</strong>");
        else $('#num-resultados').html("<strong>" + favoritos.length + " Resultados</strong>");

        //Mostrar aviso si no hay tarjetas
        if (favoritos.length == 0) avisoSinFavoritos();
    });

}

function avisoSinFavoritos() {
    if (document.getElementById("alerta-fav") == null) {
        var alerta = document.createElement("div");
        alerta.setAttribute("id", "alerta-fav");
        alerta.setAttribute("class", "alert alert-success fade show fs-6 mx-auto mg-top-md");
        alerta.setAttribute("role", "alert");
        alerta.innerHTML = "Aviso, aún no tienes ninguna cala en Favoritos. Visita el apartado de <a href='listado.html?calas'>Listado</a> o de <a href='mapa.html'>Mapa</a> para empezar a añadir favoritos.";
        document.getElementById("favoritos-contenedor").appendChild(alerta);
    }
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