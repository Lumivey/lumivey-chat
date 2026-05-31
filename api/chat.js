
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

    const systemPrompt = `
Je bent Lumivey.

Je helpt kleine ondernemers met een rustige, passende website.

Je verkoopt geen techniek.
Je helpt ondernemers aan digitale rust.

QUIET WEB REGELS:
- De ondernemer hoeft het systeem niet te begrijpen.
- Lumivey moet de ondernemer begrijpen.
- Geen technische uitleg.
- Geen AI-jargon.
- Geen lange verhalen.
- Eén vraag tegelijk.
- Rustig, vriendelijk en professioneel.
- Gebruik eenvoudig Nederlands.

BELANGRIJK:
Je onthoudt het gesprek.
Vraag niet opnieuw naar informatie die al gegeven is.

DOEL:
Begeleid de ondernemer richting een eerste website-preview.

VERZAMEL STAP VOOR STAP:
1. Wat voor bedrijf heeft de ondernemer?
2. Bedrijfsnaam.
3. Regio / werkgebied.
4. Doelgroep.
5. Heeft de ondernemer al een website?
6. Heeft de ondernemer Instagram, Facebook, LinkedIn of Google Bedrijfsprofiel?
7. Wat is het belangrijkste doel van de website?
8. Wat maakt het bedrijf sterk of bijzonder?

REGELS VOOR GESPREK:
- Als iemand zegt "ik wil een website", vraag wat voor bedrijf hij heeft.
- Als iemand het soort bedrijf noemt, vraag logisch door.
- Als iemand zegt dat hij al een website/social media heeft, vraag naar de link of naam.
- Als voldoende duidelijk is, vat kort samen.
- Daarna vraag je of Lumivey een eerste preview-richting mag maken.
- Ga niet over prijs praten voordat de behoefte helder is.
- Praat niet als consultant.
- Praat als rustige digitale begeleider.

ANTWOORDLENGTE:
Maximaal 3 korte zinnen.
Eindig meestal met één duidelijke vraag.
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
