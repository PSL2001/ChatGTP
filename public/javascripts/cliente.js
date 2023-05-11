/**
 * Archivo para el cliente
 * maneja las peticiones al servidor
 * y la manipulacion del DOM
 * Muestra los mensajes que vengan tanto del usuario principal como el de la API
 */





// Variables globales
var button = document.getElementById('btnEnviar');
var input = document.getElementById('msg');
var inputError = document.getElementById('api-message');

// Ponemos el foco en el input
input.focus();

// Ponemos listener
button.addEventListener('click', enviarMensaje);
// Ponemos listener al input para que al pulsar enter se envie el mensaje
input.addEventListener('keyup', function (event) {
    // Comprobamos que se ha pulsado enter
    if (event.key === 'Enter' || event.key === 'NumpadEnter') {
        // Cancelamos el evento por defecto
        event.preventDefault();
        // Enviamos el mensaje
        enviarMensaje();
        // Ponemos el foco en el input
        input.focus();
    }
});

// Funcion para enviar el mensaje
async function enviarMensaje() {
    //Bloqueamos el input y el boton para que no se envien mensajes mientras se procesa el anterior
    disableUserInput(true);
    //Obtenemos el mensaje
    let msg = input.value;
    // Comprobamos que no este vacio
    if (msg != '') {
        // Creamos el elemento para mostrar el mensaje
        crearSpan("<b>Humano: </b>" + msg);
        // Creamos el objeto para enviarlo al servidor
        let data = {
            msg: msg
        }
        // Si el mensaje contiene palabras como imagen, foto, dibujo, etc. lo enviamos al servidor para que nos envie una imagen
        if (msg.includes('imagen') || msg.includes('foto') || msg.includes('dibujo') || msg.includes('dibujar')) {
            enviarImagen(data);
        } else {
            // En otro caso, asumimos que es texto
            enviarTexto(data);
        }
    }
}

// Funcion para crear un span con el mensaje
function crearSpan(msg) {
    // Creamos el elemento
    let span = document.createElement('span');
    // Le ponemos el texto
    span.innerHTML = msg;
    // Le ponemos la clase para que se vea bien
    span.id = 'user-message'
    // Lo añadimos al div de mensajes
    document.getElementById('form').before(span);
    // Creamos un salto de linea
    let br = document.createElement('br');
    // Lo añadimos al div de mensajes
    document.getElementById('form').before(br);
    // Ponemos el scroll abajo del todo
    document.getElementById('form').scrollTop = document.getElementById('form').scrollHeight;
    //Limpiamos el input
    input.value = '';
}

// Funcion para crear una imagen
function crearImagen(images) {
    // No sabemos cuantas imagenes nos va a devolver la API, por lo que vamos a mappear el array de urls
    // y vamos a crear una imagen por cada url
    images.map(image => {
        // Creamos un elemento img
        let img = document.createElement('img');
        // Le ponemos el src
        img.src = image.url;
        // Añadimos la imagen al contenedor
        document.getElementById('form').before(img);
        // Creamos un salto de linea
        let br = document.createElement('br');
        // Lo añadimos al div de mensajes
        document.getElementById('form').before(br);
        // Ponemos el scroll abajo del todo
        document.getElementById('form').scrollTop = document.getElementById('form').scrollHeight;
    });
    //Limpiamos el input
    input.value = '';
}


