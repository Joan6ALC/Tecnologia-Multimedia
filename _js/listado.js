var obj; //Aqui se va a cargar el JSON principal
var objComentarios; //JSON de comentarios
var tema; //Calas, actividades o pueblos

function leerListado() {
    var etiquetaS = parent.document.URL.substring(parent.document.URL.indexOf('?'), parent.document.URL.length);
    tema = etiquetaS.replace("?", "");

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
            if (tema == "calas") {
                //peticion de GET al servidor de comentarios
                var xmlhttp2 = new XMLHttpRequest();
                xmlhttp2.open("GET", "https://calasdemallorca.pythonanywhere.com/leerComentarios", true);
                xmlhttp2.send();
                xmlhttp2.onreadystatechange = function () {
                    if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
                        objComentarios = JSON.parse(xmlhttp2.responseText);
                        escribirListadoCalas();
                    }
                };
            }
            else if (tema == "actividades") escribirListadoActividades();
            else if (tema == "pueblos") escribirListadoPueblos();
        }
    };
}

function escribirListadoCalas() {
    AOS.init({
        once: true,
        easing: "ease-in-out"
    });
    //Introduccion
    document.getElementById("nav-calas").setAttribute("class", "nav-link active");
    document.getElementById("nav-calas").setAttribute("aria-current", "page");
    document.getElementById("nav-calas").setAttribute("href", "#");
    document.getElementById("listado-titulo").innerHTML = "Listado de Calas";
    document.getElementById("listado-descripcion").innerHTML = "A continuación se presenta el listado de todas las calas disponibles de la web. Se pueden aplicar como máximo 5 filtros a elegir del menú desplegable (municipios, tipos de playa, si hay hamacas, socorrista...). En el caso de elegir más de un municipio se mostrarán todas las calas que pertenezcan aalguno de los municipios seleccionados. También se pueden ordenar las calas filtradas por Nombre y Valoración de los usuarios.";

    //Filtros
    var filtros = ["Arena", "Piedra", "Roca", "Minusválidos", "Nudista", "Hamacas", "Sombrillas", "Parking",
        "Animales", "Duchas", "Lavabos", "Alquiler Botes", "Socorrista", "Boyas", "Pier", "Bar"];
    var titulos = ["tipusCala", "tipusCala", "tipusCala", "accesMinusvalids", "nudista", "hamacas", "sombrillas", "parking",
        "animals", "dutxes", "lavabos", "alquilerEmbarcacions", "socorrista", "boies", "pier", "bar"];
    for (i = 0; i < filtros.length; i++) {
        var f = document.createElement("option");
        f.setAttribute("value", filtros[i].toLowerCase());
        f.setAttribute("title", titulos[i]);
        f.innerHTML = filtros[i];
        document.getElementById("desplegable-filtros").appendChild(f);
    }

    //Municipios
    var municipios = [];
    for (i = 0; i < obj.length; i++) {
        var c = obj[i]["geoposicionament1"]["city"];
        if (municipios.indexOf(c) == -1) municipios.push(c);
    }
    municipios = municipios.sort();
    for (i = 0; i < municipios.length; i++) {
        var m = document.createElement("option");
        m.setAttribute("value", municipios[i].toLowerCase());
        m.innerHTML = municipios[i];
        document.getElementById("desplegable-municipios").appendChild(m);
    }

    //Tarjetas de calas
    filtrar_ordenar();
}

