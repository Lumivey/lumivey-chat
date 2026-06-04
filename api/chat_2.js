import fs from "fs";
import path from "path";

// ─── Verplichte dossiervelden per bedrijfscategorie ───────────────────────────
// Fysieke bedrijven vereisen werkgebied/plaats vóór preview.
const FYSIEKE_BRANCHES = [
  "kapper", "kapster", "schilder", "garage", "garagebedrijf",
  "fysiotherapeut", "fysiotherapie", "winkel", "bakker", "slager",
  "restaurant", "café", "horeca", "schoonheidssalon", "nagelsalon",
  "stichting", "praktijk", "tandarts", "huisarts", "dokter",
  "bloemist", "rijschool", "autorijschool", "installateur",
  "loodgieter", "elektricien", "timmerman", "aannemer",
];

// Verplichte velden vóór Completeness groen is
const VERPLICHTE_VELDEN = [
  "bedrijfsnaam",
  "type_bedrijf",
  "doelgroep",
  "doel_website",
  "identiteitskenmerk",
];

// ─── Hulpfuncties ─────────────────────────────────────────────────────────────

// Detecteer of het gesprek gaat over een fysiek bedrijf.
// Kijkt in history + huidig bericht naar branch-keywords.
function detecteerFysiekBedrijf(history, message) {
  const tekst = [
    message,
    ...history.map((h) => (typeof h.content === "string" ? h.content : "")),
  ]
    .join(" ")
    .toLowerCase();

  return FYSIEKE_BRANCHES.some((branch) => tekst.includes(branch));
}

// Extraheer een licht dossier uit de gesprekshistorie.
// Geeft terug welke sleutelvelden al aanwezig lijken en welke ontbreken.
// Dit is geen harde parsing — het is een heuristiek voor de systeemprompt.
function extraheerDossierStatus(history, message) {
  const tekst = [
    message,
    ...history.map((h) => (typeof h.content === "string" ? h.content : "")),
  ]
    .join(" ")
    .toLowerCase();

  const gevonden = {};

  // Bedrijfsnaam: aanwezig als er een eigenwoordige naam is opgegeven
  // (heuristiek: zinnen als "ik ben X", "mijn bedrijf heet X", "het heet X")
  gevonden.bedrijfsnaam =
    /\b(ik ben|mijn bedrijf|bedrijf heet|het heet|wij heten|wij zijn|de naam is|naam:)\b/i.test(
      tekst
    ) || history.length > 4;

  // Type bedrijf: aanwezig als een beroep of branche is genoemd
  gevonden.type_bedrijf = FYSIEKE_BRANCHES.some((b) => tekst.includes(b)) ||
    /\b(ondernemer|zelfstandig|zzp|freelance|bureau|studio|kantoor|dienst|bedrijf)\b/i.test(
      tekst
    );

  // Doelgroep
  gevonden.doelgroep =
    /\b(dames|heren|kinderen|particulier|zakelijk|bedrijven|klanten|consumenten|patiënten|cliënten|ouderen|jongeren|gezinnen)\b/i.test(
      tekst
    );

  // Werkgebied / locatie
  gevonden.werkgebied =
    /\b(amsterdam|rotterdam|den haag|utrecht|eindhoven|groningen|haarlem|leiden|breda|nijmegen|tilburg|maastricht|arnhem|delft|almere|zwolle|enschede|apeldoorn|zaandam|haarlemmermeer|nederland|regio|provincie|stad|gemeente|wijk|dorp|thuis|aan huis|mobiel|heel)\b/i.test(
      tekst
    ) ||
    /\b(in de|bij ons in|wij zijn in|gevestigd in|werkzaam in|werk in|vanuit)\b/i.test(
      tekst
    );

  // Doel website
  gevonden.doel_website =
    /\b(klanten|afspraken|zichtbaar|vindbaar|online|werk.*laten zien|laten zien|portfolio|contact|boeken|reserveren|informatie|verkopen|promoten)\b/i.test(
      tekst
    );

  // Identiteitskenmerk: aanwezig als er iets persoonlijks of onderscheidends is gezegd
  gevonden.identiteitskenmerk =
    /\b(ik ben|wij zijn|al.*jaar|ervaring|specialist|expert|familie|kleinschalig|persoonlijk|anders dan|uniek|trots|vakmanschap|kwaliteit|zorg|liefde voor|passie|gespecialiseerd in|als enige|alleen wij)\b/i.test(
      tekst
    );

  // Contactgegevens
  gevonden.contactgegevens =
    /\b(telefoon|telefoonnummer|email|e-mail|adres|later|straks|doorsturen|nog niet)\b/i.test(
      tekst
    );

  return gevonden;
}

