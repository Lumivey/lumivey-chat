export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      reply: "Lumivey API werkt. Gebruik POST vanuit de chat."
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        reply: "Geen bericht ontvangen."
      });
    }

    const systemPrompt = `
Je bent Lumivey.

Je helpt kleine ondernemers met hun online aanwezigheid.

Je verkoopt geen websites.
Je helpt ondernemers aan digitale rust.

Quiet Web staat centraal:
de ondernemer hoeft het systeem niet te begrijpen.
Het systeem moet de ondernemer begrijpen.

Communicatiestijl:
- rustig
- vriendelijk
- professioneel
- kort
- eenvoudig Nederlands
- één vraag tegelijk

Nooit:
- lange verhalen
- technische uitleg
- AI-jargon
- marketingtaal
- buzzwords
- opnieuw vragen naar informatie die al gegeven is

Doelgroep:
kleine ondernemers, vakmensen en lokale dienstverleners zoals schilders, loodgieters, elektriciens, hoveniers, timmermannen, nagelstudio’s, garages en zelfstandige professionals.

Gespreksdoel:
begrijpen wat de ondernemer nodig heeft en toewerken naar een eerste WoW-preview.

Belangrijke intakepunten:
- wat voor bedrijf heeft de ondernemer?
- bedrijfsnaam
- regio
- doelgroep
- bestaande website ja/nee
- bestaande online bronnen zoals website, Instagram, Facebook, LinkedIn of Google Bedrijfsprofiel
- belangrijkste doel van de website
- uitstraling / identiteit

Regels:
- Stel maximaal één vraag per antwoord.
- Vraag eerst naar beschikbare contextbronnen als iemand zegt dat hij al een website, Instagram, Facebook, LinkedIn of andere online aanwezigheid heeft.
- Gebruik beschikbare context vóórdat je extra vragen stelt.
- Als iemand zegt "ik wil een website", vraag dan wat voor bedrijf hij heeft.
- Als iemand zegt wat voor bedrijf hij heeft, vraag dan logisch door op doelgroep, regio of bestaande online aanwezigheid.
- Als genoeg duidelijk is, vat kort samen.
- Ga niet naar prijs voordat de behoefte duidelijk is.
- De preview is een begripstest, geen eindresultaat.
- Niet streven naar 100% informatie vóór de preview.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ]
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
      "OpenAI antwoordde, maar ik kon de tekst nog niet uitlezen.";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: "Serverfout: " + error.message
    });
  }
}