//Funcion que crea todas las tarjetas de cala segun un array de numeros de cala
function escribirTarjetasCala(arr) {
    const container = document.getElementById("listado-contenedor");
    //eliminar todas las tarjetas existentes (asi se repite la animacion)
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    var infoCalas = []; //array que contiene toda la web semantica de las calas filtradas

    //actualizar numero de resultados
    if (arr.length == 1) $('#num-resultados').html("<strong>" + arr.length + " Resultado</strong>");
    else $('#num-resultados').html("<strong>" + arr.length + " Resultados</strong>");
    if (arr.length == 0) { //si no hay que crear ninguna tarjeta de cala
        if (document.getElementById("alerta-no-calas") == null) {
            var alerta = document.createElement("div");
            alerta.setAttribute("id", "alerta-no-calas");
            alerta.setAttribute("class", "alert alert-info alert-dismissible fade show fs-6 mx-auto mg-top-md");
            alerta.setAttribute("role", "alert");
            alerta.innerHTML = "No hay calas que cumplan los filtros seleccionados. Por favor, considera cambiar algún filtro.";
            var bt = document.createElement("button");
            bt.setAttribute("type", "button");
            bt.setAttribute("class", "btn-close");
            bt.setAttribute("data-bs-dismiss", "alert");
            bt.setAttribute("aria-label", "Close");
            alerta.appendChild(bt);
            document.getElementById("listado-contenedor").appendChild(alerta);
        }
    }
    else for (num = 0; num < arr.length; num++) {
        infoCalas[num] = generarJsonLDCala(obj[arr[num]], arr[num]); //Web semantica

        tarjeta = document.createElement("div");
        //añadir clases y definir las calas/fila seleccionadas
        if (document.getElementById("objetos-1").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-1 card-borde mg-bt-md card-zoom");
        } else if (document.getElementById("objetos-2").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-2 card-borde mg-bt-md card-zoom");
        } else if (document.getElementById("objetos-3").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-3 card-borde mg-bt-md card-zoom");
        }

        aos = document.createElement("div");
        aos.setAttribute("data-aos", "fade-up");
        aos.setAttribute("data-aos-delay", "0");
        aos.setAttribute("data-aos-duration", "800");

        a_img = document.createElement("a");
        a_img.setAttribute("href", "cala.html?calas&" + arr[num]);
        img = document.createElement("img");
        img.setAttribute("src", obj[arr[num]]["imatges"][0]);
        img.setAttribute("class", "card-img-top");
        //img.setAttribute("alt", "...");
        a_img.appendChild(img);

        cuerpo = document.createElement("div");
        cuerpo.setAttribute("class", "card-body");

        primero = document.createElement("div");
        primero.setAttribute("class", "d-flex justify-content-between");
        titulo = document.createElement("h5");
        titulo.setAttribute("class", "card-title fs-5-card-title");
        titulo.innerHTML = obj[arr[num]]["nom"];
        estrellas = pintarEstrellas(objComentarios["calas"][arr[num]]["valoracionGlobal"]);
        primero.appendChild(titulo);
        primero.appendChild(estrellas);

        municipio = document.createElement("div");
        municipio.setAttribute("class", "mg-top-sm-neg mg-bt-xsm fs-5-card-text");
        municipio.innerHTML = "Municipio: " + obj[arr[num]]["geoposicionament1"]["city"];

        descripcion = document.createElement("p");
        descripcion.setAttribute("class", "card-text fs-5-card-text");
        descripcion.innerHTML = obj[arr[num]]["descripcio"].substr(0, 170).replace("<br><br>", "") + " (...)";

        boton = document.createElement("a");
        boton.setAttribute("href", "cala.html?calas&" + arr[num]);
        boton.setAttribute("class", "btn btn-primary btn-sm float-right");
        boton.innerHTML = "Ver más";

        cuerpo.appendChild(primero);
        cuerpo.appendChild(municipio);
        cuerpo.appendChild(descripcion);
        cuerpo.appendChild(boton);

        tarjeta.appendChild(a_img);
        tarjeta.appendChild(cuerpo);
        aos.appendChild(tarjeta);
        document.getElementById("listado-contenedor").appendChild(aos);
    }
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
    for (i = 0; i < 5; i++) {
        estrellas.appendChild(stars[i]);
    }
    return estrellas;
}

//Funcion que aplica un filtro nuevo segun lo que se haya seleccionado
function crearFiltro(tipo) {
    var id;
    if (tipo == "filtro") {
        id = document.getElementById("desplegable-filtros").value;
        var opciones = document.getElementsByTagName("option");
        var tit;
        for (i = 0; i < opciones.length; i++) {
            if (opciones[i].value.toLowerCase() == id) {
                tit = opciones[i].getAttribute("title");
                break;
            }
        }
    }

    var tmp = document.getElementById("desplegable-municipios").value;
    if (tmp == "default") {
        if (id == "default") return;
    } else id = tmp;

    if (document.getElementById(id) == null) { //si el boton ya existe no lo crea
        //revisar que no haya mas de 5 filtros aplicados o ya exista el aviso
        if (document.getElementById("selected-filters").childElementCount == 6) {
            if (document.getElementById("alerta-filtros") == null) {
                var alerta = document.createElement("div");
                alerta.setAttribute("id", "alerta-filtros");
                alerta.setAttribute("class", "alert alert-warning alert-dismissible fade show fs-6");
                alerta.setAttribute("role", "alert");
                alerta.innerHTML = "Aviso, el número máximo de filtros aplicados es 5. Por favor, elimine un filtro.";
                var bt = document.createElement("button");
                bt.setAttribute("type", "button");
                bt.setAttribute("class", "btn-close");
                bt.setAttribute("data-bs-dismiss", "alert");
                bt.setAttribute("aria-label", "Close");
                alerta.appendChild(bt);
                document.getElementById("caja-listado").appendChild(alerta);
                //alert("El número máximo de filtros aplicados es 5");
            }
        }
        else {
            var btn = document.createElement("button");
            btn.setAttribute("id", id);
            btn.setAttribute("type", "button");
            btn.setAttribute("class", "boton-filtro filtro-aplicado hvr-back-pulse fs-aplicados");
            if (tipo == "municipio") btn.setAttribute("title", tipo); //municipio
            else btn.setAttribute("title", tit); //filtro (tipusCala, accesMinusvalids...)

            var lb = document.createElement("label");
            lb.innerHTML = capitalize(id);

            var path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            var path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path1.setAttributeNS(null, "d", "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z");
            path2.setAttributeNS(null, "d", "M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z");
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttributeNS(null, "class", "boton-cerrar bi bi-x-circle");
            svg.setAttributeNS(null, "onclick", `eliminarFiltro('${id}')`);
            svg.setAttributeNS(null, "width", "20");
            svg.setAttributeNS(null, "height", "20");
            svg.setAttributeNS(null, "fill", "currentColor");
            svg.setAttributeNS(null, "viewBox", "0 0 16 16");
            svg.appendChild(path1);
            svg.appendChild(path2);
            btn.appendChild(lb);
            btn.appendChild(svg);
            document.getElementById("selected-filters").appendChild(btn);
        }
    }
    if (tipo == "filtro") document.getElementById("desplegable-filtros").value = "default";
    else document.getElementById("desplegable-municipios").value = "default";
}

