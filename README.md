# CMS för Pizzeria Berna

Det här projektet är admin-delen för min fiktiva restaurang Pizzeria Berna. Den är till för de anställda att logga in på för att kunna hantera menyn och beställningar. De skapar ett konto med deras arbetsmail. Det finns fem undersidor: 
- Startsidan där administratör loggar in.
- Registreringssida där du registrerar ett konto med email och lösenord.
- Dashboard med översikt och länkar till menyn och beställningar.
- Menyn samt formulär för menyhantering.
- Beställningar och knappar för hantering av beställningar.

## Funktioner

- Registrering av administratör (kräver email).
- Inloggning för administratör (med JWT-autentisering).
- Se, radera och redigera alla beställningar som lagts av kunder.
- Användare kan avbryta pågående ändringar.
- Skapa, redigera och ta bort objekt i menyn.
- Tydliga felmeddelanden och bekräftelser vid åtgärder.
- Responsiv och stilren design för användarvänlighet.

## REST API-endpoints

- `GET /api/menu` – Hämta alla menyobjekt.
- `POST /api/menu` – Skapa en ny maträtt.
- `PUT /api/menu/:id` – Uppdatera maträtt.
- `DELETE /api/menu/:id` – Ta bort maträtt.

- `GET /api/order` – Hämta alla beställningar.
- `PUT /api/order/:id` – Uppdatera en beställning.
- `DELETE /api/order/:id` – Ta bort en beställning.

- `POST /api/users/login` – Logga in som administratör och få en JWT-token.
- `POST /api/users/register` – Registrera en ny administratör (kräver email och lösenord).

En liveversion av API:t finns tillgänglig på följande URL: https://dt207g-project-restapi.onrender.com/

## Live Demo

[Prova applikationen här](https://pizzeriaberna-admin.netlify.app/)

Inlogg:
Email: admin@pizzeriaberna.com
Lösenord: password
