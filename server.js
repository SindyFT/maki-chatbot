const express = require("express");
const axios = require("axios");
const fs = require("fs-extra");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "makiverify2026";

const PAGE_ACCESS_TOKEN = "EAAQ5LZAHTZCigBQxwJkwt13Ouvi6ZCJhf3uIQsZBgAceCyj5WRWRH3tbQZBqWuTsbkT0X2ijmym00mD2RcArQmZBNG1fOx2dDruCgHMevrfz5IYRZAlPArfchPObkEr6zjTChMoED5amKW91YtWtDbmmeUEJkk4rDvmBzHY4P1aROMLEvSFS71hd92aTHTep5S12SEIawZDZD";

let lastUserMessage = {};
let servicioUsuario = {};
let estadoUsuario = {};


// VERIFICAR WEBHOOK
app.get("/webhook", (req, res) => {

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}

});


// RECIBIR MENSAJES
app.post("/webhook", async (req, res) => {

const body = req.body;

if (body.object !== "page") {
return res.sendStatus(404);
}

for (const entry of body.entry) {
for (const event of entry.messaging) {

const sender = event.sender.id;

if (!event.message && !event.postback) continue;

let mensaje = "";

// TEXTO
if (event.message && event.message.text) {
mensaje = event.message.text.toLowerCase();
}

// QUICK REPLY
if (event.message && event.message.quick_reply) {
mensaje = event.message.quick_reply.payload;
}

// POSTBACK
if (event.postback) {
mensaje = event.postback.payload;
}

// evitar duplicados
if (lastUserMessage[sender] === mensaje) continue;

lastUserMessage[sender] = mensaje;

console.log("Mensaje recibido:", mensaje);


// CLIENTE ENVIANDO DATOS
if (estadoUsuario[sender] === "esperando_info") {

await guardarCliente(sender, mensaje);

estadoUsuario[sender] = null;

await enviarTexto(sender,
`✅ Muchas gracias por la información.

Nuestro equipo revisará tu mensaje y un asesor se pondrá en contacto contigo lo antes posible.

✨ Gracias por confiar en Maki Creativa.`
);

continue;

}


// SALUDO INTELIGENTE
if (
(
mensaje.includes("hola") ||
mensaje.includes("buenos") ||
mensaje.includes("buenas") ||
mensaje.includes("buen día") ||
mensaje.includes("buen dia") ||
mensaje.includes("informacion") ||
mensaje.includes("información") ||
mensaje.includes("precio") ||
mensaje.includes("cotizacion") ||
mensaje.includes("cotización") ||
mensaje.includes("cuanto") ||
mensaje.includes("cuánto") ||
mensaje.includes("menu") ||
mensaje.includes("servicios")
)
&& !estadoUsuario[sender]
) {

estadoUsuario[sender] = "menu";

await menuPrincipal(sender);

continue;

}


// DETECTAR SERVICIOS
if (!estadoUsuario[sender] || estadoUsuario[sender] === "menu") {

if (
mensaje.includes("logo") ||
mensaje.includes("logotipo") ||
mensaje.includes("diseño") ||
mensaje.includes("logos")
) {
mensaje = "DISENO";
}

else if (
mensaje.includes("video") ||
mensaje.includes("foto") ||
mensaje.includes("boda")
) {
mensaje = "AUDIOVISUAL";
}

else if (
mensaje.includes("rotulo") ||
mensaje.includes("rotulación") ||
mensaje.includes("lona")
) {
mensaje = "ROTULACION";
}

else if (
mensaje.includes("impresion") ||
mensaje.includes("tarjetas") ||
mensaje.includes("afiches")
) {
mensaje = "IMPRESION";
}

else if (
mensaje.includes("laser") ||
mensaje.includes("acrilico") ||
mensaje.includes("mdf")
) {
mensaje = "LASER";
}

else if (
mensaje.includes("pagina") ||
mensaje.includes("web") ||
mensaje.includes("sitio web")
) {
mensaje = "WEB";
}

}


// SERVICIOS

if (mensaje === "DISENO") {

estadoUsuario[sender] = "esperando_info";
servicioUsuario[sender] = "Diseño gráfico";

await enviarTexto(sender,
`🎨 DISEÑO GRÁFICO

Realizamos:

• Logotipos
• Imagen corporativa
• Branding
• Diseño editorial
• Folletos y más...

💰 Diseños desde $15

Para cotizar necesitamos:

📱 Número de celular
📝 ¿Sobre qué es el diseño?
📦 Si son varios diseños ¿qué cantidad necesitas?`
);

await menuFinal(sender);

continue;

}



if (mensaje === "AUDIOVISUAL") {

estadoUsuario[sender] = "esperando_info";
servicioUsuario[sender] = "Producción audiovisual";

await enviarTexto(sender,
`📸 PRODUCCIÓN AUDIOVISUAL

Servicios:

• Fotografía profesional
• Video publicitario
• Cobertura de bodas
• Eventos sociales y más...

Para verificar disponibilidad necesitamos:

📅 Fecha
📍 Ciudad
📸 ¿Foto,video o ambos?
📱 Número de celular`
);

await menuFinal(sender);

continue;

}



if (mensaje === "ROTULACION") {

estadoUsuario[sender] = "esperando_info";
servicioUsuario[sender] = "Rotulación";

await enviarTexto(sender,
`🪧 ROTULACIÓN PUBLICITARIA

Trabajamos con:

• Rótulos en 3D
• Lonas
• Viniles
• Microperforado
• Vallas y más...

Para cotizar necesitamos:

📏 La medida requerida
🛠 ¿Con instalación o sin instalación?

🔥 En cualquiera de los servicios incluye el diseño.`
);

await menuFinal(sender);

continue;

}



if (mensaje === "IMPRESION") {

estadoUsuario[sender] = "esperando_info";
servicioUsuario[sender] = "Impresión";

await enviarTexto(sender,
`🖨 IMPRESIÓN PROFESIONAL

• Tarjetas de presentación
• Afiches
• volantes
• Revistas
• Banners y más...

🔥 En cualquiera de los servicios incluye el diseño.

💰 El precio depende de la cantidad requerida.

Envíanos la cantidad para cotizar.`
);

await menuFinal(sender);

continue;

}



if (mensaje === "LASER") {

estadoUsuario[sender] = "esperando_info";
servicioUsuario[sender] = "Corte láser";

await enviarTexto(sender,
`🔥 CORTE Y GRABADO LÁSER

Trabajamos modelos personalizados en:

• Acrílico
• MDF
• Llaveros
• Sellos
• Decoraciones y más...

💰 El costo es aproximadamente $0.50 por minuto de máquina.  
Si es en cantidad el precio baja.
🔥Incluye el diseño.`
);

await menuFinal(sender);

continue;

}



if (mensaje === "WEB") {

estadoUsuario[sender] = "esperando_info";
servicioUsuario[sender] = "Sitio web";

await enviarTexto(sender,
`🌐 DESARROLLO WEB

Creamos:

• Sitios web profesionales
• Branding
• Marketing digital y más...

Para cotizar tu propuesta necesitamos:

📱 Número de celular
🏢 ¿Para qué negocio o emprendimiento lo necesitas?`
);

await menuFinal(sender);

continue;

}

}
}

res.status(200).send("EVENT_RECEIVED");

});


