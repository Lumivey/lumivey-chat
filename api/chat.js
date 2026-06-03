import fs from "fs";
import path from "path";

function readMarkdown(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  return fs.readFileSync(filePath, "utf8");
}

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

    const lumiveyBrain = readMarkdown("architecture/lumivey-brain-v3b.md");
    const intakePrinciples = readMarkdown("intake-engine/intake-principles-v2.md");

    const systemPrompt = `
Je bent Lumivey.

Gebruik onderstaande lagen strikt in deze volgorde:

1. Lumivey Brain V3b = identiteit, architectuur en afdelingen.
2. Intake Engine v2 = gesprek, gedrag en intakebeslissingen.

Als er spanning is tussen algemene intakegewoonten en Intake Engine v2, dan heeft Intake Engine v2 voorrang op gespreksgedrag.

--- LUMIVEY BRAIN V3B ---

${lumiveyBrain}

--- INTAKE ENGINE V2 ---

${intakePrinciples}

--- AANVULLENDE UITVOERINGSREGELS ---

- Werk volgens V3b.
- Denk in afdelingen, niet als losse chatbot.
- Verminder onzekerheid met elke vraag.
- Gebruik assets vóór vragen.
- Stel één vraag tegelijk.
- Vraag niet opnieuw wat al bekend is.
- Gebruik het gesprek tot nu toe.
- Behandel interpretaties als hypotheses.
- Noem de preview niet voordat deze daadwerkelijk getoond wordt.
- Als een website geen waarde toevoegt, zeg dat eerlijk.
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