// Bepaal welke velden nog ontbreken, gegeven het dossier en bedrijfstype.
function bepaalOntbrekendVeld(dossier, isFysiek) {
  // Volgorde van prioriteit: eerst basisvelden, dan locatie bij fysiek, dan identiteit
  if (!dossier.bedrijfsnaam) return "bedrijfsnaam";
  if (!dossier.type_bedrijf) return "type_bedrijf";
  if (!dossier.doelgroep) return "doelgroep";
  if (!dossier.doel_website) return "doel_website";
  if (isFysiek && !dossier.werkgebied) return "werkgebied";
  if (!dossier.identiteitskenmerk) return "identiteitskenmerk";
  return null; // alles aanwezig
}

// Menselijke label per veldnaam voor gebruik in de prompt
const VELD_OMSCHRIJVING = {
  bedrijfsnaam: "de naam van het bedrijf",
  type_bedrijf: "wat voor soort bedrijf of beroep het is",
  doelgroep: "voor wie het bedrijf werkt (de doelgroep)",
  doel_website: "wat de ondernemer wil bereiken met de website",
  werkgebied: "in welke stad, regio of welk gebied het bedrijf actief is",
  identiteitskenmerk:
    "wat dit bedrijf onderscheidt van anderen in dezelfde branche (één concreet kenmerk)",
};

// Verboden preview-aankondigingen en hun vervanging
const VERBODEN_PATRONEN = [
  /ik ga nu een (eerste )?voorstel (van de website |voor u )?maken/gi,
  /ik maak nu een (eerste )?preview/gi,
  /ik (ga nu |zal |zal nu |ga )(een|het) (website)?voorstel (voor u |voor je )?(maken|opstellen|sturen)/gi,
  /ik stuur u (een )?offerte/gi,
  /ik maak een offerte/gi,
  /ik neem contact op/gi,
  /ik (ga nu |zal )?(u|je) een (voorstel|offerte|preview) (sturen|toesturen|maken)/gi,
];

const GOEDKEURING_TEKST =
  "Ik heb genoeg begrepen om een eerste richting te bepalen. Ik neem dit mee en u hoort zo snel mogelijk van ons.";

function vervangVerbodePreviews(tekst) {
  let resultaat = tekst;
  for (const patroon of VERBODEN_PATRONEN) {
    resultaat = resultaat.replace(patroon, GOEDKEURING_TEKST);
  }
  return resultaat;
}