//Funcion que elimina el filtro seleccionado
function eliminarFiltro(id) {
    var alerta = document.getElementById("alerta-filtros");
    if (alerta != null) {
        alerta.remove();
    }
    var del = document.getElementById(id);
    del.remove();

    filtrar_ordenar();

}

//Funcion que filtra segun los filtros y municipios aplicados
function filtrar_ordenar() {
    var filtros_arr = document.getElementById("selected-filters").getElementsByTagName("button");
    var municipios = [];
    var filtros_v = []; //valor de los filtros (roca)
    var filtros_t = []; //titulo de los filtros (tipusCala)
    var calas = [];
    for (i = 0; i < filtros_arr.length; i++) {
        if (filtros_arr[i].getAttribute("title") == "municipio") municipios.push(capitalize(filtros_arr[i].getAttribute("id")));
        else {
            filtros_v.push(filtros_arr[i].getAttribute("id"));
            filtros_t.push(filtros_arr[i].getAttribute("title"));
        }
    }

    //MUNICIPIOS
    //si no hay filtro de municipios se añaden todas las calas
    if (municipios.length == 0) for (t = 0; t < obj.length; t++) calas.push(t);
    else {
        for (j = 0; j < obj.length; j++) {
            if (tema == "calas" && municipios.includes(obj[j]["geoposicionament1"]["city"])) calas.push(j);
            else if (tema == "actividades" && municipios.includes(obj[j]["tipus"])) calas.push(j);
            else if (tema == "pueblos" && municipios.includes(obj[j]["geoposicionament1"]["city"])) calas.push(j);
        }
    }

    //FILTROS
    if (filtros_v.length != 0) {
        for (j = 0; j < obj.length; j++) {
            var añadir = true; //true si una cala cumple todos los filtros
            for (n = 0; n < filtros_v.length && añadir; n++) {
                //$('#prueba').html(filtros_v[filtros_v.length - 1]);
                if (tema == "pueblos") {
                    if ((filtros_v[n] == "pueblo" && obj[j]["tipus"] != "poble") || (filtros_v[n] != "pueblo" && obj[j]["tipus"] != "llocInteres")) {
                        añadir = false;
                    }
                    //$('#listado-titulo').html(filtros_v.toString());
                }
                else if (filtros_t[n] == "tipusCala") {
                    if (!obj[j]["dadesPropies"]["serveis"]["tipusCala"].toLowerCase().includes(filtros_v[n])) {
                        añadir = false;
                    }
                }
                else if (obj[j]["dadesPropies"]["serveis"][filtros_t[n]] == "No") añadir = false;
            }
            if (!añadir) { //eliminar del listado de calas a mostrar
                if (calas.includes(j)) calas.splice(calas.indexOf(j), 1);
            }
        }
    }
    //$('#prueba').html(calas.toString());

    ordenar(calas);
}

