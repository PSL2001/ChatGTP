/**
 * Un archivo para funciones de HTML genericas. Contiene funciones para crear elementos HTML o para sortear elementos HTML
 */

/**
 * Funcion para crear un span con el mensaje del usuario o del bot y añadirlo al div de formulario
 * @param {string} msg  
 */
function crearSpan(msg) {
  // Creamos el elemento span
  const span = document.createElement('span');
  // Asignamos el texto al contenido del span
  span.innerHTML = msg;
  // Le asignamos el id para los estilos específicos
  span.id = 'user-message';
  // Creamos un boton, el cual tiene un icono de escucha y un evento para reproducir el mensaje por audio
  const button = document.createElement('button');
  button.innerHTML = '<i class="fas fa-volume-up"></i>'
  // Añadimos una clase al botón para los estilos específicos
  button.classList.add('btnAudio');
  button.addEventListener('click', textToSpeech);
  // Añadimos un espacio de separación
  const space = document.createTextNode(' ');
  // Lo añadimos entre el texto y el botón
  span.appendChild(space);
  // Añadimos el botón al span
  span.appendChild(button);
  // Lo añadimos al div de mensajes
  document.getElementById('form').before(span);
  // Creamos un salto de línea
  const br = document.createElement('br');
  // Lo añadimos al div de mensajes
  document.getElementById('form').before(br);
  // Desplazamos el scroll hasta abajo
  document.getElementById('form').scrollTop = document.getElementById('form').scrollHeight;
}

/**
 * Funcion para cojer el texto del span y reproducirlo por audio
 * @param {Event} event Evento del click
 * @returns {void} reproduce el texto del span por audio
 */
function textToSpeech(event) {
  // Comprobamos si el navegador soporta la API de speechSynthesis
  if (!checkSpeechSynthesisSupport()) {
    // Si no la soporta, mostramos un mensaje de error
    alert('Tu navegador no soporta la API de speechSynthesis');
    return;
  }
  // Cojemos el texto del span
  const text = devolverTexto(event.target.parentElement);
  // Creamos un objeto de speechSynthesis
  const speech = new SpeechSynthesisUtterance();
  // Le asignamos el texto
  speech.text = text;
  // Lo reproducimos
  window.speechSynthesis.speak(speech);
}

/**
 * Funcion para devolver el texto para el audio
 * @param {HTMLElement} element Elemento del DOM
 * @returns {string} Texto del elemento
 */
function devolverTexto(element) {
  // Comprobamos si el elemento ya lleva texto
  if (element.innerText) {
    // Si lo lleva, lo devolvemos
    return element.innerText;
  } else {
    // Si no, llamamos a la función con el padre
    return devolverTexto(element.parentElement);
  }
}

/**
 * Funcion para crear una etiqueta img con la imagen
 * @param {string[]} images Array de urls de imagenes
 * @returns Nada, pero crea una serie de imagenes en el DOM, dependiendo de la cantidad que haya pedido el usuario
 */
function crearImagen(images) {
  images.forEach(image => {
    // Llamamos a la función para crear los elementos
    const elements = crearElementosImagen(image);

    // Añadimos los elementos al fragmento de mensajes
    document.getElementById('form').before(...elements);
  });

  // Actualizamos el scroll una vez que se hayan agregado todas las imágenes
  document.getElementById('form').scrollTop = document.getElementById('form').scrollHeight;
}

/**
 * Funcion para crear una etiqueta span con una imagen incluida en esta
 * @param {url} image 
 * @return {Array<{span: string, br: string}>} Array con el span y el salto de linea
 Array con el span y el salto de linea
 */
function crearElementosImagen(image) {
  // Creamos el elemento span
  const span = document.createElement('span');
  span.id = 'user-message';

  // Creamos el elemento img y le asignamos el src y alt
  const img = document.createElement('img');
  img.src = image.url;
  img.alt = image.altText || 'Imagen';

  // Añadimos la imagen al span
  span.appendChild(img);

  // Creamos el salto de línea
  const br = document.createElement('br');

  // Retornamos los elementos como un array
  return [span, br];
}


