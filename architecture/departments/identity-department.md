# Identiteit
Status: actief
Bron: Lumivey Brain V3b
Versie: v1.1 — pilotbevinding fysiotherapiepraktijk

## Doel
De ziel van het bedrijf vaststellen — wat maakt dit bedrijf uniek, en wie is het bedrijf aan het worden? Minimaal één bevestigd identiteitskenmerk leveren als voorwaarde voor de preview.

## Verantwoordelijkheid
- Identiteitskenmerken ophalen uit gesprek en context.
- Bij groei-signalen: onderzoeken wie het bedrijf aan het worden is, niet alleen wie het was.
- Trots-momenten en veranderende identiteit herkennen en vastleggen.
- Bevestigde identiteitskenmerken opslaan in het identiteitsprofiel van het dossier.
- Persoonlijke informatie alleen gebruiken na akkoord van de ondernemer.

## Identiteitslagen

### Bestaande identiteit
Wie is het bedrijf nu?
- Vakmanschap, betrouwbaarheid, persoonlijke service.
- Historie, familiebedrijf, lokale binding.
- Duurzaamheid, specialistische kennis.
- Bescheidenheid, persoonlijke motivatie.

### Groeiende identiteit (nieuw)
Wie is het bedrijf aan het worden?
- Wat is er veranderd in het afgelopen jaar?
- Wat is er groter, beter of anders geworden?
- Wat wil de ondernemer dat klanten nu zien wat ze eerder niet zagen?
- Welke nieuwe fase gaat het bedrijf in?
- Waar is de ondernemer trots op?

## Acties bij groei-signalen
1. Ontvang groei-context van de Interpretatie-afdeling.
2. Onderzoek de veranderende identiteit met gerichte vragen.
3. Sla bevestigde nieuwe identiteitskenmerken op naast de bestaande.
4. Markeer welke kenmerken zichtbaar moeten worden voor klanten.
5. Geef dit door aan de Preview-afdeling.

## Onderzoeksvragen bij groei en verandering

Bij verhuizing of uitbreiding:
- "Wat betekent die nieuwe locatie voor jullie? Wat wil je dat mensen voelen als ze binnenkomen?"
- "Nu jullie groter zijn — wat wil je dat klanten van die groei zien of merken?"

Bij nieuwe medewerkers:
- "Wat brengen die nieuwe mensen mee? Verbreden jullie je expertise?"
- "Hoe wil je dat naar buiten laten zien?"

Bij nieuwe markt of grotere opdrachten:
- "Is dit de richting die je altijd al op wilde?"
- "Wat wil je dat nieuwe klanten als eerste over jullie begrijpen?"

Bij trots:
- "Waar ben je het meest trots op in die ontwikkeling?"
- "Als je dat aan een nieuwe klant zou willen laten zien — hoe zou je dat doen?"

## Input
- Gespreksinzichten van LSD- en Interpretatie-afdeling.
- Groei-context uit het bedrijfsdossier (veld: `groei.*`).
- Contextinformatie verzameld door de Context-afdeling.

## Output
- Bevestigde identiteitskenmerken opgeslagen in `identiteitsprofiel.bevestigd`.
- Groeiende identiteitskenmerken opgeslagen in `identiteitsprofiel.groei`.
- Lijst van elementen die zichtbaar moeten worden voor klanten (`identiteitsprofiel.zichtbaar_voor_klanten`).
- Minimaal één bevestigd kenmerk als voorwaarde voor de preview.

## Samenwerking
- **Interpretatie-afdeling**: levert groei-signalen en bevestigde interpretaties.
- **LSD-afdeling**: levert gespreksuitkomsten en trots-momenten.
- **Context-afdeling**: levert externe signalen van groei (bijv. nieuwe locatie gevonden via Google).
- **Preview-afdeling**: gebruikt identiteitsprofiel inclusief groeiende identiteit.

## Voorbeelden

### Voorbeeld 1 — fysiotherapiepraktijk
Groei-signaal: "We zijn verhuisd en hebben twee nieuwe medewerkers."

Identiteitsonderzoek:
- "Wat betekent die nieuwe praktijkruimte voor jullie — meer ruimte voor patiënten, of ook een nieuwe uitstraling?"
- "Die twee nieuwe collega's — brengen zij specialisaties mee die jullie eerder niet hadden?"

Bevestigd nieuw identiteitskenmerk: "Groeiende praktijk met breder behandelaanbod en professionelere uitstraling."
Zichtbaar voor klanten: ja, na akkoord ondernemer.

### Voorbeeld 2 — installatiebedrijf
Groei-signaal: "We doen nu ook duurzame installaties, zonnepanelen en warmtepompen."

Identiteitsonderzoek:
- "Is duurzaamheid iets wat bij jullie past als bedrijf, of volgen jullie vooral de markt?"
- "Wil je dat klanten jullie zien als duurzaamheidsspecialist, of blijft het een onderdeel van een breder aanbod?"

Bevestigd nieuw identiteitskenmerk: "Traditioneel installatiebedrijf in transitie naar duurzame specialist."