//Funcion que ordena las calas segun las opciones aplicadas
function ordenar(calas_num) {
    var calas_nombre = []; //array con el nombre de cada cala sin ordenar
    var calas_valoracion = []; //array con la valoracion de cada cala sin ordenar
    var calas_valoracion_todas = []; //array con la valoracion de TODAS las calas
    for (i = 0; i < calas_num.length; i++) {
        calas_nombre[i] = obj[calas_num[i]]["nom"];
        if (tema == "calas") calas_valoracion[i] = objComentarios["calas"][calas_num[i]]["valoracionGlobal"];
        else calas_valoracion[i] = obj[calas_num[i]]["puntuacio"];

    }
    var tam = obj.length;
    if (tema == "calas") tam = objComentarios["calas"].length;
    for (l = 0; l < tam; l++) {
        if (tema == "calas") calas_valoracion_todas[l] = objComentarios["calas"][l]["valoracionGlobal"];
        else calas_valoracion_todas[l] = obj[l]["puntuacio"];
    }
    //$('#prueba').html(calas_nombre.toString());

    var txt = document.getElementById("desplegable-ordenacion").value;
    var nombre = true; //true -> ordenar por nombre. false -> ordenar por valoracion
    switch (txt) {
        case "nombre-down":
            calas_nombre.sort();
            break;
        case "nombre-up":
            calas_nombre.sort();
            calas_nombre = calas_nombre.reverse();
            break;
        case "valoracion-down":
            calas_valoracion.sort((a, b) => b - a); // For descending sort
            nombre = false;
            break;
        case "valoracion-up":
            calas_valoracion.sort((a, b) => a - b); // For ascending sort
            nombre = false;
            break;
    }

    var calas = [] //array ordenado de las calas (con indices)
    for (i = 0; i < calas_nombre.length; i++) {
        for (j = 0; j < obj.length; j++) {
            if (nombre && calas_nombre[i] == obj[j]["nom"]) {
                calas.push(j);
                break;
            }
            else if (!nombre && calas_valoracion[i] == calas_valoracion_todas[j] && calas_num.includes(j)) {
                if (!calas.includes(j)) { //mirar si el elemento ya existe (caso de valoraciones iguales)
                    calas.push(j);
                    break;
                }
            }
        }
    }
    //$('#prueba').html(calas.toString());
    if (tema == "calas") escribirTarjetasCala(calas);
    else if (tema == "actividades") escribirTarjetasActividades(calas);
    else if (tema == "pueblos") escribirTarjetasPueblos(calas);
}

//Funcion que cambia el arr[num]ero de objetos que salen por cada fila segun la eleccion del usuario
function objetosPorFila(n) {
    var elementos = document.getElementsByClassName('card-borde');
    if (tema == "actividades") elementos = document.getElementsByClassName('card-borde-verde');

    document.getElementById("objetos-1").classList.remove('btn-seleccionado');
    document.getElementById("objetos-2").classList.remove('btn-seleccionado');
    document.getElementById("objetos-3").classList.remove('btn-seleccionado');
    switch (n) {
        case 1:
            document.getElementById("objetos-1").classList.add('btn-seleccionado');

            // for (i = 0; i < elementos.length; i++) {
            //     elementos[i].classList.remove("card-size-1");
            //     elementos[i].classList.remove("card-size-2");
            //     elementos[i].classList.remove("card-size-3");
            //     elementos[i].classList.add("card-size-1");
            // }
            break;
        case 2:
            document.getElementById("objetos-2").classList.add('btn-seleccionado');

            // for (i = 0; i < elementos.length; i++) {
            //     elementos[i].classList.remove("card-size-1");
            //     elementos[i].classList.remove("card-size-2");
            //     elementos[i].classList.remove("card-size-3");
            //     elementos[i].classList.add("card-size-2");
            // }
            break;
        case 3:
            document.getElementById("objetos-3").classList.add('btn-seleccionado');

            // for (i = 0; i < elementos.length; i++) {
            //     elementos[i].classList.remove("card-size-1");
            //     elementos[i].classList.remove("card-size-2");
            //     elementos[i].classList.remove("card-size-3");
            //     elementos[i].classList.add("card-size-3");
            // }
            break;
    }
    if (typeof obj !== "undefined") filtrar_ordenar();
}

//Funcion que cambia los objetos por fila segun la anchura de la ventana
function cambiarObjetosPorFila() {
    var w = document.documentElement.clientWidth;
    if (w < 700) {
        if (!document.getElementById("objetos-1").classList.contains('btn-seleccionado')) {
            objetosPorFila(1);
        }
        //objetosPorFila(1);
        document.getElementById("objetos-2").classList.add('btn-delete');
        document.getElementById("objetos-3").classList.add('btn-delete');
        document.getElementById("objetos-2").removeAttribute("onclick");
        document.getElementById("objetos-3").removeAttribute("onclick");
    }
    else if (w < 1400) {
        if (!document.getElementById("objetos-1").classList.contains('btn-seleccionado') && !document.getElementById("objetos-2").classList.contains('btn-seleccionado')) {
            objetosPorFila(2);
        }
        document.getElementById("objetos-3").classList.add('btn-delete');
        document.getElementById("objetos-3").removeAttribute("onclick");
        document.getElementById("objetos-2").classList.remove('btn-delete');
        document.getElementById("objetos-2").setAttribute("onclick", "objetosPorFila(2)");
    }
    else {
        document.getElementById("objetos-2").classList.remove('btn-delete');
        document.getElementById("objetos-3").classList.remove('btn-delete');
        document.getElementById("objetos-2").setAttribute("onclick", "objetosPorFila(2)");
        document.getElementById("objetos-3").setAttribute("onclick", "objetosPorFila(3)");
    }
}
function resizeListado() {
    window.addEventListener("resize", cambiarObjetosPorFila);
}

