/**
 * Archivo para el cliente
 * maneja las peticiones al servidor
 * y la manipulacion del DOM
 * Muestra los mensajes que vengan tanto del usuario principal como el de la API
 */

// Variables globales
const button = document.getElementById('btnEnviar');
const input = document.getElementById('msg');
const inputError = document.getElementById('api-message');
const btnVoice = document.getElementById('btnVoice');
// Variable para guardar el icono del boton de voz
const btnVoiceIcon = btnVoice.querySelector('i');
// Variable para guardar si esta grabando el microfono o no
let isRecording = false;
let socket;
let recorder;
// Para manejar transcripciones
let texts = {};

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
// Ponemos listener al boton de voz
btnVoice.addEventListener('click', checkMicPermissions);


/**
 * Funcion la cual comprueba si tenemos permisos para usar el microfono
 * Si los tenemos, se llama a la funcion startVoiceRecognition
 * Si no, simplemente mostramos una alerta al usuario para que sepa que debe dar permisos para poder usar voice recognition
 * @returns void
 */
function checkMicPermissions() {
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
 * Funcion para iniciar el reconocimiento de voz
 * @returns void
 */
function startVoiceRecognition() {
  // Llamamos a la funcion para cambiar el icono del boton
  changeMicStyle(btnVoiceIcon)
  // Cambiamos el valor de la variable isRecording
  isRecording = !isRecording;
  if (!isRecording) {
    if (recorder) {
      recorder.stop();
      recorder = null;
    }
    if (socket) {
      socket.close();
      socket = null;
    }

  } else {
    fetch('/token').then(function (response) {
      return response.json();
    }).then(function (token) {
      socket = new WebSocket("wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=" + token.token);
      socket.addEventListener('open', comenzarGrabacion);
      socket.addEventListener('message', recibirMensaje);
      socket.addEventListener('close', cerrarConexion);
      socket.addEventListener('error', errorConexion);
    }).catch((err) => {
      console.error(err);
    });
  }
}

/**
 * Funcion para cerrar la conexion de voz
 * @returns void
 */
function cerrarConexion(event) {
  console.log(event);
  socket = null;
}

/**
 * Funcion para manejar los errores de la conexion de voz
 * @returns void
 */
function errorConexion(event) {
  console.error(event);
  socket = null;
}

/**
 * Funcion para comenzar la grabacion de voz
 * @returns void
 */
function comenzarGrabacion() {
  navigator.mediaDevices.getUserMedia({ audio: true})
    .then((stream) => {
      recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm;codecs=pcm', // el endpoint requiere este codec 16bit pcm
        recorderType: StereoAudioRecorder,
        timeSlice: 250, // enviar datos cada 250ms
        desiredSampRate: 16000, // 16khz
        numberOfAudioChannels: 1, // mono, real time solo requiere 1 canal
        bufferSize: 4096, // 4k buffer
        audioBitsPerSecond: 128000, // 128k bps
        ondataavailable: (blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result;

            //El data de audio se envia como base64 string
            if (socket) {
              socket.send(JSON.stringify({ audio_data: base64data.split('base64,')[1] }));
            }
          };
          reader.readAsDataURL(blob);
        },
      });
      recorder.startRecording();
    }).catch((err) => {
      console.error(err);
    });
}

/**
 * Funcion para recibir mensajes de voz
 * @returns void
 */
function recibirMensaje(message) {
  let msg;
  const res = JSON.parse(message.data);
  texts[res.audio_start] = res.text;
  const keys = Object.keys(texts);
  keys.sort((a, b) => a - b);
  for (const key of keys) {
    if(texts[key]) {
      msg += ` ${texts[key]}`;
    }
  }
  input.value = msg;
}

/**
 * Funcion para mostrar un mensaje en el chat y enviar una peticion al servidor
 * @param {string} message, el mensaje que se va a mostrar en el chat, si no se especifica, se coge del input
 * @returns void
 */
