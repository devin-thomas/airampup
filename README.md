# AI Ramp Up

Consultation site for Uppercut Labs. Built with TypeScript, Vite, and `@uppercut-labs/retro-game-backgrounds`.

```sh
npm ci
npm run build
npx tsc -p tsconfig.worker.json
npm run dev
```

The production form uses a Pages service binding named `INQUIRY_SERVICE` to call the private `airampup-inquiry` Worker. The Worker validates requests, rate limits them, and sends to `rampup@uppercut-labs.com` through a Cloudflare email binding. The sender domain is `mail-rampup.uppercut-labs.com`; incoming mail remains on Google Workspace. Visitor replies use the address provided in the form.

Pages has been deployed by direct upload. Changes to this repository do not automatically deploy until a Git integration is configured. Both the Pages project and the separate inquiry Worker must be deployed when their respective code changes.
