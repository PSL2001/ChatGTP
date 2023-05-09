'use strict';

require('dotenv').config({ silent: true });
var express = require('express');
var router = express.Router();

// Importamos el modulo de ChatGTP
const { Configuration, OpenAIApi } = require("openai");

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

  //   // Esperamos a que se resuelva la promesa
  //   mensaje.then((res) => {
  //     // Comprobamos que es una respuesta valida
  //     if (res) {
  //       // Comprobamos que se ha podido procesar la respuesta
  //       if (res?.choices?.text) {
  //         // Devolvemos la respuesta al cliente
  //         resolve({ msg: res.choices.text });
  //       } else {
  //         // Devolvemos el error al cliente
  //         reject(`No se ha podido procesar la respuesta, intentalo mas tarde ${res.statusText} `);
  //       }
  //     } else {
  //       // Devolvemos el error al cliente
  //       reject('No se ha podido recibir la respuesta');
  //     }
  //   }).catch((err) => {
  //     // Devolvemos el error al cliente
  //     reject(err);
  //   });
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


module.exports = router;