//Funcion que pone la primera letra en mayusculas
function capitalize(string) {
    return string.replace(/(^|\s)\S/g, l => l.toUpperCase());
}


//ACTIVIDADES
function escribirListadoActividades() {
    AOS.init({
        once: true,
        easing: "ease-in-out"
    });
    //Colores y texto
    $('#title-listado').html("Calas de Mallorca - Actividades");
    document.getElementById("nav-actividades").setAttribute("class", "nav-link nav-extra active");
    document.getElementById("nav-actividades").setAttribute("aria-current", "page");
    document.getElementById("nav-actividades").setAttribute("href", "#");
    document.getElementById("caja-listado").setAttribute("class", "caja fondo-verde mg-top-sm font-poppins");
    document.getElementById("bg-listado").setAttribute("class", "bg-listado-verde");
    document.getElementById("label-filtros").setAttribute("class", "caja-filtrosObjetos fondo-verdeFuerte");
    document.getElementById("label-obj-fila").setAttribute("class", "caja-filtrosObjetos fondo-verdeFuerte");
    document.getElementById("label-obj-fila").innerHTML = document.getElementById("label-obj-fila").innerHTML.replace("Calas", "Actividades");
    document.getElementById("label-municipios").innerHTML = "Tipos:";

    //Introduccion
    document.getElementById("listado-titulo").innerHTML = "Listado de Actividades";
    document.getElementById("listado-descripcion").innerHTML = "A continuación se presenta el listado de todas las actividades disponibles. Se puede filtrar por tipo de actividad y el número máximo de tipos para filtrar es 5. En el caso de elegir más de un tipo se mostrarán todas las actividades que pertenezcan a alguno de los tipos seleccionados. También es posible ordenar las actividades ya filtradas por Nombre y Valoración de los usuarios.<br>Los datos de las actividades están sacados de: <a href='https://sweetmallorca.netlify.app/' target='_blank'>Sweet Mallorca</a>";

    //Tipos
    const container = document.getElementById("conjunto-filtros");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
    container.removeAttribute("class", "mg-right-left-sm");
    var tipos = [];
    for (i = 0; i < obj.length; i++) {
        var c = obj[i]["tipus"];
        if (tipos.indexOf(c) == -1) tipos.push(c);
    }
    tipos = tipos.sort();
    for (i = 0; i < tipos.length; i++) {
        var m = document.createElement("option");
        m.setAttribute("value", tipos[i].toLowerCase());
        m.innerHTML = tipos[i];
        document.getElementById("desplegable-municipios").appendChild(m);
    }

    //Mostrar tarjetas
    filtrar_ordenar();
}

