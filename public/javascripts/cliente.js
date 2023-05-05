/**
 * Archivo para el cliente
 * maneja las peticiones al servidor
 * y la manipulacion del DOM
 * Muestra los mensajes que vengan tanto del usuario principal como el de la API
 */

// Variables globales
var button = document.getElementById('btnEnviar');
var input = document.getElementById('msg');

// Ponemos listener
button.addEventListener('click', enviarMensaje);

// Funcion para enviar el mensaje
function enviarMensaje() {
    //Obtenemos el mensaje
    let msg = input.value;
    // Comprobamos que no este vacio
    if (msg != '') {
        // Creamos el objeto para enviarlo al servidor
        let data = {
            msg: msg
        }
        // Llamamos a la funcion del servidor para enviar el mensaje y recibir la respuesta
        socket.emit('msg', data, function (res) {
            
        });
    }
}