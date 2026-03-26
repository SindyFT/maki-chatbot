const express = require("express");
const axios = require("axios");
const fs = require("fs-extra");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "makiverify2026";

const PAGE_ACCESS_TOKEN = "EAAQ5LZAHTZCigBRAcTjjwcCZAROG7PW421PkZBURVvRwW3vtZAdQwwXZBGWJ5F9awBNY3NQosO8NWwf0XFvOO6MG9d0ru8dqaKWPpmOIx4IUbZC51bsDrIfJ2z6sKAw4QvJJSepmZCrKZANuuJI7p8gi4LPKpycB97W5e9GhzYrKcc3XaMZAycE3ZBJCI4hbfi9cKRWTb4FqwZDZD";

let estadoUsuario = {};


// =======================
// VERIFICAR WEBHOOK
// =======================
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ WEBHOOK VERIFICADO");
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}
});


// =======================
// RECIBIR MENSAJES
// =======================
app.post("/webhook", async (req, res) => {

console.log("🔥 WEBHOOK RECIBIDO:");
console.log(JSON.stringify(req.body, null, 2));

const body = req.body;

if (body.object === "page") {

for (const entry of body.entry) {
for (const event of entry.messaging) {

const sender = event.sender.id;

if (event.message && event.message.text) {

const mensaje = event.message.text.toLowerCase();

console.log("📩 Mensaje:", mensaje);

// RESPUESTA SIMPLE (PRUEBA)
await enviarTexto(sender, "Hola 👋 tu mensaje fue recibido correctamente");

}

}
}

res.status(200).send("EVENT_RECEIVED");

} else {
res.sendStatus(404);
}

});


// =======================
// ENVIAR MENSAJE
// =======================
async function enviarTexto(sender, texto){

try {

await axios.post(
"https://graph.facebook.com/v18.0/me/messages",
{
recipient:{id:sender},
message:{text:texto}
},
{params:{access_token:PAGE_ACCESS_TOKEN}}
);

} catch (error) {
console.log("❌ ERROR EN ENVÍO:");
console.log(error.response?.data || error.message);
}

}


// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("🚀 BOT MAKI FUNCIONANDO");
});
