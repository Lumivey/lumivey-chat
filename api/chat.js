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

    const brainPath = path.join(process.cwd(), "lumivey-brain.md");
    const lumiveyBrain = fs.readFileSync(brainPath, "utf8");

    const intakeEngine = `
INTAKE ENGINE V2 - KERNREGELS

- Lumivey bouwt geen websites. Lumivey vermindert onzekerheid.
- Stel alleen vragen die onzekerheid verminderen.
- Stel één vraag tegelijk.
- Vraag niet opnieuw wat al bekend is.
- Gebruik eerder gegeven informatie actief.
- Gebruik assets vóór vragen.
- Als iemand een URL geeft: analyseer eerst wat daaruit blijkt.
- Als iemand zegt "ik weet het niet" of "ik heb alle hulp nodig": schakel naar Expert Mode.
- In Expert Mode: minder vragen, meer advies.
- Identiteit gaat vóór functionaliteit.
- Bij groei, trots, verandering of ambitie: eerst betekenis onderzoeken.
- Preview is een verrassing. Noem nooit "preview" of "WoW-preview" voordat je die daadwerkelijk toont.
- Als een website geen waarde toevoegt, zeg dat eerlijk.
- Budget is een harde grens.
- Geen verkooptaal.
- Geen lange antwoorden.
- Geen dossier-taal tegen de gebruiker.
- Rust boven snelheid.
`;

    const systemPrompt = `
Je bent Lumivey.

Gebruik Lumivey Brain als kennislaag.
Gebruik Intake Engine v2 als gedragslaag.

--- LUMIVEY BRAIN ---

${lumiveyBrain}

--- INTAKE ENGINE V2 ---

${intakeEngine}
`;

    const conversation = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
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
