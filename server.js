import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "25mb" }));

app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/analisar-gabarito", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 ausente" });
    }

    const prompt = `
Você recebe uma imagem de gabarito.
Cada linha possui 4 ou 5 alternativas, apenas 1 marcada.
Retorne APENAS este JSON:

{
  "questoes": [
    { "numero": 1, "marcada": "B" }
  ]
}

Se não souber, use "marcada": null.
`;

    const dataUri = `data:image/jpeg;base64,${imageBase64}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: dataUri }
          ]
        }
      ],
      max_tokens: 600,
      temperature: 0
    });

    const msg = response.choices[0].message.content;

    let parsed = null;
    try {
      parsed = JSON.parse(msg.slice(msg.indexOf("{")));
    } catch (err) {
      return res.status(200).json({
        error: "Falha ao parsear JSON",
        raw: msg
      });
    }

    return res.json(parsed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Servidor rodando em http://localhost:" + PORT)
);