function enviarMensaje(message) {
  console.log(message);

  // Bloqueamos el input y el botón para evitar el envío de mensajes mientras se procesa el anterior
  disableUserInput(true, input, button);

  // Obtener el mensaje, puede ser proporcionado como argumento o extraído del input
  if (typeof message !== 'string') {
    // Si no se proporcionó un mensaje específico, obtenemos el valor del input
    message = input.value;
  }

  // Verificar que el mensaje no esté vacío
  if (message.trim() !== '') {
    // Limpiar el input y el mensaje de error
    limpiarInputs(input, inputError);

    // Crear el elemento para mostrar el mensaje del usuario
    crearSpan('<b>Humano: </b>' + message);

    // Crear el objeto para enviar al servidor
    const data = {
      msg: message
    };

    // Verificar si el mensaje contiene palabras como "imagen", "foto", "dibujo", etc.
    if (message.includes('imagen') || message.includes('foto') || message.includes('dibujo') || message.includes('dibujar')) {
      enviarImagen(data);
    } else {
      // En caso contrario, asumimos que es texto
      enviarMensajeWatson(data);
    }
  }
}

/**
    * Funcion para enviar una imagen 
    * Antes de poder mandar la peticion a la API de OpenAI, necesitamos 3 parametros:
    * 1. La peticion de imagen (que tenemos en la variable request)
    * 2. La cantidad de imagenes que queremos que nos devuelva la API (el cual es opcional, pero el usuario podría pedir mas de 1 que es el valor por defecto)
    *    La cantidad maxima de imagenes que podemos pedir es 10.
    * 3. El tamaño de la imagen que queremos. Este campo tambien es opcional, pero dependiendo de como pida la imagen el usuario. puede ser pequeño (256), mediano (512)
    *  o grande (1024). Por defecto, la API devuelve imagenes de tamaño grande.
    * 
    * Toda esta informacion debería estar en la request del usuario, pero por si acaso, vamos a poner valores por defecto.
    * Primero comprobamos en data.msg si el usuario ha pedido mas de una imagen
    * Nos puede pedir mas de una imagen si ha puesto algo como "quiero 3 imagenes de un perro". Esto tambien se aplica para la palabra "tres" y asi con todos los numeros
    * hasta 10. Por eso, vamos a comprobar si el usuario ha puesto un numero del 1 al 10
    * Para ello, vamos a crear una funcion que compruebe si el usuario ha puesto un numero
    * y si es asi, lo devuelve
    * 
    * @param {*} data
    * @returns {void} Nada pero envia una peticion al servidor para que este la envie a la API de OpenAI y nos devuelva una serie de imagenes
*/
function enviarImagen(data) {
  const num = getNumber(data.msg);
  const size = getSize(data.msg);

  const request = {
    prompt: data.msg,
    n: num !== undefined ? parseInt(num) : 1,
    size: size !== undefined ? `${size}x${size}` : '512x512'
  };

  console.log(request);

  fetch('/send-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request),
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);

      if (data) {
        crearImagen(data, input);
        disableUserInput(false, input, button);
      } else {
        mostrarError('No se ha podido procesar la respuesta', inputError);
        disableUserInput(false, input, button);
      }
    })
    .catch(err => {
      mostrarError(`No se ha podido enviar el mensaje ${err}`, inputError);
      disableUserInput(false, input, button);
    });
}


/**
 * Funcion para enviar una cadena de texto
 * Usando la API de OpenAI, podemos enviar una cadena de texto y que nos devuelva una respuesta, tambien en forma de texto
 * @param {*} data 
 */
function enviarTexto(data) {
  console.log(data);

  const isCode = isCodeRequest(data.msg);
  const requestURL = isCode ? '/send-code' : '/send-message';

  fetch(requestURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);

      if (data) {
        if (isCode) {
          crearCodeSnippet(data);
        } else {
          crearSpan("<b>IA: </b>" + data, input);
        }
        disableUserInput(false, input, button);
      } else {
        mostrarError('No se ha podido procesar la respuesta', inputError);
        disableUserInput(false, input, button);
      }
    })
    .catch(err => {
      mostrarError(`No se ha podido enviar el mensaje ${err}`, inputError);
      disableUserInput(false, input, button);
    });
}

/**
 * Función que manda peticiones por texto a Watson Assistant y recibe una respuesta. Si Watson no sabe que responder, se llama a la API de OpenAI para que nos de una respuesta
 * @param {*} data
 * @returns Nada pero envia una peticion al servidor para que este la envie a Watson Assistant y nos devuelva una respuesta
 */