// Funcion para enviar una imagen
function enviarImagen(data) {
    /**
    * Antes de poder mandar la peticion a la API de OpenAI, necesitamos 3 parametros:
    * 1. La peticion de imagen (que tenemos en la variable request)
    * 2. La cantidad de imagenes que queremos que nos devuelva la API (el cual es opcional, pero el usuario podría pedir mas de 1 que es el valor por defecto)
    *    La cantidad maxima de imagenes que podemos pedir es 10.
    * 3. El tamaño de la imagen que queremos. Este campo tambien es opcional, pero dependiendo de como pida la imagen el usuario. puede ser pequeño (256), mediano (512)
    *  o grande (1024). Por defecto, la API devuelve imagenes de tamaño grande.
    * 
    * Toda esta informacion debería estar en la request del usuario, pero por si acaso, vamos a poner valores por defecto.
    */
    // Primero comprobamos en data.msg si el usuario ha pedido mas de una imagen
    // Nos puede pedir mas de una imagen si ha puesto algo como "quiero 3 imagenes de un perro". Esto tambien se aplica para la palabra "tres" y asi con todos los numeros
    // hasta 10. Por eso, vamos a comprobar si el usuario ha puesto un numero del 1 al 10
    // Para ello, vamos a crear una funcion que compruebe si el usuario ha puesto un numero
    // y si es asi, lo devuelve
    let num = getNumber(data.msg);
    // Ahora debemos comprobar si el usuario ha pedido un tamaño de imagen
    // Para ello, vamos a crear una funcion que compruebe si el usuario ha puesto un tamaño
    // y si es asi, lo devuelve
    let size = getSize(data.msg);
    // Como la misma peticion tiene que imagen se pide podemos usar el mismo texto. Montamos la peticion, siempre en cuenta de que ni num ni size sean undefined
    let request = {
        "prompt": data.msg,
        "n": num != undefined ? parseInt(num) : 1,
        "size": size != undefined ? size + "x" + size : 512 + "x" + 512
    }
    console.log(request);
    // Llamamos al metodo del servidor para enviar el mensaje
    let res = new Promise((resolve, reject) => {
        fetch('/send-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request),
        })
            .then(res => resolve(res))
            .catch(err => reject(err));
    });
    // Esperamos a que se resuelva la promesa
    res.then(res => res.json())
        .then(data => {
            console.log(data);
            // Comprobamos que se ha recibido la respuesta
            if (data) {
                // Creamos la imagen
                crearImagen(data);
                // Desbloqueamos el input y el boton
                disableUserInput(false);
            } else {
                // Llamamos a la funcion para mostrar el error
                mostrarError('No se ha podido procesar la respuesta');
                // Desbloqueamos el input y el boton
                disableUserInput(false);
            }
        }).catch(err => {
            // Llamamos a la funcion para mostrar el error
            mostrarError('No se ha podido enviar el mensaje ' + err);
            // Desbloqueamos el input y el boton
            disableUserInput(false);
        });
}

