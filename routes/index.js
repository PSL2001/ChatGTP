'use strict';

require('dotenv').config({ silent: true });
var express = require('express');
var router = express.Router();
const axios = require('axios');
const cors = require('cors');

router.use(cors());
router.use(cors());

// Importamos el modulo de ChatGTP
const { Configuration, OpenAIApi } = require("openai");

// Importamos los modulos de Watson Assistant
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

//Creamos una variable para guardar el id de la sesion, empezara como null
let session_id = null;

// Creamos la configuracion para una peticion de Watson Assistant
const assistant = new AssistantV2({
  version: process.env.WATSON_VERSION,
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_API_KEY,
  }),
  serviceUrl: process.env.WATSON_URL,
});

// Creamos la sesion de Watson Assistant para poder enviar mensajes
 const session = new Promise((resolve, reject) => {
   assistant.createSession({
     assistantId: process.env.WATSON_ASSISTANT_ID,
   }).then((res) => {
     // Guardamos el id de la sesion
     resolve(res);
   }).catch((err) => {
     // Guardamos el error en caso de que no se haya podido crear la sesion
     reject(err);
   });
});

session.then((result) => {
  //Guardamos el id de la sesion
  session_id = result.result.session_id;
}).catch((err) => {
  // Mostramos el error en caso de que no se haya podido crear la sesion
  console.error(err);
});

// Creamos la configuracion para la peticion
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});


// Creamos la instancia de OpenAIApi
const api = new OpenAIApi(configuration);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'ChatAI', message: '¡Habla con nuestra IA!' });
});

/**
 * Función para enviar el mensaje a la API de OpenAI
 * @param {string} msg Mensaje a enviar
 * @returns {Promise<string>} Respuesta de la API
 */
async function sendMessage(msg) {
  try {
    const prompt = "La siguiente conversacion es entre un humano y un asistente de IA. Este asistente es muy inteligente, creativo, dispuesto a ayudar y muy amable.\nHumano: Hola, ¿quién eres?\nIA: Soy una IA creada por OpenAI. ¿Cómo puedo ayudarte?\nHumano: " + msg + "\nIA:";

    const response = await api.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Humano:", " IA:"]
    });

    const text = response.data.choices[0].text;
    return text;
  } catch (error) {
    throw error;
  }
}

// Enrutador
router.post('/send-message', async function (req, res, next) {
  try {
    const msg = req.body.msg;
    console.log(msg);
    
    const response = await sendMessage(msg);
    
    console.log(response);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
});


/**
 * Función para recibir una imagen de la API de OpenAI, procesarla y devolver la respuesta
 * @param {Object} request Request del usuario con la imagen
 * @returns {Promise<Object>} Respuesta de la API que contiene una URL con la imagen procesada o un error
 */
async function sendImage(request) {
  try {
    const { prompt, n, size } = request;
    
    const response = await api.createImage({
      prompt,
      n,
      size,
    });
    
    const responseData = response.data.data;
    return responseData;
  } catch (error) {
    throw error;
  }
}

// Enrutador
router.post('/send-image', async function (req, res, next) {
  try {
    const request = req.body;
    console.log(request);
    
    const response = await sendImage(request);
    
    console.log(response);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
});


/**
 * Función para recibir un código fuente de la API de OpenAI, procesarlo y devolver la respuesta
 * @param {Object} request Request del usuario con la petición de código fuente
 * @returns {Promise<Object>} Respuesta de la API que contiene el código fuente procesado o un error
 */
async function sendCode(request) {
  try {
    const { msg } = request;
    
    const response = await api.createCompletion({
      model: "text-davinci-003",
      prompt: `Se te ha pedido que ${msg}. Escribe solo el código fuente que resuelva la petición, no añadas ni explicación de este programa o texto antes del código fuente`,
      temperature: 0.9,
      max_tokens: 450,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });
    
    const responseData = response.data.choices[0].text;
    return responseData;
  } catch (error) {
    throw error;
  }
}

// Enrutador
router.post('/send-code', async function (req, res, next) {
  try {
    const request = req.body;
    console.log(request.msg);
    
    const response = await sendCode(request);
    
    console.log(response);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
});


/**
 * Función para recibir un texto de la API de Watson Assistant, procesarlo y devolver la respuesta
 * @param {Object} request Request del usuario con el texto
 * @returns {Promise<Object>} Respuesta de la API que contiene el texto procesado o un error
 */
async function sendWatson(request) {
  try {
    const { msg } = request;
    
    const response = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: session_id,
      input: {
        'message_type': 'text',
        'text': msg
      }
    });
    
    return response;
  } catch (error) {
    throw error;
  }
}

// Enrutador
router.post('/send-watson', async function (req, res, next) {
  try {
    const request = req.body;
    console.log(request.msg);
    
    const response = await sendWatson(request);
    
    console.log(response);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
});
  



module.exports = router;