// ENVIAR MENSAJE
async function enviarTexto(sender, texto){

await axios.post(
"https://graph.facebook.com/v18.0/me/messages",
{
recipient:{id:sender},
message:{text:texto}
},
{params:{access_token:PAGE_ACCESS_TOKEN}}
);

}


// GUARDAR CLIENTE
async function guardarCliente(id, mensaje){

const archivo = "clientes.json";

let clientes = [];

if(await fs.pathExists(archivo)){
clientes = await fs.readJson(archivo);
}

const telefonoDetectado = mensaje.match(/09\d{8}/);

let telefono = "";

if(telefonoDetectado){
telefono = telefonoDetectado[0];
}

clientes.push({
id:id,
servicio:servicioUsuario[id] || "No especificado",
telefono:telefono,
mensaje:mensaje,
fecha:new Date().toLocaleString()
});

await fs.writeJson(archivo,clientes,{spaces:2});

}


// MENÚ PRINCIPAL
async function menuPrincipal(sender){

await axios.post(
"https://graph.facebook.com/v18.0/me/messages",
{
recipient:{id:sender},
message:{
text:"👋 Hola, ¿cómo estás? Bienvenido a Maki Agencia Creativa. ¿Qué servicio necesitas?",
quick_replies:[
{content_type:"text",title:"🎨 Diseño gráfico",payload:"DISENO"},
{content_type:"text",title:"📸 Producción audiovisual",payload:"AUDIOVISUAL"},
{content_type:"text",title:"🪧 Rotulación",payload:"ROTULACION"},
{content_type:"text",title:"🖨 Impresión",payload:"IMPRESION"},
{content_type:"text",title:"🔥 Corte láser",payload:"LASER"},
{content_type:"text",title:"🌐 Sitio web",payload:"WEB"},
{content_type:"text",title:"👨‍💼 Asesor",payload:"ASESOR"}
]
}
},
{params:{access_token:PAGE_ACCESS_TOKEN}}
);

}


// MENÚ FINAL
async function menuFinal(sender){

await axios.post(
"https://graph.facebook.com/v18.0/me/messages",
{
recipient:{id:sender},
message:{
text:"¿Deseas ver otro servicio o prefieres hablar con un asesor?",
quick_replies:[
{content_type:"text",title:"📋 Ver menú",payload:"menu"},
{content_type:"text",title:"👨‍💼 Hablar con asesor",payload:"ASESOR"}
]
}
},
{params:{access_token:PAGE_ACCESS_TOKEN}}
);

}


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("BOT MAKI CREATIVA FUNCIONANDO 🚀");
});