// Funcion para enviar un mensaje de texto
async function enviarTexto(data) {
    // Llamamos al metodo del servidor para enviar el mensaje
    let res = await fetch('/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    }).then(res => res.json())
        .then(data => {
            console.log(data);
            // Comprobamos que se ha recibido la respuesta
            if (data) {
                crearSpan("<b>IA: </b>" + data);
                // Desbloqueamos el input y el boton
                disableUserInput(false);
            } else {
                // Llamamos a la funcion para mostrar el error
                mostrarError('No se ha podido procesar la respuesta');
                // Desbloqueamos el input y el boton
                disableUserInput(false);
            }
        })
        .catch(err => {
            // Llamamos a la funcion para mostrar el error
            mostrarError('No se ha podido enviar el mensaje ' + err);
            // Desbloqueamos el input y el boton
            disableUserInput(false);
        });
}

// Funcion para bloquear el input y el boton o desbloquearlos
function disableUserInput(disable) {
    // Comprobamos si hay que bloquear o desbloquear
    if (disable) {
        // Bloqueamos el input
        input.disabled = true;
        // Bloqueamos el boton
        button.disabled = true;
    } else {
        // Desbloqueamos el input
        input.disabled = false;
        // Desbloqueamos el boton
        button.disabled = false;
    }
}

// Funcion para mostrar un error en el input de errores
function mostrarError(msg) {
    // Ponemos el mensaje
    inputError.value = msg;
    // Ponemos el color en rojo
    inputError.style.color = 'red';
}

// Funcion para detectar si el usuario ha puesto un numero en el mensaje
function getNumber(msg) {
    // Primero creamos un array que tenga los numeros del 1 al 10, tanto en numero como en letras, teniendo en cuenta además que el usuario puede poner "una", "un" o "unos"
    // Primero revisamos si el usuario ha escrito un numero tanto en letras como en numero o si ha escrito "unos" o "unas"
    if (msg.includes('unos') || msg.includes('unas') || msg.includes('los') || msg.includes('las')) {
        // Si ha escrito "unos" o "unas", devolvemos un aleatorio entre 2 y 10
        return Math.floor(Math.random() * (10 - 2 + 1)) + 2;
    }
    // Creamos un array con los numeros del 1 al 10
    let numeros = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    //Creamos otro array para las palabras como "un" o "una"
    let palabrasNum = ['un', 'una', 'el', 'la'];
    // Y otro array para los numeros en version de texto
    let numerosTexto = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
    // Creamos un array con las palabras del mensaje
    let palabras = msg.split(' ');
    // Creamos una variable para guardar el numero
    let num = compruebaNumero(palabras, numeros, palabrasNum, numerosTexto);
    // Devolvemos el numero
    return num;
}

// Funcion para detectar si el usuario ha puesto un tamaño en el mensaje
function getSize(msg) {
    // Definimos un valor por defecto para el tamaño
    let size = 512;

    // Creamos un array con las palabras del mensaje
    let palabras = msg.split(' ');

    // Solo es posible que la imagen sea de 3 tamaños: 256, 512 o 1024 o en otras palabras, pequeño, mediano o grande
    // Creamos un array con los tamaños
    let tamanos = ['pequeño', 'mediano', 'medio', 'grande', 'pequeña', 'mediana', 'pequeñas', 'medianas', 'grandes', 'pequeños', 'medianos'];

    // Reducimos entre los 2 arrays el tamaño de la imagen
    size = palabras.reduce((acc, palabra) => {
        // Comprobamos si la palabra es igual a alguna palabra del array de tamanos
        if (tamanos.includes(palabra)) {
            // Si es igual, guardamos el tamaño, teniendo en cuenta que el tamaño pequeño es 256, el mediano 512 y el grande 1024 (grandes por el momento no se usa)
            switch (palabra) {
                case 'pequeño': case 'pequeña': case 'pequeños': case 'pequeñas':
                    acc = 256;
                    break;
                case 'mediano': case 'mediana': case 'medianos': case 'medianas': case 'medio':
                    acc = 512;
                    break;
                case 'grande': case 'grandes':
                    acc = 512;
                    break;
            }
        }
        // Devolvemos el tamaño
        return acc;
    }, size); // Iniciamos el reduce con el valor por defecto del tamaño

    // Devolvemos el tamaño
    return size;
}

// Funcion para comprobar si el usuario ha puesto un numero en el mensaje
function compruebaNumero(palabras, numeros, palabrasNum, numerosTexto) {
    // Creamos una variable para guardar el numero
    // Primero comprobamos si el usuario ha escrito 'un' o 'una'
    // Buscamos reducir entre los 4 arrays cuantas imagenes quiere el usuario
    let num = palabras.reduce((acc, palabra, index) => {
        // Si el acumulador es distinto de 0, es que ya se ha encontrado el numero, por lo que devolvemos el acumulador
        if (acc !== 0) {
            return acc;
        }
        // Comprobamos si la palabra es igual a alguna palabra del array de palabrasNum
        if (palabrasNum.includes(palabra)) {
            // Si es igual, guardamos un 1, debido a que este array contiene sinonimos para 'uno' o 'una'
            return 1;
        }
        // Comprobamos si la palabra es igual a alguna palabra del array de numerosTexto
        if (numerosTexto.includes(palabra)) {
            // Como tecnicamente no son enteros podemos devolver el indice de la palabra en el array + 1
            return numerosTexto.indexOf(palabra) + 1;
        }
        // Comprobamos si la palabra es igual a alguna palabra del array de numeros
        if (numeros.includes(palabra)) {
            // Si es igual, devolvemos el numero haciendo un parse a entero dado que javascript lo toma como string
            return parseInt(palabra);
        }
        return acc; // Importante devolver el acumulador actual si no se encuentra el valor deseado
    }, 0);

    return num;
}


