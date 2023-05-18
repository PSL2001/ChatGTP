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
 * @returns {span, br} Array con el span y el salto de linea
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
 * Funcion para cambiar la tematica de la pagina de claro a oscuro y viceversa
 * @returns {void}
 */
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  document.body.classList.toggle('dark-theme');
  document.querySelector('nav').classList.toggle('light-theme');
  document.querySelector('nav').classList.toggle('dark-theme');
  document.querySelector('.fa-solid').classList.toggle('fa-sun');
  document.querySelector('.fa-solid').classList.toggle('fa-moon');
  document.querySelectorAll('nav ul').forEach((elemento) => {
    elemento.classList.toggle('light-theme');
    elemento.classList.toggle('dark-theme');
  });
}

/**
 * Funcion para verificar el tema actual y modificarlo de forma correspondiente
 * @returns {void}
 */
function changeTheme() {
  if (checkTheme()) {
    // Si es oscuro, cambiamos a claro
    document.body.classList.remove('dark-theme');
    document.querySelector('nav').classList.remove('dark-theme');
    document.querySelectorAll('nav ul').forEach((elemento) => {
      elemento.classList.remove('dark-theme');
    });
    localStorage.setItem('theme', 'light');
  } else {
    // Si es claro, cambiamos a oscuro
    document.body.classList.remove('light-theme');
    document.querySelector('nav').classList.remove('light-theme');
    document.querySelectorAll('nav ul').forEach((elemento) => {
      elemento.classList.remove('light-theme');
    });
    localStorage.setItem('theme', 'dark');
  }

  toggleTheme();
}

// Verificamos el tema almacenado en localStorage al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  if (checkTheme()) {
    // Si el tema es oscuro, aplicamos los estilos correspondientes
    toggleTheme();
  }
});

/**
 * Funcion para comprobar si el usuario tiene de preferencia el tema oscuro o no en localStorage
 * @returns {boolean} true si el tema es oscuro, false si es claro
 */
function checkTheme() {
  return localStorage.getItem('theme') == 'dark';
}