/**
 * Funcion para crear imagenes desde un json de la API de Watson
 * @param {json} image
 * @returns Nada, pero crea una imagen en el DOM basada en el json
 */
function crearImagenWatson(image) {
  const imageContainer = document.createElement('span');
  imageContainer.id = 'user-message';

  const imageElement = document.createElement('img');
  imageElement.src = image.source;
  imageElement.alt = image.alt_text;

  if (image.title) {
    const titleElement = document.createElement('h3');
    titleElement.textContent = image.title;
    imageContainer.append(titleElement, document.createElement('br'));
  }

  imageContainer.append(imageElement, document.createElement('br'));

  const formContainer = document.getElementById('form');
  formContainer.before(imageContainer);
  formContainer.before(document.createElement('br'));

  formContainer.scrollTop = formContainer.scrollHeight;
}

/**
 * Funcion para crear una etiqueta select con las opciones de la API
 * @param {json} options json de opciones
 * @returns Nada, pero crea un select en el DOM
 */
function crearOpciones(options) {
  const messageContainer = document.createElement('span');
  messageContainer.id = 'user-message';

  const titleElement = document.createElement('h3');
  titleElement.textContent = options.title;
  messageContainer.appendChild(titleElement);

  const selectElement = document.createElement('select');
  selectElement.id = 'select' + document.getElementsByTagName('select').length;

  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Selecciona una opción';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectElement.appendChild(defaultOption);

  options.options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.textContent = option.label;
    optionElement.value = option.value.input.text;
    selectElement.appendChild(optionElement);
  });

  selectElement.addEventListener('change', function () {
    disableUserInput(true, document.getElementById('msg'), document.getElementById('btnEnviar'));
    selectElement.disabled = true;
    enviarMensaje(selectElement.value);
  });

  messageContainer.appendChild(selectElement);

  const formContainer = document.getElementById('form');
  formContainer.before(messageContainer);
  formContainer.before(document.createElement('br'));
  formContainer.scrollTop = formContainer.scrollHeight;
}


/**
 * Funcion para desactivar el input y el boton o activarlos
 * @param {boolean} shouldDisable
 * @param {HTMLInputElement} inputElement
 * @param {HTMLButtonElement} buttonElement
 */
function disableUserInput(shouldDisable, inputElement, buttonElement) {
  inputElement.disabled = shouldDisable;
  buttonElement.disabled = shouldDisable;
}

/**
 * Función para mostrar un error de la API en inputError
 * @param {string} msg
 * @param {HTMLInputElement} inputErrorElement
 */
function mostrarError(msg, errorInputElement) {
  // Establecer el mensaje de error en el elemento de entrada
  errorInputElement.value = msg;
  // Establecer el color en rojo
  errorInputElement.style.color = 'red';
}

/**
 * Función para limpiar ambos inputs
 * @param {HTMLInputElement} input
 * @param {HTMLInputElement} inputError
 */
function limpiarInputs(input, inputError) {
  if (input instanceof HTMLInputElement && inputError instanceof HTMLInputElement) {
    // Limpiar el valor del input
    input.value = '';
    // Limpiar el valor del input de error
    inputError.value = '';
  } else {
    console.error('Los parámetros "input" e "inputError" deben ser elementos de entrada válidos.');
  }
}


/**
 * Funcion para crear un snippet de codigo
 * @param {string} code
 * @returns {void}
 */