// Tel het aantal vragen in een tekst (vraagtekens als proxy)
function telVragen(tekst) {
  const matches = tekst.match(/\?/g);
  return matches ? matches.length : 0;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      reply: "Lumivey API werkt. Gebruik POST vanuit de chat.",
    });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message) {
      return res.status(400).json({
        reply: "Geen bericht ontvangen.",
      });
    }

    // ── Brain laden ──────────────────────────────────────────────────────────
    const brainPath = path.join(process.cwd(), "lumivey-brain-v4.md");
    const lumiveyBrain = fs.readFileSync(brainPath, "utf8");

    // ── Lichte dossier-check ─────────────────────────────────────────────────
    const isFysiek = detecteerFysiekBedrijf(history, message);
    const dossier = extraheerDossierStatus(history, message);
    const ontbrekendVeld = bepaalOntbrekendVeld(dossier, isFysiek);

    // ── Completeness-instructie samenstellen ─────────────────────────────────
    let completenessInstructie = "";

    if (ontbrekendVeld) {
      completenessInstructie = `
COMPLETENESS CHECK — VERPLICHTE ACTIE:
Het volgende verplichte veld ontbreekt nog in dit gesprek: ${VELD_OMSCHRIJVING[ontbrekendVeld]}.
Stel precies over dit onderwerp één gerichte vraag. Niet meer.
Ga niet naar een samenvatting of voorstel totdat dit veld bekend is.`;
    } else {
      completenessInstructie = `
COMPLETENESS CHECK:
Alle verplichte velden zijn aanwezig in dit gesprek.
Je mag nu richting samenvatting en voorstel gaan.
Gebruik de correcte formulering uit de Brain voor de Approval Gate-afsluiting.`;
    }

    if (isFysiek && !dossier.werkgebied) {
      completenessInstructie += `
FYSIEK BEDRIJF GEDETECTEERD:
Dit is een fysiek bedrijf. Werkgebied/stad/regio is verplicht vóór afsluiting.
Vraag dit als het nog niet is gegeven — dit is de hoogste prioriteit.`;
    }

    // ── Systeemprompt ────────────────────────────────────────────────────────
    const systemPrompt = `
Je bent Lumivey.

Gebruik Lumivey Brain V4 als enige operationele gedragslaag.
Volg de Brain strikt.
Gebruik de gesprekshistorie.
Vraag nooit opnieuw wat al bekend is.
Antwoord kort, rustig en menselijk.

HARD REGEL — ÉÉN VRAAG PER BERICHT:
Stel nooit meer dan één vraag per antwoord. Bevat je antwoord meer dan één vraagteken?
Verwijder dan alle vragen behalve de meest urgente. Dit is niet onderhandelbaar.

VERBODEN FORMULERINGEN — NOOIT GEBRUIKEN:
- "Ik ga nu een voorstel maken"
- "Ik maak nu een preview"
- "Ik stuur u een offerte"
- "Ik neem contact op"
- Elke variant hiervan waarbij je iets aankondigt dat je niet direct uitvoert.
Gebruik in plaats daarvan altijd: "${GOEDKEURING_TEKST}"

${completenessInstructie}

--- LUMIVEY BRAIN V4 ---

${lumiveyBrain}
`;

    // ── Eerste model-aanroep ─────────────────────────────────────────────────
    const conversation = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: conversation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        reply: "OpenAI gaf een fout terug: " + JSON.stringify(data),
      });
    }

    let reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Ik kon nog geen goed antwoord maken.";

    // ── Post-processing: verboden preview-aankondigingen vervangen ───────────
    reply = vervangVerbodePreviews(reply);

    // ── Post-processing: één-vraag-check ─────────────────────────────────────
    // Als het antwoord meer dan één vraag bevat, vraag het model het opnieuw
    // te formuleren met maximaal één vraag.
    if (telVragen(reply) > 1) {
      const retryConversation = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: reply },
        {
          role: "user",
          content:
            "Je antwoord bevat meerdere vragen. Herschrijf het zodat je precies één vraag stelt — de meest urgente. De rest laat je weg. Geef alleen het herschreven antwoord terug, zonder uitleg.",
        },
      ];

      const retryResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: retryConversation,
        }),
      });

      const retryData = await retryResponse.json();

      if (retryResponse.ok) {
        const retryReply =
          retryData.output_text ||
          retryData.output?.[0]?.content?.[0]?.text ||
          null;

        // Gebruik het herschreven antwoord alleen als het korter of gelijkwaardig is
        // en daadwerkelijk minder vragen bevat. Anders houden we het origineel.
        if (retryReply && telVragen(retryReply) <= telVragen(reply)) {
          reply = vervangVerbodePreviews(retryReply);
        }
      }
    }

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({
      reply: "Serverfout: " + error.message,
    });
  }
}
