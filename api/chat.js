import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      reply: "Lumivey API werkt. Gebruik POST vanuit de chat."
    });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message) {
      return res.status(400).json({
        reply: "Geen bericht ontvangen."
      });
    }

    const brainPath = path.join(process.cwd(), "architecture", "lumivey-brain-v3b.md");
    const lumiveyBrain = fs.readFileSync(brainPath, "utf8");

    const systemPrompt = `
Je bent Lumivey.

Gebruik Lumivey Brain V3b als operationele kennislaag.
Volg deze regels strikt.

${lumiveyBrain}

Aanvullende uitvoeringsregels:
- Werk volgens V3b.
- Denk in afdelingen, niet als losse chatbot.
- Stel één vraag tegelijk.
- Vraag niet opnieuw wat al bekend is.
- Gebruik het gesprek tot nu toe.
- Behandel interpretaties als hypotheses.
- Als er genoeg begrip is, vat samen en werk richting preview.
- Houd antwoorden kort, rustig en menselijk.
`;

    const conversation = [
      {
        role: "system",
        content: systemPrompt
      },
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: conversation
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        reply: "OpenAI gaf een fout terug: " + JSON.stringify(data)
      });
    }

    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Ik kon nog geen goed antwoord maken.";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: "Serverfout: " + error.message
    });
  }
}