function crearCodeSnippet(code) {
  code = code.replace(/(\.|\:)/g, '').trim();

  const snippetTemplate = `
    <div class="code-display">
      <div class="buttons">
        <div class="button first"></div>
        <div class="button second"></div>
        <div class="button third"></div>
      </div>
      <div class="code-output">
        <pre><code>${code}</code></pre>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = snippetTemplate.trim();

  const snippet = div.firstChild;
  document.getElementById('form').before(snippet);

  const br = document.createElement('br');
  document.getElementById('form').before(br);

  document.getElementById('form').scrollTop = document.getElementById('form').scrollHeight;
}
/**
 * Función para establecer el tema
 * @param {string} theme - El tema a establecer ('light' o 'dark')
 * @returns {void}
 */
function setTheme(theme) {
  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.querySelector('nav').classList.remove('dark-theme');
    document.querySelectorAll('nav ul').forEach((elemento) => {
      elemento.classList.remove('dark-theme');
    });
    document.querySelector('.fa-moon').classList.replace('fa-moon', 'fa-sun');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.querySelector('nav').classList.remove('light-theme');
    document.querySelectorAll('nav ul').forEach((elemento) => {
      elemento.classList.remove('light-theme');
    });
    document.querySelector('.fa-sun').classList.replace('fa-sun', 'fa-moon');
    localStorage.setItem('theme', 'dark');

  }

  document.body.classList.add(`${theme}-theme`);
  document.querySelector('nav').classList.add(`${theme}-theme`);
  document.querySelectorAll('nav ul').forEach((elemento) => {
    elemento.classList.add(`${theme}-theme`);
  });
}

/**
 * Función para verificar el tema actual y modificarlo de forma correspondiente
 * @returns {void}
 */
function changeTheme() {
  const currentTheme = checkTheme() ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}



// Verificamos el tema almacenado en localStorage al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const storedTheme = localStorage.getItem('theme');

  if (storedTheme === 'dark') {
    setTheme('dark');
  } else {
    setTheme('light');
  }
});

/**
 * Función para comprobar si el usuario tiene de preferencia el tema oscuro o no en localStorage
 * @returns {boolean} true si el tema es oscuro, false si es claro
 */
function checkTheme() {
  return localStorage.getItem('theme') === 'dark';
}

/**
 * Funcion para cambiar el icono del microfono segun su clase
 * @param {HTMLStyleElement} iconMicElement
 * @returns {void}
 */
function changeMicStyle(iconMicElement) {
  console.log(iconMicElement.classList);
  if (iconMicElement.classList.contains('fa-microphone')) {
    iconMicElement.classList.remove('fa-microphone');
    iconMicElement.classList.add('fa-stop');
  } else {
    iconMicElement.classList.remove('fa-stop');
    iconMicElement.classList.add('fa-microphone');
  }
}

/**
 * Funcion la cual comprueba si tenemos permisos para usar el microfono
 * Si los tenemos, se llama a la funcion startVoiceRecognition
 * Si no, simplemente mostramos una alerta al usuario para que sepa que debe dar permisos para poder usar voice recognition
 * @returns void
 */
function checkMicPermissions() {
  // Comprobamos si el navegador soporta el reconocimiento de voz
  if (!checkVoiceRecognitionSupport()) {
    // Si no lo soporta, mostramos una alerta
    alert('Tu navegador no soporta el reconocimiento de voz');
    // Salimos de la funcion
    return;
  }
  // Primero comprobamos si el usuario ya ha dado permisos de microfono
  navigator.permissions.query({ name: 'microphone' }).then(function (result) {
    // Si el usuario ya ha dado permisos, llamamos a la funcion startVoiceRecognition
    if (result.state === 'granted') {
      startVoiceRecognition();
    }
    //Si no le ha dado permisos entonces o no hemos preguntado aun o no nos ha dado permisos
    else if (result.state === 'prompt') {
      // Le preguntamos al usuario si quiere dar permisos
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function () {
        // Si nos da permisos, llamamos a la funcion startVoiceRecognition
        startVoiceRecognition();
      }).catch(function (error) {
        // Si no nos da permisos, mostramos una alerta al usuario
        alert('Ha habido un error al intentar activar el microfono para voice recognition');
        console.error(error);
      });
    }
    // Si el usuario ya ha denegado los permisos, mostramos una alerta al usuario
    else if (result.state === 'denied') {
      alert('No se puede usar el microfono sin permisos');
    }
  });
}

/**
 * Funcion para comprobar si el navegador soporta voice recognition o no
 * @returns {boolean} true si soporta voice recognition, false si no
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#browser_compatibility
 */
function checkVoiceRecognitionSupport() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Funcion que comprueba si el navegador soporta speech synthesis o no
 * @returns {boolean} true si soporta speech synthesis, false si no
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis#browser_compatibility
 */
function checkSpeechSynthesisSupport() {
  return 'speechSynthesis' in window || 'SpeechSynthesisUtterance' in window;
}
