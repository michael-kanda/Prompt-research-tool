# Anleitung: SEO · GEO Prompt Research Tool

Diese Anleitung zeigt dir, wie du das Tool verwendest. Es geht nur um die **Nutzung** — Einrichtung und Hosting macht jemand anderes.

**Lesedauer:** ca. 8 Minuten.
**Erste Analyse:** in 10 Minuten erledigt.

---

## Inhalt

1. [Worum geht's?](#1-worum-gehts)
2. [Was du brauchst](#2-was-du-brauchst)
3. [Daten aus Google Analytics 4 holen](#3-daten-aus-google-analytics-4-holen)
4. [Daten aus Google Search Console holen](#4-daten-aus-google-search-console-holen)
5. [Tool benutzen — die 4 Schritte](#5-tool-benutzen--die-4-schritte)
6. [Was du mit den Ergebnissen machst](#6-was-du-mit-den-ergebnissen-machst)
7. [Was tun, wenn etwas nicht klappt?](#7-was-tun-wenn-etwas-nicht-klappt)
8. [Häufige Fragen](#8-häufige-fragen)

---

## 1. Worum geht's?

Stell dir vor, ein potenzieller Kunde sitzt vor ChatGPT und tippt:

> „Ich brauche einen guten Installateur in Wien für eine Heizungsmodernisierung. Was kostet das ungefähr und wer ist empfehlenswert?"

Genau **solche Fragen** sind **Decision-Prompts** — Suchanfragen kurz vor einer Kaufentscheidung. Das Tool findet diese Fragen für dein Unternehmen, indem es:

1. Deine echten Daten aus Google Search Console und Google Analytics 4 analysiert,
2. erkennt, welche Suchanfragen Potenzial haben (Quick Wins, kaufbereite Anfragen),
3. daraus typische Fragen formuliert, die deine Kunden in KI-Systeme eintippen würden.

Diese Fragen testest du dann selbst in ChatGPT, Perplexity oder Gemini — und siehst, ob dein Unternehmen dort empfohlen wird.

---

## 2. Was du brauchst

- [ ] **Zugang zur Tool-URL** (bekommst du von deiner Agentur / IT)
- [ ] **Zugang zu Google Analytics 4** der Webseite, die du analysieren willst
- [ ] **Zugang zu Google Search Console** derselben Webseite
- [ ] Optional: **App-Passwort** (nur falls die Tool-URL geschützt ist — fragst du, wenn nötig)

Das Tool läuft im Browser. Du musst nichts installieren.

> 💡 **Beim ersten Mal nur ausprobieren?** Öffne das Tool, geh auf Tab 01 und klicke **„Demo-Daten laden"**. Damit kannst du alles testen, ohne eigene Daten zu brauchen.

---

## 3. Daten aus Google Analytics 4 holen

Du brauchst eine Liste deiner Seiten mit Besuchen, Engagement und Abschlüssen.

**Schritt für Schritt:**

1. Öffne [analytics.google.com](https://analytics.google.com).
2. Wähle oben deine Webseite (Property) aus.
3. Links im Menü: **„Berichte" → „Lebenszyklus" → „Engagement" → „Zielseiten"**.
4. Zeitraum oben rechts auf **„Letzte 90 Tage"** stellen.
5. Stelle sicher, dass diese Spalten sichtbar sind:
   - Zielseite
   - Sitzungen
   - Aktive Nutzer
   - Engagement-Rate
   - Schlüsselereignisse (oder Conversions)
6. Oben rechts auf das **Teilen-Symbol** klicken → **„Datei herunterladen" → „CSV herunterladen"**.

**CSV in JSON umwandeln (das versteht das Tool):**

1. Gehe zu [csvjson.com/csv2json](https://csvjson.com/csv2json).
2. Öffne deine heruntergeladene CSV-Datei mit einem Texteditor (z. B. Notepad).
3. Kopiere den gesamten Inhalt → füge ihn links in csvjson.com ein.
4. Klicke **„Convert"**.
5. Rechts erscheint dein JSON — kopiere es.

Das Ergebnis sollte ungefähr so aussehen:

```json
[
  { "Zielseite": "/leistungen/heizung", "Sitzungen": 1240, "Engagement-Rate": 0.67, "Schlüsselereignisse": 34 },
  { "Zielseite": "/kontakt", "Sitzungen": 320, "Engagement-Rate": 0.85, "Schlüsselereignisse": 28 }
]
```

> 💡 Die Spaltennamen müssen nicht exakt sein — das Tool erkennt automatisch sowohl deutsche als auch englische Bezeichnungen (`page`, `Zielseite`, `sessions`, `Sitzungen` usw.).

---

## 4. Daten aus Google Search Console holen

Du brauchst eine Liste der Google-Suchanfragen, mit denen Nutzer auf deine Webseite kommen.

**Schritt für Schritt:**

1. Öffne [search.google.com/search-console](https://search.google.com/search-console).
2. Wähle oben deine Webseite aus.
3. Links im Menü: **„Leistung" → „Suchergebnisse"**.
4. Zeitraum oben links auf **„Letzte 3 Monate"** stellen.
5. Aktiviere alle **vier Metriken** (Klicks, Impressionen, CTR, Position) über die Schaltflächen oben.
6. Unter dem Diagramm: Wechsle auf den Tab **„SUCHANFRAGEN"**.
7. Oben rechts: **„Exportieren" → „CSV herunterladen"**.

**Genau wie bei GA4:** Diese CSV auf [csvjson.com/csv2json](https://csvjson.com/csv2json) in JSON umwandeln und kopieren.

Das fertige JSON sieht ungefähr so aus:

```json
[
  { "Top-Suchanfragen": "installateur wien notdienst", "Klicks": 320, "Impressionen": 4200, "CTR": "7,6 %", "Position": 3.2 }
]
```

> 💡 Die Prozentzeichen und Kommata aus der deutschen Excel-Version werden erkannt — du musst nichts manuell korrigieren.

---

## 5. Tool benutzen — die 4 Schritte

Öffne die Tool-URL in deinem Browser. Du siehst oben **vier Tabs**: Setup, Daten, Analyse, Prompts. Geh sie der Reihe nach durch.

### Tab 01 — Setup

Trage Grundinformationen ein:

| Feld | Was eintragen |
|---|---|
| **Domain** | deine Webseite, z. B. `meinefirma.at` |
| **Branche** | z. B. „Installateur" oder „Anwaltskanzlei" |
| **Region** | z. B. „Wien" oder „DACH" |
| **Brand-Name** | erscheint meist automatisch — Suchanfragen mit diesem Begriff werden als „branded" markiert und aus den Quick Wins ausgenommen |
| **KI-Provider** | Lass den Standard stehen (meist „Manuell") |
| **App-Password** | nur eintragen falls du eines bekommen hast |

Klicke unten **„Weiter → Daten laden"**.

### Tab 02 — Daten

Hier lädst du deine vorbereiteten Daten hoch.

1. Klicke oben auf den Reiter **„JSON Paste"** (statt API-Fetch).
2. Im oberen Feld (**GA4 — Landingpages**):
   - Dein GA4-JSON aus Schritt 3 einfügen
   - **„GA4 laden"** klicken
   - Eine Vorschau-Tabelle erscheint mit den ersten 6 Zeilen — sieht die ok aus, hat's geklappt
3. Im unteren Feld (**GSC — Suchanfragen**):
   - Dein GSC-JSON aus Schritt 4 einfügen
   - **„GSC laden"** klicken
   - Wieder eine Vorschau mit den ersten 6 Zeilen
4. Unten erscheint jetzt **„▶ Analyse starten"** — klicken.

### Tab 03 — Analyse

Jetzt rechnet das Tool durch und zeigt dir:

- **Zahlen-Übersicht** ganz oben (wie viele Seiten, Suchanfragen, Quick Wins usw.)
- **Intent-Verteilung** — wie verteilen sich deine Suchanfragen auf:
  - **Transactional** = kaufbereit („preis", „kosten", „termin")
  - **Commercial** = vergleichend („beste", „test", „empfehlung")
  - **Informational** = informierend („wie", „was ist", „anleitung")
  - **Navigational** = nach deinem Brand suchend
- **Topic-Cluster** — welche Suchanfragen gehören thematisch zusammen
- **Quick-Win-Kandidaten** — Suchanfragen auf Position 5–20, wo eine kleine Optimierung großen Effekt bringt
- **Transactional Queries** — die kaufbereiten Anfragen im Detail
- **0-Conversion-Seiten** — bekommen Traffic, aber keine Anfragen
- **Low-Engagement-Seiten** — Besucher gehen schnell wieder

Wenn alles ok aussieht, klicke unten auf **„▶ Decision-Prompts generieren"**.

> 💡 Im Modus **„Manuell"** öffnet sich stattdessen ein Fenster mit einem fertigen Text. Diesen kopierst du und fügst ihn in ChatGPT, Claude oder Gemini ein — die KI antwortet dann mit dem JSON-Ergebnis. Bei der automatischen Variante macht das Tool das selbst.

### Tab 04 — Prompts

Hier erscheinen die fertigen Decision-Prompts:

- **Top-Ranking** mit Score 0–100 — die 8 wichtigsten Prompts auf einen Blick
- **5 Kategorien** mit jeweils 3–4 Prompts:
  - **Anbieter-Vergleich** („Welcher Anbieter ist am besten für ...?")
  - **Validierung** („Ist Anbieter X seriös?")
  - **Spezifikation** („Was genau leistet ...?")
  - **Preis / Kosten** („Was kostet ...?")
  - **Action / Kontakt** („Wie buche ich ...?")

Neben jedem Prompt ist ein **„COPY"-Button** — damit kopierst du den Text mit einem Klick.

---

## 6. Was du mit den Ergebnissen machst

Die generierten Prompts sind das **Werkzeug**, nicht das Ziel. Der eigentliche Wert entsteht, wenn du sie testest:

**Schritt 1: KI-Test**

1. Kopiere einen Prompt aus dem Tool.
2. Füge ihn in ChatGPT, Perplexity oder Gemini ein.
3. Beobachte:
   - Wird dein Unternehmen genannt? An welcher Stelle?
   - Welche Konkurrenten erscheinen?
   - Welche Quellen zitiert die KI (Bewertungsportale, Magazine, eigene Webseiten)?

**Schritt 2: Dokumentation**

Mach dir eine kleine Tabelle:

| Prompt | ChatGPT erwähnt uns? | Perplexity? | Welche Konkurrenten? |
|---|---|---|---|
| „Bester Installateur Wien?" | nein | ja, Platz 3 | Firma X, Firma Y |
| „Was kostet Heizungstausch?" | ja, indirekt | nein | – |

**Schritt 3: Maßnahmen ableiten**

Wenn dein Unternehmen nirgends erscheint, fehlen meist:
- Strukturierte Daten auf der Webseite (Schema.org)
- Erwähnungen auf Bewertungsportalen
- Inhalte, die konkrete Fragen beantworten
- FAQ-Seiten mit denselben Formulierungen wie in den Prompts

Diese Maßnahmen sind dann der Output deiner Analyse — eine konkrete To-do-Liste, mit der du KI-Sichtbarkeit aufbaust.

> 💡 Mit dem **CSV-Button** in Tab 03 (Quick Wins) und Tab 04 (Prompts) kannst du beide Tabellen als Excel-Datei exportieren — praktisch für Reports oder Team-Meetings.

---

## 7. Was tun, wenn etwas nicht klappt?

**„JSON-Fehler beim Laden"**
Dein JSON hat eine Syntax-Macke. Gehe nochmal zu [csvjson.com/csv2json](https://csvjson.com/csv2json), prüfe die Eingabe und konvertiere erneut. Wichtig: Wirklich den **gesamten** CSV-Inhalt kopieren, nicht nur einen Ausschnitt.

**„API-Fehler / CORS-Fehler"**
Wechsle auf den Reiter **„JSON Paste"** statt API-Fetch — funktioniert ohne Konfiguration.

**„Generierung fehlgeschlagen"**
Probier es nochmal — manchmal liegt's an einer kurzen Überlastung der KI. Wenn's mehrmals nicht klappt: Provider auf **„Manuell"** stellen und den Prompt-Kontext kopieren. Damit kommst du immer ans Ergebnis.

**„Anthropic Claude — nicht konfiguriert"**
Wähle einen anderen Provider (Gemini oder Manuell). Anthropic ist auf deiner Tool-Instanz nicht eingerichtet.

**Tool wirkt eingefroren**
Browser-Tab neu laden mit **Strg + Shift + R** (Windows) bzw. **Cmd + Shift + R** (Mac). Deine eingegebenen Daten in Tab 01 bleiben erhalten.

**Tool zeigt komische Zeichen oder kein Styling**
Browser-Cache leeren (wie oben). Tritt typisch nach Updates des Tools auf.

---

## 8. Häufige Fragen

**Wo bleiben meine Daten?**
Alle eingegebenen Daten bleiben in **deinem Browser**. Nichts wird auf dem Server gespeichert. Nur wenn du die KI-Generierung benutzt, wird der zusammengefasste Kontext einmalig an die KI geschickt — und sofort wieder vergessen.

**Bleiben meine Eingaben nach dem Schließen erhalten?**
Ja, Tab 01 (Domain, Branche, Region) bleibt gespeichert. Die GA4/GSC-Daten musst du jedes Mal neu einfügen — das ist Absicht (du hast ja immer aktuelle Daten).

**Wie oft sollte ich die Analyse machen?**
Ein- bis zweimal pro Quartal reicht. Bei größeren Webseiten-Änderungen oder neuen Marketingaktionen auch öfter.

**Kann ich das Tool für mehrere Webseiten benutzen?**
Ja. Du gibst einfach in Tab 01 die neue Domain/Branche ein und lädst neue Daten. Vergiss nur nicht, am Ende **„Alles zurücksetzen"** zu klicken, bevor du den nächsten Kunden bearbeitest — sonst mischen sich die Daten.

**Was bedeuten die Intent-Kategorien genau?**
- **Transactional**: Mensch will kaufen / buchen / kontaktieren. *„installateur wien preis"*, *„termin vereinbaren"*. Höchste Priorität, weil kurz vor Abschluss.
- **Commercial**: Mensch vergleicht Anbieter. *„beste installateur firma"*, *„wärmepumpe vs gasheizung"*. Hier sind Bewertungen und Vergleiche wichtig.
- **Informational**: Mensch informiert sich. *„wie funktioniert wärmepumpe"*. Gut für Content-Marketing und Aufbau von Autorität.
- **Navigational**: Mensch sucht direkt nach deinem Brand. *„musterfirma kontakt"*. Schon Bestandskunden / Bekannte.

**Warum werden Branded Queries ausgeschlossen?**
Wer schon nach deinem Firmennamen sucht, kennt dich. Diese Anfragen sind für Quick Wins uninteressant — der Hebel liegt bei den Menschen, die dich noch nicht kennen.

**Was sind „Quick Wins"?**
Suchanfragen, die auf Position 5–20 landen — also auf Seite 1 oder ganz knapp dahinter. Mit kleinen Optimierungen (besserer Title, FAQ-Block, interne Verlinkung) lassen sie sich oft auf Position 1–3 hochheben. Das bringt schnell mehr Klicks ohne große Investitionen.

**Was ist ein Topic-Cluster?**
Eine Gruppe von Suchanfragen, die thematisch zusammengehören (z. B. alle Anfragen rund um Heizungstausch). Cluster zeigen dir, wo es sich lohnt, einen **Themen-Hub** auf der Webseite anzulegen — eine zentrale Seite mit Unterthemen, die das ganze Cluster abdeckt.

---

*Letzte Aktualisierung: Mai 2026*

Developed with ♥ by [Michael Kanda](https://designare.at)
