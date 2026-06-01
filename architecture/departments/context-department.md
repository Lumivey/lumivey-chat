# Context
Status: actief
Bron: Lumivey Brain V3b
Versie: v1.1 — pilotbevinding fysiotherapiepraktijk

## Doel
Beschikbare informatie verzamelen en structureren vóórdat het gesprek begint. Vragen pas stellen als bronnen onvoldoende zijn. Groei-signalen, identiteitssignalen en trots-momenten opslaan als beschikbare context voor alle afdelingen.

## Verantwoordelijkheid
- Zoveel mogelijk informatie ophalen uit bestaande bronnen.
- Groei-signalen herkennen in externe bronnen en opslaan in het dossier.
- Contextkwaliteitsscore bepalen (bepaalt WoW-potentie van de preview).
- Alle gebruikte bronnen en hun status vastleggen.
- Verzamelde context beschikbaar stellen aan alle afdelingen vóór het gesprek.

## Bronnen
- Website, Instagram, Facebook, LinkedIn.
- Google Bedrijfsprofiel, KvK.
- Brochures, PDF-bestanden, visitekaartjes.
- Foto's, logo's, bedrijfswagens.
- Reviews, projectfoto's, bestaande teksten.

**Regel:** Vraag niet naar informatie die Lumivey zelf betrouwbaar kan vinden.

## Wat op te slaan in het dossier

### Standaard context
- Bedrijfsgegevens, diensten, werkgebied, contactinfo.
- Visuele elementen: kleuren, stijl, logo, beeldmateriaal.
- Reputatie: reviews, onderscheidingen, projectvoorbeelden.

### Groei-context (nieuw)
Signalen gevonden in externe bronnen die wijzen op groei, verandering of een nieuwe fase:

| Signaaltype | Voorbeelden | Dossier-veld |
|---|---|---|
| Verhuizing | Nieuw adres, andere locatie dan eerder | `groei.verhuizing` |
| Uitbreiding team | Meerdere medewerkers zichtbaar, teamspagina uitgebreid | `groei.team_uitbreiding` |
| Nieuwe diensten | Andere of extra diensten dan eerder zichtbaar | `groei.nieuwe_diensten` |
| Nieuwe markt | Zakelijk naast particulier, andere doelgroep | `groei.nieuwe_markt` |
| Nieuwe locatie | Tweede vestiging, groter pand | `groei.nieuwe_locatie` |
| Groeiende reputatie | Meer reviews, hogere score, recente prijzen | `groei.reputatie` |

Wanneer groei-context is gevonden: stel `groei_gedetecteerd: true` in het dossier.

### Identiteitscontext
Signalen die wijzen op de identiteit of het onderscheidend vermogen:
- Terugkerende thema's in teksten of reviews.
- Visuele stijlkeuzes die een waarde uitdrukken.
- Uitspraken op de website over aanpak of filosofie.
Opslaan in: `identiteitsprofiel.context_signalen`.

### Trots-momenten
Externe aanwijzingen voor wat het bedrijf trots maakt:
- Onderscheidingen, prijzen, certificeringen.
- Bijzondere projecten of referenties.
- Lange bestaansduur, familietraditie, lokale bekendheid.
Opslaan in: `reputatieprofiel.trots_momenten`.

## Contextkwaliteitsscore
De kwaliteitsscore bepaalt de WoW-potentie van de preview.

| Score | Betekenis |
|---|---|
| Laag | Weinig bronnen beschikbaar, beperkte visuele context |
| Middel | Basisinformatie aanwezig, geen of weinig visuele context |
| Hoog | Rijke context: teksten, beelden, reviews, groei-signalen |

Hoe meer groei-context en identiteitssignalen aanwezig zijn, hoe hoger de score.

## MVP-implementatie
Claude fungeert als Context-afdeling: websiteanalyse, social media-analyse, contextstructurering in het dossier.

## Input
- Bedrijfsnaam, URL, KvK-nummer, Instagram, Facebook, LinkedIn, Google Bedrijfsprofiel.
- Foto's, logo's, brochures, visitekaartjes, reviews, projectfoto's, bedrijfswagens.

## Output
- Gestructureerde context opgeslagen in het bedrijfsdossier.
- Contextkwaliteitsscore.
- Lijst van gebruikte bronnen en hun status (`beschikbaar` / `niet beschikbaar` / `onbetrouwbaar`).
- Groei-context indien gevonden (`groei.*`).
- Signaalvlag `groei_gedetecteerd: true/false`.
- Identiteitscontext en trots-momenten indien gevonden.

## Samenwerking
- **LSD-afdeling**: ontvangt volledige context vóór het gesprek.
- **Interpretatie-afdeling**: ontvangt externe groei-signalen ter verrijking van gespreksinterpretaties.
- **Identiteit-afdeling**: ontvangt identiteitscontext en trots-momenten.
- **Preview-afdeling**: gebruikt contextkwaliteitsscore en visuele context.

## Voorbeelden

### Voorbeeld 1 — fysiotherapiepraktijk
Gevonden via Google Bedrijfsprofiel: nieuw adres ten opzichte van eerder bekende locatie.
Gevonden via website: teamspagina met vier namen waar eerder twee stonden.

Opgeslagen:
- `groei.verhuizing: nieuw adres gevonden`
- `groei.team_uitbreiding: vier medewerkers zichtbaar`
- `groei_gedetecteerd: true`

Doorgegeven aan LSD-afdeling vóór gesprek: "Let op groei-signalen — externe bronnen tonen uitbreiding."

### Voorbeeld 2 — schildersbedrijf
Gevonden via website: nieuwe sectie over zakelijke projecten, eerder alleen particulier.
Gevonden via reviews: recente reviews noemen projecten bij bedrijven.

Opgeslagen:
- `groei.nieuwe_markt: uitbreiding richting zakelijk`
- `groei_gedetecteerd: true`
- `identiteitsprofiel.context_signalen: vakmanschap en betrouwbaarheid terugkerend in reviews`
