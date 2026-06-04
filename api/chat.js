import fs from "fs";
import path from "path";

// ─── Fysieke branches ─────────────────────────────────────────────────────────
// Bij deze branches is werkgebied/plaats verplicht vóór afsluiting.
const FYSIEKE_BRANCHES = [
  "kapper", "kapster", "kapperszaak", "kapsalon", "salon",
  "schilder", "schildersbedrijf",
  "garage", "garagebedrijf", "autogarage", "automonteur", "autorijschool", "rijschool",
  "fysiotherapeut", "fysiotherapie", "fysiotherapeute",
  "winkel", "bakker", "bakkerij", "slager", "slagerij",
  "restaurant", "café", "cafe", "horeca", "eetcafé", "lunchroom", "snackbar",
  "schoonheidssalon", "nagelsalon", "nagelstudio", "beautysalon",
  "stichting", "praktijk", "medische praktijk",
  "tandarts", "huisarts", "dokter", "arts", "psycholoog",
  "bloemist", "bloemwinkel",
  "installateur", "loodgieter", "elektricien", "timmerman", "aannemer",
  "glazenwasser", "schoonmaker", "schoonmaakbedrijf",
  "fietsenmaker", "fietsenwerkplaats",
  "bouwbedrijf", "stukadoor", "tegelzetter", "dakdekker",
];

// ─── Hulpfuncties ─────────────────────────────────────────────────────────────

// Combineer history + huidig bericht tot één doorzoekbare tekst.
function bouwTekst(history, message) {
  return [
    message,
    ...history.map((h) => (typeof h.content === "string" ? h.content : "")),
  ]
    .join(" ")
    .toLowerCase();
}

// Detecteer of het gesprek over een fysiek bedrijf gaat.
function detecteerFysiekBedrijf(history, message) {
  const tekst = bouwTekst(history, message);
  return FYSIEKE_BRANCHES.some((branch) => tekst.includes(branch));
}