//Funcion que crea todas las tarjetas de actividad segun un array de numeros de cala
function escribirTarjetasActividades(arr) {
    const container = document.getElementById("listado-contenedor");
    //eliminar todas las tarjetas existentes (asi se repite la animacion)
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    //actualizar numero de resultados
    if (arr.length == 1) $('#num-resultados').html("<strong>" + arr.length + " Resultado</strong>");
    else $('#num-resultados').html("<strong>" + arr.length + " Resultados</strong>");

    var infoAct = []; //web semantica
    if (arr.length == 0) { //si no hay que crear ninguna tarjeta de cala
        if (document.getElementById("alerta-no-calas") == null) {
            var alerta = document.createElement("div");
            alerta.setAttribute("id", "alerta-no-calas");
            alerta.setAttribute("class", "alert alert-info alert-dismissible fade show fs-6 mx-auto mg-top-md");
            alerta.setAttribute("role", "alert");
            alerta.innerHTML = "No hay actividades que cumplan los filtros seleccionados. Por favor, considera cambiar algún filtro.";
            var bt = document.createElement("button");
            bt.setAttribute("type", "button");
            bt.setAttribute("class", "btn-close");
            bt.setAttribute("data-bs-dismiss", "alert");
            bt.setAttribute("aria-label", "Close");
            alerta.appendChild(bt);
            document.getElementById("listado-contenedor").appendChild(alerta);
        }
    }
    else for (num = 0; num < arr.length; num++) {
        infoAct[num] = generarJsonLDActividad(obj[arr[num]], arr[num]);

        tarjeta = document.createElement("div");
        //añadir clases y definir las calas/fila seleccionadas
        if (document.getElementById("objetos-1").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-1 card-borde-verde mg-bt-md card-zoom");
        } else if (document.getElementById("objetos-2").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-2 card-borde-verde mg-bt-md card-zoom");
        } else if (document.getElementById("objetos-3").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-3 card-borde-verde mg-bt-md card-zoom");
        }

        aos = document.createElement("div");
        aos.setAttribute("data-aos", "fade-up");
        aos.setAttribute("data-aos-delay", "0");
        aos.setAttribute("data-aos-duration", "800");

        a_img = document.createElement("a");
        a_img.setAttribute("href", "cala.html?actividades&" + arr[num]);
        a_img.setAttribute("class", "a-16-9");
        img = document.createElement("img");
        img.setAttribute("src", obj[arr[num]]["imatges"][0]);
        img.setAttribute("class", "img-16-9 card-img-top");
        img.setAttribute("alt", "...");
        a_img.appendChild(img);

        cuerpo = document.createElement("div");
        cuerpo.setAttribute("class", "card-body");

        primero = document.createElement("div");
        primero.setAttribute("class", "d-flex justify-content-between");
        titulo = document.createElement("h5");
        titulo.setAttribute("class", "card-title fs-5-card-title");
        titulo.innerHTML = obj[arr[num]]["nom"];
        estrellas = pintarEstrellas(obj[arr[num]]["puntuacio"]);
        primero.appendChild(titulo);
        primero.appendChild(estrellas);

        tipo = document.createElement("div");
        tipo.setAttribute("class", "mg-top-sm-neg mg-bt-xsm fs-5-card-text");
        tipo.innerHTML = "Tipo: " + obj[arr[num]]["tipus"];

        descripcion = document.createElement("p");
        descripcion.setAttribute("class", "card-text fs-5-card-text");
        var desc = obj[arr[num]]["descripcio"];
        if (desc.length < 160) {
            descripcion.innerHTML = desc;
        }
        else descripcion.innerHTML = desc.substr(0, 160).replace("<br><br>", "") + " (...)";

        boton = document.createElement("a");
        boton.setAttribute("href", "cala.html?actividades&" + arr[num]);
        boton.setAttribute("class", "btn btn-primary btn-sm float-right");
        boton.innerHTML = "Ver más";

        cuerpo.appendChild(primero);
        cuerpo.appendChild(tipo);
        cuerpo.appendChild(descripcion);
        cuerpo.appendChild(boton);

        tarjeta.appendChild(a_img);
        tarjeta.appendChild(cuerpo);
        aos.appendChild(tarjeta);
        document.getElementById("listado-contenedor").appendChild(aos);
    }
    cargarJsonLD(infoAct); //cargar web semantica
}

// //Funcion que dibuja las estrellas segun la valoracion de cada cala
// function pintarEstrellas(n) {
//     estrellas = document.createElement("div");
//     estrellas.setAttribute("class", "estrellas mg-top-stars");

//     stars = [];
//     var j = 0;
//     for (j; j < Math.round(n); j++) {
//         stars[j] = document.createElement("span");
//         stars[j].setAttribute("class", "mg-stars fs-5-card-star fa fa-star checked"); //tamaño estrellas en moviles en horizontal
//     }
//     for (j; j < 5; j++) {
//         stars[j] = document.createElement("span");
//         stars[j].setAttribute("class", "mg-stars fs-5-card-star fa fa-star");
//     }
//     for (i = 0; i < 5; i++) {
//         estrellas.appendChild(stars[i]);
//     }
//     return estrellas;
// }


