'use strict';

require('dotenv').config({ silent: true });
var express = require('express');
var router = express.Router();

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
 * Funcion para enviar el mensaje a la API de OpenAI
 * @param json data mensaje a enviar
 * @returns json respuesta de la API
 * @throws error si no se ha podido enviar el mensaje
 * @throws error si no se ha podido recibir la respuesta
 * @throws error si no se ha podido procesar la respuesta
 */
router.post('/send-message', function (req, res, next) {
  // Obtenemos el mensaje que viene en formato JSON
  let msg = req.body.msg;
  console.log(msg);
  // Mandamos el mensaje a la API de OpenAI
  const response = new Promise((resolve, reject) => {
    let mensaje = api.createCompletion({
      model: "text-davinci-003",
      prompt: "La siguiente conversacion es entre un humano y un asistente de IA. Este asistente es muy inteligente, creativo, dispuesto a ayudar y muy amable.\nHumano: Hola, ¿quién eres?\nIA: Soy una IA creada por OpenAI. ¿Cómo puedo ayudarte?\nHumano: " + msg + "\nIA:",
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Humano:", " IA:"]
    }).then((res) => {
      // Devolvemos la respuesta al cliente
      resolve(res);
    }).catch((err) => {
      // Devolvemos el error al cliente
      reject(err);
    });
 });


  // Esperamos a que se resuelva la promesa y enviamos la respuesta al cliente
  response.then((result) => {
    console.log(result.data.choices[0].text);
    res.json(result.data.choices[0].text);
  }).catch((err) => {
    console.log(err);
    res.json({ err: err });
  });
});

/**
 * Funcion para recibir una imagen de la API de OpenAI, procesarla y devolver la respuesta
 * @param json request del usuario con la imagen
 * @returns json respuesta de la API, la cual contiene una url con la imagen procesada o un error
 * @throws error si no se ha podido enviar la imagen
 * @throws error si no se ha podido recibir la respuesta
 * @throws error si no se ha podido procesar la respuesta
 */
router.post('/send-image', function (req, res, next) {
  // Obtenemos la request de la imagen del usuario
  console.log(req.body);
  // Pedimos una respuesta a la API de OpenAI
  const response = new Promise((resolve, reject) => {
    let imagen = api.createImage({
      prompt: req.body.prompt,
      n: req.body.n,
      size: req.body.size,
    }).then((res) => {
      // Devolvemos la respuesta al cliente
      resolve(res);
    }).catch((err) => {
      // Devolvemos el error al cliente
      reject(err);
    });
  });

  // Esperamos a que se resuelva la promesa y enviamos la respuesta al cliente
  response.then((result) => {
    console.log(result.data.data);
    res.json(result.data.data);
  }).catch((err) => {
    console.log(err);
    res.json({ err: err });
  });
});

/**
 * Funcion para recibir un codigo fuente de la API de OpenAI, procesarlo y devolver la respuesta
 * @param json request del usuario con la petición de código fuente
 * @returns json respuesta de la API, la cual contiene el código fuente procesado o un error
 * @throws error si no se ha podido enviar el código fuente
 * @throws error si no se ha podido recibir la respuesta
 * @throws error si no se ha podido procesar la respuesta
 */
router.post('/send-code', function (req, res, next) {
  // Obtenemos la request del código fuente del usuario
  console.log(req.body.msg);
  // Pedimos una respuesta a la API de OpenAI
  const response = new Promise((resolve, reject) => {
    let codigo = api.createCompletion({
      model: "text-davinci-003",
      prompt: "Se te ha pedido que " + req.body.msg + ". Escribe solo el codigo fuente que resuelva la peticion, no añadas ni explicacion de este programa o texto antes del codigo fuente",
      temperature: 0.9,
      max_tokens: 450,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    }).then((res) => {
      // Devolvemos la respuesta al cliente
      resolve(res);
    }).catch((err) => {
      // Devolvemos el error al cliente
      reject(err);
    });
  });

  // Esperamos a que se resuelva la promesa y enviamos la respuesta al cliente
  response.then((result) => {
    console.log(result.data.choices[0].text);
    res.json(result.data.choices[0].text);
  }).catch((err) => {
    console.log(err);
    res.json({ err: err });
  });
});

/**
 * Funcion para recibir un texto de la API de Watson Assistant, procesarlo y devolver la respuesta
 * @param json request del usuario con el texto
 * @returns json respuesta de la API, la cual contiene el texto procesado o un error
 * @throws error si no se ha podido enviar el texto
 * @throws error si no se ha podido recibir la respuesta
 * @throws error si no se ha podido procesar la respuesta
 */
router.post('/send-watson', function (req, res, next) {
  // Obtenemos la request del texto del usuario
  console.log(req.body.msg);
  // Pedimos una respuesta a la API de Watson Assistant
  const response = new Promise((resolve, reject) => {
    let answer = assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId: session_id,
      input: {
        'message_type': 'text',
        'text': req.body.msg
      }
    }).then((res) => {
      // Devolvemos la respuesta al cliente
      resolve(res);
    }).catch((err) => {
      // Devolvemos el error al cliente
      reject(err);
    });
  });

  // Esperamos a que se resuelva la promesa y enviamos la respuesta al cliente
  response.then((result) => {
    console.log(result);
    res.json(result);
  }).catch((err) => {
    console.log(err);
    res.json({ err: err });
  });
});
  



module.exports = router;