// Extraheer een licht dossier uit de gesprekshistorie.
// Heuristiek — geen harde parsing. Proxy voor de Completeness-instructie.
function extraheerDossierStatus(history, message) {
  const tekst = bouwTekst(history, message);
  const gevonden = {};

  // Bedrijfsnaam: eigenwoord-patroon of gesprek lang genoeg voor naam te zijn gevallen
  gevonden.bedrijfsnaam =
    /\b(ik heb een|mijn bedrijf|bedrijf heet|het heet|wij heten|wij zijn|de naam is|naam:|ik ben de eigenaar van|ik heb|de zaak heet|ik run|ik heb een)\b/i.test(tekst) ||
    history.length > 4;

  // Type bedrijf: branche of algemeen beroep
  gevonden.type_bedrijf =
    FYSIEKE_BRANCHES.some((b) => tekst.includes(b)) ||
    /\b(ondernemer|zelfstandig|zzp|freelance|bureau|studio|kantoor|dienst|bedrijf|consultant|coach|trainer|therapeut|adviseur)\b/i.test(tekst);

  // Doelgroep
  gevonden.doelgroep =
    /\b(dames|heren|kinderen|mannen|vrouwen|particulier|zakelijk|bedrijven|klanten|consumenten|patiënten|cliënten|ouderen|jongeren|gezinnen|iedereen|alle leeftijden)\b/i.test(tekst);

  // Doel website
  gevonden.doel_website =
    /\b(klanten|afspraken|zichtbaar|vindbaar|online|portfolio|contact|boeken|reserveren|informatie|verkopen|promoten|laten zien|bereikbaar|google)\b/i.test(tekst);

  // Werkgebied: uitsluitend echte plaatsnamen of expliciete locatieformuleringen.
  // GEEN losse "wijk", "in de", "bij ons in" — die zijn te generiek en veroorzaken
  // valse positieven (zie kappertest: "nieuwe look in onze wijk").
  gevonden.werkgebied =
    // Grote en middelgrote Nederlandse steden
    /\b(amsterdam|rotterdam|den haag|utrecht|eindhoven|groningen|haarlem|leiden|breda|nijmegen|tilburg|maastricht|arnhem|delft|almere|zwolle|enschede|apeldoorn|dordrecht|deventer|zaandam|alkmaar|amersfoort|zoetermeer|den bosch|'s-hertogenbosch|leeuwarden|emmen|helmond|schiedam|gouda|hoorn|hilversum|ede|zeist|haarlemmermeer|venlo|oss|roosendaal|spijkenisse|vlaardingen|capelle|purmerend|middelburg|weert|heerlen|sittard|geleen|kerkrade|alphen|waddinxveen|gouda|woerden|nieuwegein|houten|vianen|ijsselstein|barendrecht|ridderkerk|lansingerland|krimpen|lelystad|almelo|hengelo|deventer|rijswijk|wassenaar|leidschendam|voorburg|pijnacker|nootdorp|berkel|rokkeveen|zoetermeer|monster|naaldwijk|wateringen|maasdijk|poeldijk|westland|haarlemmermeer|hoofddorp|nieuw-vennep|amstelveen|diemen|abcoude|weesp|huizen|bussum|naarden|muiden|muiderberg|hillegom|lisse|sassenheim|voorhout|noordwijk|katwijk|wassenaar|oegstgeest|leiderdorp|alphen|boskoop|hazerswoude|zwammerdam|bodegraven|reeuwijk|gouda|waddinxveen|moordrecht|nieuwerkerk|capelle|krimpen|ridderkerk|barendrecht|rhoon|poortugaal|spijkenisse|bernisse|brielle|hellevoetsluis|westvoorne|rozenburg|vlaardingen|maassluis|schiedam|rotterdam|dordrecht|sliedrecht|hardinxveld|werkendam|woudrichem|gorinchem|leerdam|vianen|nieuwegein|houten|utrecht)\b/i.test(tekst) ||
    // Expliciete werkgebied-formuleringen met geografische context
    /\b(wij (zitten|zijn|werken|zijn gevestigd) in|gevestigd in|werkzaam in|werk(en)? in de regio|in de buurt van|in het centrum van|in (noord|oost|west|zuid|midden)-(nederland|holland)|door heel nederland|landelijk werkzaam|door het hele land)\b/i.test(tekst);

  // Identiteitskenmerk: iets onderscheidends over het bedrijf
  gevonden.identiteitskenmerk =
    /\b(al \d+ jaar|wij zijn al|ervaring|specialist|expert|familie(bedrijf)?|kleinschalig|persoonlijk|anders dan|uniek|trots|vakmanschap|kwaliteit|zorg voor|liefde voor|passie|gespecialiseerd in|als enige|alleen wij|hippe|gezellig|modern|trendy|sfeervol|ambachtelijk|eerlijk|betrouwbaar|snel|goedkoop|betaalbaar|de beste|toonaangevend)\b/i.test(tekst);

  // Contactgegevens: uitsluitend expliciete contact-informatie.
  // "later" en "nog niet" tellen ALLEEN als ze staan in context van contact/email/telefoon,
  // NIET als antwoord op een fotovraag of andere niet-contact vraag.
  // Valse positieven uit vorige versie: "nee nog niet, die lever ik later aan" (over foto's)
  gevonden.contactgegevens =
    // Echte contactinformatie in de tekst
    /\b(telefoon|telefoonnummer|e-mail|email|emailadres|mailadres|bereikbaar|bellen|appen|whatsapp|gmail|hotmail|outlook|icloud)\b/i.test(tekst) ||
    // @ als proxy voor een e-mailadres
    /\S+@\S+\.\S+/.test(tekst) ||
    // Telefoonnummer als getal-patroon
    /\b(06|0[1-9][0-9])[- ]?[0-9]{7,8}\b/.test(tekst) ||
    // Expliciete contact-later-uitspraken
    /\b(dat geef ik later|later (doorgeven|opgeven|sturen)|contactgegevens (volgen|stuur ik)|bereikbaar (ben ik|via)|mijn nummer is|mijn e-mail is|mijn telefoonnummer|neem contact op via)\b/i.test(tekst);

  return gevonden;
}

// Bepaal het eerste ontbrekende verplichte veld.
// Prioriteitsvolgorde conform Werkdocument V4 en impactanalyse-fase2:
// 1. bedrijfsnaam → 2. type_bedrijf → 3. doelgroep → 4. doel_website
// → 5. werkgebied (alleen fysiek) → 6. identiteitskenmerk → 7. contactgegevens
function bepaalOntbrekendVeld(dossier, isFysiek) {
  if (!dossier.bedrijfsnaam)       return "bedrijfsnaam";
  if (!dossier.type_bedrijf)       return "type_bedrijf";
  if (!dossier.doelgroep)          return "doelgroep";
  if (!dossier.doel_website)       return "doel_website";
  if (isFysiek && !dossier.werkgebied) return "werkgebied";
  if (!dossier.identiteitskenmerk) return "identiteitskenmerk";
  if (!dossier.contactgegevens)    return "contactgegevens";
  return null; // alles aanwezig — Completeness groen
}

// Vraagformulering per ontbrekend veld.
// De Completeness-instructie vertelt het model welke specifieke vraag te stellen.
const VELD_VRAAG = {
  bedrijfsnaam:
    "Vraag: wat is de naam van het bedrijf?",
  type_bedrijf:
    "Vraag: wat voor soort bedrijf of beroep is het?",
  doelgroep:
    "Vraag: voor wie werkt het bedrijf — wie zijn de klanten?",
  doel_website:
    "Vraag: wat wil de ondernemer bereiken met de website?",
  werkgebied:
    "Vraag: in welke plaats of regio is het bedrijf actief? Gebruik de exacte formulering: \"In welke plaats of regio zit uw zaak?\"",
  identiteitskenmerk:
    "Vraag: wat onderscheidt dit bedrijf van anderen in dezelfde branche?",
  contactgegevens:
    "Vraag: op welk e-mailadres of telefoonnummer is de ondernemer bereikbaar? Gebruik de exacte formulering: \"Op welk e-mailadres of telefoonnummer kunnen we u bereiken?\"",
};

// Verboden preview- en voorstel-aankondigingen
const VERBODEN_PREVIEW_PATRONEN = [
  /ik ga nu een (eerste )?voorstel (van de website |voor u )?maken/gi,
  /ik maak nu een (eerste )?preview/gi,
  /ik (ga nu |zal |zal nu |ga )(een|het) (website)?voorstel (voor u |voor je )?(maken|opstellen|sturen)/gi,
  /ik stuur u (een )?offerte/gi,
  /ik maak (een|de) offerte/gi,
  /ik neem contact op/gi,
  /ik (ga nu |zal )?(u|je) een (voorstel|offerte|preview) (sturen|toesturen|maken)/gi,
];

const GOEDKEURING_TEKST =
  "Ik heb genoeg begrepen om een eerste richting te bepalen. Ik neem dit mee en u hoort zo snel mogelijk van ons.";

// Verboden hallucinaties over niet-opgegeven gegevens
// (model verwijst naar contactgegevens die de ondernemer nooit heeft gegeven)
const VERBODEN_HALLUCINATIE_PATRONEN = [
  /via het e-mailadres (of telefoonnummer )?(dat|die) u (heeft|hebt) (opgegeven|verstrekt|doorgegeven|aangeleverd)/gi,
  /via het telefoonnummer (dat|die) u (heeft|hebt) (opgegeven|verstrekt|doorgegeven)/gi,
  /op het (e-mailadres|telefoonnummer|adres) (dat|die) u (heeft|hebt) (opgegeven|verstrekt)/gi,
  /zoals u (heeft|hebt) (opgegeven|verstrekt|doorgegeven|ingevuld)/gi,
  /die u (heeft|hebt) (opgegeven|verstrekt|doorgegeven|aangeleverd)/gi,
  /dat u (heeft|hebt) (opgegeven|verstrekt|doorgegeven|aangeleverd)/gi,
  /de gegevens die u (heeft|hebt) (opgegeven|verstrekt|achtergelaten)/gi,
  /uw (eerder )?(opgegeven|verstrekte|doorgegeven) (contactgegevens|e-mailadres|telefoonnummer)/gi,
];

const HALLUCINATIE_VERVANGING =
  "Zodra we uw contactgegevens hebben, nemen we contact op.";

function vervangVerbodeTeksten(tekst) {
  let resultaat = tekst;

  // Vervang valse preview-aankondigingen
  for (const patroon of VERBODEN_PREVIEW_PATRONEN) {
    resultaat = resultaat.replace(patroon, GOEDKEURING_TEKST);
  }

  // Vervang hallucinaties over niet-bestaande gegevens
  for (const patroon of VERBODEN_HALLUCINATIE_PATRONEN) {
    resultaat = resultaat.replace(patroon, HALLUCINATIE_VERVANGING);
  }

  return resultaat;
}

// Tel het aantal vraagtekens in een tekst.
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
    const dossier  = extraheerDossierStatus(history, message);
    const ontbrekendVeld = bepaalOntbrekendVeld(dossier, isFysiek);

    // ── Completeness-instructie samenstellen ─────────────────────────────────
    let completenessInstructie;

    if (ontbrekendVeld) {
      completenessInstructie = `
COMPLETENESS CHECK — ACTIE VEREIST:
Het volgende verplichte veld ontbreekt nog: ${ontbrekendVeld.replace(/_/g, " ")}.
${VELD_VRAAG[ontbrekendVeld]}
Stel uitsluitend deze vraag. Stel geen andere vragen.
Ga niet naar een samenvatting of afsluiting totdat dit veld bekend is.`;
    } else {
      completenessInstructie = `
COMPLETENESS CHECK — GROEN:
Alle verplichte velden zijn aanwezig in dit gesprek.
Je mag nu richting samenvatting en afsluiting gaan.
Gebruik de exacte Approval Gate-formulering: "${GOEDKEURING_TEKST}"`;
    }

    // Extra waarschuwing bij fysiek bedrijf zonder werkgebied — redundante zekerheid
    if (isFysiek && !dossier.werkgebied) {
      completenessInstructie += `

FYSIEK BEDRIJF — BLOKKADE ACTIEF:
Dit is een fysiek bedrijf. Werkgebied/stad/regio is verplicht vóór elke afsluiting.
Zolang de ondernemer geen stad, plaats of regio heeft genoemd, mag je niet afsluiten.
Stel nu: "In welke plaats of regio zit uw zaak?"`;
    }

    // Extra waarschuwing bij ontbrekende contactgegevens vlak voor afsluiting
    if (!dossier.contactgegevens && !ontbrekendVeld) {
      completenessInstructie += `

CONTACTGEGEVENS ONTBREKEN — BLOKKADE ACTIEF:
De ondernemer heeft nog geen e-mailadres of telefoonnummer opgegeven.
Stel nu: "Op welk e-mailadres of telefoonnummer kunnen we u bereiken?"
Sluit het gesprek niet af totdat contactgegevens zijn opgegeven of de ondernemer
expliciet aangeeft ze later te willen doorgeven.`;
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
Stel nooit meer dan één vraag per antwoord.
Bevat je antwoord meer dan één vraagteken? Verwijder dan alle vragen behalve de meest urgente.
Dit is niet onderhandelbaar.

VERBODEN FORMULERINGEN — NOOIT GEBRUIKEN:
- "Ik ga nu een voorstel maken"
- "Ik maak nu een preview"
- "Ik stuur u een offerte"
- "Ik neem contact op"
Gebruik in plaats hiervan altijd: "${GOEDKEURING_TEKST}"

VERBODEN VERWIJZINGEN — NOOIT GEBRUIKEN:
Verwijs nooit naar contactgegevens, e-mailadressen, telefoonnummers of andere gegevens
die de ondernemer niet daadwerkelijk in dit gesprek heeft opgegeven.
Zeg nooit: "via het e-mailadres dat u heeft opgegeven" of varianten daarvan,
tenzij het adres letterlijk in de gesprekshistorie staat.

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

    // ── Post-processing: verboden teksten vervangen ──────────────────────────
    reply = vervangVerbodeTeksten(reply);

    // ── Post-processing: één-vraag-check ─────────────────────────────────────
    // Als het antwoord meer dan één vraag bevat, vraag het model opnieuw
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
            "Je antwoord bevat meerdere vragen. Herschrijf het zodat je precies één vraag stelt — de meest urgente. Laat de rest weg. Geef alleen het herschreven antwoord terug, zonder uitleg.",
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

        // Gebruik het herschreven antwoord alleen als het daadwerkelijk
        // minder vragen bevat dan het origineel.
        if (retryReply && telVragen(retryReply) <= telVragen(reply)) {
          reply = vervangVerbodeTeksten(retryReply);
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