//PUEBLOS
function escribirListadoPueblos() {
    AOS.init({
        once: true,
        easing: "ease-in-out"
    });
    //Colores y texto
    $('#title-listado').html("Calas de Mallorca - Pueblos");
    document.getElementById("nav-pueblos").setAttribute("class", "nav-link nav-extra active");
    document.getElementById("nav-pueblos").setAttribute("aria-current", "page");
    document.getElementById("nav-pueblos").setAttribute("href", "#");
    document.getElementById("caja-listado").setAttribute("class", "caja fondo-verde mg-top-sm font-poppins");
    document.getElementById("bg-listado").setAttribute("class", "bg-listado-verde");
    document.getElementById("label-filtros").setAttribute("class", "caja-filtrosObjetos fondo-verdeFuerte");
    document.getElementById("label-obj-fila").setAttribute("class", "caja-filtrosObjetos fondo-verdeFuerte");
    document.getElementById("label-obj-fila").innerHTML = document.getElementById("label-obj-fila").innerHTML.replace("Calas", "Pueblos");
    document.getElementById("label-municipios").innerHTML = "Pueblos:";

    //Introduccion
    document.getElementById("listado-titulo").innerHTML = "Listado de Pueblos";
    document.getElementById("listado-descripcion").innerHTML = "A continuación se presenta el listado de todos los pueblos y sus lugares de interés. Los filtros son eliminatorios (si se seleccionan 2 se muestran los pueblos que cumplen los dos filtros, cosa que nunca ocurre ya que se trata de un pueblo o de un lugar de interés), pero los pueblos no son eliminatorios, de manera que se puede seleccionar más de un pueblo a la vez. El número máximo de filtros aplicados es 5. También es posible ordenar los pueblos ya filtrados por Nombre y Valoración de los usuarios.<br>Los datos de los pueblos y lugares de interés están sacados de: <a href='https://beyls.netlify.app/' target='_blank'>Pobles de Mallorca</a>";

    //Filtros
    var filtros = ["Pueblo", "Lugar de interés"];
    for (i = 0; i < filtros.length; i++) {
        var m = document.createElement("option");
        m.setAttribute("value", filtros[i].toLowerCase());
        m.innerHTML = filtros[i];
        document.getElementById("desplegable-filtros").appendChild(m);
    }

    //Pueblos
    var pueblos = [];
    for (i = 0; i < obj.length; i++) {
        var c = obj[i]["geoposicionament1"]["city"];
        if (pueblos.indexOf(c) == -1) pueblos.push(c);
    }
    pueblos = pueblos.sort();
    for (i = 0; i < pueblos.length; i++) {
        var m = document.createElement("option");
        m.setAttribute("value", pueblos[i].toLowerCase());
        m.innerHTML = pueblos[i];
        document.getElementById("desplegable-municipios").appendChild(m);
    }

    //Mostrar tarjetas
    filtrar_ordenar();
}