function enviarMensajeWatson(data) {
  fetch('/send-watson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(response => {
      console.log(response);

      if (!response.err) {
        if (response.result.output.intents.length === 0) {
          enviarTexto(data);
        } else {
          console.log(response.result.output.generic);
          compruebaRespuestas(response.result.output.generic);
          disableUserInput(false, input, button);
        }
      } else {
        enviarTexto(data);
      }
    })
    .catch(err => {
      mostrarError(`No se ha podido enviar el mensaje ${err}`, inputError);
      disableUserInput(false, input, button);
    });
}

/**
 * Funcion para devolver una cantidad de imagenes, basandose en el input del usuario
 * @param {string} msg 
 * @returns un numero del 1 al 10
 */
function getNumber(msg) {
  const numeros = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const palabrasNum = ['un', 'una', 'el', 'la'];
  const numerosTexto = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

  const palabras = msg.split(' ');

  for (let palabra of palabras) {
    palabra = palabra.toLowerCase();

    if (numeros.includes(palabra)) {
      return parseInt(palabra);
    }

    if (numerosTexto.includes(palabra)) {
      return numerosTexto.indexOf(palabra) + 1;
    }

    if (palabrasNum.includes(palabra)) {
      return 1;
    }
  }

  return Math.floor(Math.random() * 9) + 2;
}


/**
 * Funcion para comprobar si el usuario ha escrito un tamaño de imagen concreto
 * @param {string} msg 
 * @returns un tamaño de imagen (256, 512 o 1024) dependiendo de lo que haya escrito el usuario o un valor por defecto (512) si no ha escrito nada
 */
function getSize(msg) {
  // Definimos un valor por defecto para el tamaño (siendo este el tamaño mediano)
  let size = 512;

  // Convertimos el mensaje a minúsculas para evitar problemas de coincidencia de palabras
  const lowerMsg = msg.toLowerCase();

  // Creamos un objeto que mapee las palabras clave de tamaño a su correspondiente valor
  const sizeMappings = {
    pequeño: 256,
    mediano: 512,
    medio: 512,
    grande: 1024,
    pequeña: 256,
    mediana: 512,
    pequeñas: 256,
    medianas: 512,
    grandes: 1024,
    pequeños: 256,
    medianos: 512
  };

  // Buscamos en el mensaje las palabras clave de tamaño y actualizamos el tamaño si se encuentra una coincidencia
  Object.keys(sizeMappings).forEach(keyword => {
    if (lowerMsg.includes(keyword)) {
      size = sizeMappings[keyword];
    }
  });

  // Devolvemos el tamaño
  return size;
}


/**
 * Funcion que comprueba si el usuario esta pidiendo un programa o funcion que requiera un snippet de codigo
 * @param {string} msg
 */
function isCodeRequest(msg) {
  // Convertimos el mensaje a minúsculas para evitar problemas de coincidencia de palabras
  const lowerMsg = msg.toLowerCase();

  // Creamos un conjunto (Set) con las palabras que pueden indicar que el usuario está pidiendo un snippet de código
  const codeKeywords = new Set(['codigo', 'code', 'snippet', 'programa', 'programas', 'funcion', 'funciones']);

  // Comprobamos si alguna de las palabras del conjunto está incluida en el mensaje en minúsculas
  return Array.from(codeKeywords).some(keyword => lowerMsg.includes(keyword));
}
/**
 * Funcion que comprueba el tipo de respuesta que viene de watson y devuelve el mensaje adecuado para el usuario
 * @param {string[]} generic
 * @returns void
 */
function compruebaRespuestas(generic) {
  // Recorremos el array de respuestas genericas
  generic.forEach(respuesta => {
    // Comprobamos el tipo de respuesta
    if (respuesta.response_type === 'image') {
      // Si es de tipo imagen, llamamos a la función que genera etiquetas img
      crearImagenWatson(respuesta);
    } else if (respuesta.response_type === 'option') {
      // Si es de tipo opción, llamamos a la función que genera etiquetas select
      crearOpciones(respuesta);
    } else if (respuesta.response_type === 'text') {
      // Si es de tipo texto, llamamos a la función que genera etiquetas span
      crearSpan("<b>IA: </b>" + respuesta.text);
    } else {
      // Si el tipo de respuesta no coincide con ninguno de los casos anteriores, mostramos un mensaje de error o realizamos alguna acción predeterminada
      console.log("Tipo de respuesta no reconocido:", respuesta.response_type);
    }
  });
}
