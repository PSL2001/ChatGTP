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
                } else {
                    // Llamamos a la funcion para mostrar el error
                    mostrarError('No se ha podido procesar la respuesta');
                }
            })
            .catch(err => {
                // Llamamos a la funcion para mostrar el error
                mostrarError('No se ha podido enviar el mensaje');
            });         
    }
    // Desbloqueamos el input y el boton
    disableUserInput(false);
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