//Funcion que crea todas las tarjetas de pueblo segun un array de numeros de cala
function escribirTarjetasPueblos(arr) {
    const container = document.getElementById("listado-contenedor");
    //eliminar todas las tarjetas existentes (asi se repite la animacion)
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    //actualizar numero de resultados
    if (arr.length == 1) $('#num-resultados').html("<strong>" + arr.length + " Resultado</strong>");
    else $('#num-resultados').html("<strong>" + arr.length + " Resultados</strong>");

    var infoPueb = []; //web semantica
    if (arr.length == 0) { //si no hay que crear ninguna tarjeta de cala
        if (document.getElementById("alerta-no-calas") == null) {
            var alerta = document.createElement("div");
            alerta.setAttribute("id", "alerta-no-calas");
            alerta.setAttribute("class", "alert alert-info alert-dismissible fade show fs-6 mx-auto mg-top-md");
            alerta.setAttribute("role", "alert");
            alerta.innerHTML = "No hay pueblos/lugares de interés que cumplan los filtros seleccionados. Por favor, considera cambiar algún filtro.";
            var bt = document.createElement("button");
            bt.setAttribute("type", "button");
            bt.setAttribute("class", "btn-close");
            bt.setAttribute("data-bs-dismiss", "alert");
            bt.setAttribute("aria-label", "Close");
            alerta.appendChild(bt);
            document.getElementById("listado-contenedor").appendChild(alerta);
        }
    }
    else for (num = 0; num < arr.length; num++) {
        infoPueb[num] = generarJsonLDPueblo(obj[arr[num]], arr[num]);

        tarjeta = document.createElement("div");
        //añadir clases y definir las calas/fila seleccionadas
        if (document.getElementById("objetos-1").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-1 card-borde-verde mg-bt-md card-zoom");
        } else if (document.getElementById("objetos-2").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-2 card-borde-verde mg-bt-md card-zoom");
        } else if (document.getElementById("objetos-3").classList.contains("btn-seleccionado")) {
            tarjeta.setAttribute("class", "card card-size-3 card-borde-verde mg-bt-md card-zoom");
        }

        aos = document.createElement("div");
        aos.setAttribute("data-aos", "fade-up");
        aos.setAttribute("data-aos-delay", "0");
        aos.setAttribute("data-aos-duration", "800");

        a_img = document.createElement("a");
        if (obj[arr[num]]["tipus"] == "poble") a_img.setAttribute("href", "cala.html?pueblos&pueblo&" + arr[num]);
        else a_img.setAttribute("href", "cala.html?pueblos&lugarInteres&" + arr[num]);
        a_img.setAttribute("class", "a-16-9");
        img = document.createElement("img");
        img.setAttribute("src", obj[arr[num]]["imatges"][0]);
        img.setAttribute("class", "img-16-9 card-img-top");
        img.setAttribute("alt", "...");
        a_img.appendChild(img);

        cuerpo = document.createElement("div");
        cuerpo.setAttribute("class", "card-body");

        primero = document.createElement("div");
        primero.setAttribute("class", "d-flex justify-content-between");
        titulo = document.createElement("h5");
        titulo.setAttribute("class", "card-title fs-5-card-title");
        titulo.innerHTML = obj[arr[num]]["nom"];
        estrellas = pintarEstrellas(obj[arr[num]]["puntuacio"]);
        primero.appendChild(titulo);
        primero.appendChild(estrellas);

        tipo = document.createElement("div");
        tipo.setAttribute("class", "mg-top-sm-neg mg-bt-xsm fs-5-card-text");
        if (obj[arr[num]]["tipus"] == "poble") {
            tipo.innerHTML = "Tipo: Pueblo - " + obj[arr[num]]["geoposicionament1"]["city"];
        }
        else tipo.innerHTML = "Tipo: Lugar de interés - " + obj[arr[num]]["geoposicionament1"]["city"];

        descripcion = document.createElement("p");
        descripcion.setAttribute("class", "card-text fs-5-card-text");
        var desc = obj[arr[num]]["dadesPropies"]["historia"];
        if (obj[arr[num]]["tipus"] == "poble") {
            desc = obj[arr[num]]["dadesPropies"]["introduccio"];
        }
        if (desc.length < 160) {
            descripcion.innerHTML = desc;
        }
        else descripcion.innerHTML = desc.substr(0, 160).replace("</p><p>", "") + " (...)";

        boton = document.createElement("a");
        if (obj[arr[num]]["tipus"] == "poble") boton.setAttribute("href", "cala.html?pueblos&pueblo&" + arr[num]);
        else boton.setAttribute("href", "cala.html?pueblos&lugarInteres&" + arr[num]);
        boton.setAttribute("class", "btn btn-primary btn-sm float-right");
        boton.innerHTML = "Ver más";

        cuerpo.appendChild(primero);
        cuerpo.appendChild(tipo);
        cuerpo.appendChild(descripcion);
        cuerpo.appendChild(boton);

        tarjeta.appendChild(a_img);
        tarjeta.appendChild(cuerpo);
        aos.appendChild(tarjeta);
        document.getElementById("listado-contenedor").appendChild(aos);
    }
    cargarJsonLD(infoPueb);
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
            "bestRating": "5",
            "worstRating": "0",
            "ratingValue": objComentarios["calas"][numero]["valoracionGlobal"],
            "reviewCount": likes
        },
        "description": cala["descripcio"].substr(0, 170).replace("<br><br>", "") + " (...)",
        "photo": cala["imatges"][0],
        "url": url
    }
    return info;
}

function generarJsonLDActividad(act, numero) {
    likes = act["likes"]
    if (likes == 0) likes = 1;
    var url = "calasdemallorca.netlify.app/cala.html?actividades&" + numero;
    let info = {
        "@context": "http://www.schema.org",
        "@type": "Product",
        "name": act["nom"],
        "aggregateRating": {
            "@type": "AggregateRating",
            "itemReviewed": "Thing",
            "bestRating": "5",
            "worstRating": "0",
            "ratingValue": act["puntuacio"],
            "reviewCount": likes
        },
        "description": act["descripcio"].substr(0, 170).replace("<br><br>", "") + " (...)",
        "image": act["imatges"][0],
        "category": act["tipus"],
        "url": url
    }
    return info;
}

function generarJsonLDPueblo(pueb, numero) {
    likes = pueb["likes"]
    if (likes == 0) likes = 1;
    var url = "calasdemallorca.netlify.app/cala.html?pueblos&lugarInteres&" + numero;
    if (pueb["tipus"] == "poble") url = "calasdemallorca.netlify.app/cala.html?pueblos&pueblo&" + numero;
    let info = {
        "@context": "http://www.schema.org",
        "@type": "Place",
        "name": pueb["nom"],
        "aggregateRating": {
            "@type": "AggregateRating",
            "itemReviewed": "Thing",
            "bestRating": "5",
            "worstRating": "0",
            "ratingValue": pueb["puntuacio"],
            "reviewCount": likes
        },
        "description": pueb["descripcio"].substr(0, 170).replace("<br><br>", "") + " (...)",
        "image": pueb["imatges"][0],
        "url": url
    }
    return info;
}

function cargarJsonLD(info) {
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(info);
    document.head.appendChild(script);
}