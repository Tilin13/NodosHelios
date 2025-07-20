const express = require("express");
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 3000;
const FILE = "./nodos.json";

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ API Helios corriendo en Render");
});

// Obtener todos los nodos
app.get("/nodos", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  res.json(data);
});

// Agregar un nodo
app.post("/add-nodo", (req, res) => {
  const { ip, pubkey, type, apiKey } = req.body;

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "API Key inválida" });
  }

  if (!ip || !pubkey || !type) {
    return res.status(400).json({ error: "Faltan campos: ip, pubkey, type" });
  }

  let data = JSON.parse(fs.readFileSync(FILE));

  if (!data[type]) {
    return res.status(400).json({ error: "Tipo de nodo inválido" });
  }

  const newNodo = {
    ip,
    pubkey,
    last_seen: new Date().toISOString()
  };

  data[type].push(newNodo);
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  res.json({ message: "Nodo añadido con éxito", nodo: newNodo });
});

// Eliminar nodo
app.post("/remove-nodo", (req, res) => {
  const { ip, type, apiKey } = req.body;

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "API Key inválida" });
  }

  if (!ip || !type) {
    return res.status(400).json({ error: "Faltan ip o type" });
  }

  let data = JSON.parse(fs.readFileSync(FILE));

  if (!data[type]) {
    return res.status(400).json({ error: "Tipo de nodo inválido" });
  }

  data[type] = data[type].filter(nodo => nodo.ip !== ip);

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  res.json({ message: `Nodo ${ip} eliminado de ${type}` });
});

app.listen(PORT, () => console.log(`✅ API Helios corriendo en puerto ${PORT}`));
