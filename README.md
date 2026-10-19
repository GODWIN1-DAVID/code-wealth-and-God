# Godwin Empire Academy

Flat website build: all website files live at the root level; there are no website asset folders.

## Payment integration
The checkout is wired for server-side Paystack and Flutterwave initialization and verification.

1. Install Node.js 18+.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Put your payment secrets in `.env` only. Never put a secret key in HTML, `app.js`, `data.js`, or GitHub.
5. Set `BASE_URL` to the public HTTPS URL of the Node server when deployed.
6. Run `npm start`.
7. Open the site through the Node server, not VS Code Live Server or GitHub Pages alone.

Course payments are validated on the server against the course catalog and selected duration. The browser does not create the Student ID. After verified payment, the server creates the Student ID and enrollment record.

Paystack callback: `/receipt.html?provider=Paystack`
Flutterwave callback: `/receipt.html?provider=Flutterwave`

## WhatsApp
The Contact page includes a direct WhatsApp support button for the supplied number.

## Production
Use HTTPS, strong unique admin credentials, a strong `ADMIN_SESSION_SECRET`, a persistent database, and configure Paystack/Flutterwave webhooks on the deployed server.


Checkout update: course enrollment checkout now defaults to the 1-year plan, shows the exact one-year price, collects name/email/phone, and sends the verified order to Paystack. Student ID is generated server-side only after payment verification. Course access is tied to the paid enrollment.
