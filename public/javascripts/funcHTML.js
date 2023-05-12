/**
 * Un archivo para funciones de HTML genericas. Contiene funciones para crear elementos HTML o para sortear elementos HTML
 */

/**
 * Funcion para crear un span con el mensaje del usuario o del bot y añadirlo al div de formulario
 * @param {string} msg  
 */
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
}

/**
 * Funcion para crear una etiqueta img con la imagen
 * @param {string[]} images Array de urls de imagenes
 * @returns Nada, pero crea una serie de imagenes en el DOM, dependiendo de la cantidad que haya pedido el usuario
 */
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
}

/**
 * Funcion para desactivar el input y el boton o activarlos
 * @param {boolean} disable 
 * @param {HTMLInputElement} input
 * @param {HTMLButtonElement} button
 */
function disableUserInput(disable, input, button) {
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

/**
 * Función para mostrar un error de la API en inputError
 * @param {string} msg
 * @param {*} inputError
 */
function mostrarError(msg, inputError) {
    // Ponemos el mensaje
    inputError.value = msg;
    // Ponemos el color en rojo
    inputError.style.color = 'red';
}

/**
 * Función para limpiar ambos inputs
 * @param {HTMLInputElement} input
 * @param {HTMLInputElement} inputError
 */
function limpiarInputs(input, inputError) {
    // Ponemos el mensaje
    input.value = '';
    // Ponemos el color en rojo
    inputError.value = '';
}

/**
 * Funcion para crear un snippet de codigo
 * @param {string} code
 */
function crearCodeSnippet(code) {
    //Quitamos el . que genera el mensaje
    code = code.replace('.', '');
   // Creamos el div principal
   let div = document.createElement('div');
   // Le ponemos la clase
   div.className = 'code-display';
   // Creamos el div para mostrar "botones"
   let divButtons = document.createElement('div');
    // Le ponemos la clase
    divButtons.className = 'buttons';
    // Creamos los div "botones"
    let divButton1 = document.createElement('div');
    let divButton2 = document.createElement('div');
    let divButton3 = document.createElement('div');
    // Le ponemos la clase
    divButton1.className = 'button';
    divButton2.className = 'button';
    divButton3.className = 'button';
    // Añadimos las clases de cada boton
    divButton1.classList.add('first');
    divButton2.classList.add('second');
    divButton3.classList.add('third');
    // Insertamos los div "botones" en el div de botones
    divButtons.appendChild(divButton1);
    divButtons.appendChild(divButton2);
    divButtons.appendChild(divButton3);
    // Creamos el div para mostrar el codigo
    let divCode = document.createElement('div');
    // Le ponemos la clase
    divCode.className = 'code-output';
    // Creamos el elemento pre
    let pre = document.createElement('pre');
    // Creamos el elemento code
    let codeElement = document.createElement('code');
    // Le ponemos el texto
    codeElement.innerHTML = code;
    // Añadimos el elemento code al elemento pre
    pre.appendChild(codeElement);
    // Añadimos el elemento pre al div de codigo
    divCode.appendChild(pre);
    // Añadimos el div de botones al div principal
    div.appendChild(divButtons);
    // Añadimos el div de codigo al div principal
    div.appendChild(divCode);
    // Añadimos el div principal al div de mensajes
    document.getElementById('form').before(div);
    // Creamos un salto de linea
    let br = document.createElement('br');
    // Lo añadimos al div de mensajes
    document.getElementById('form').before(br);
    // Ponemos el scroll abajo del todo
    document.getElementById('form').scrollTop = document.getElementById('form').scrollHeight;
}