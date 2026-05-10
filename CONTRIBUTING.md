# Contributing

This repository is currently maintained as a client-facing ecommerce demo.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure PostgreSQL and the local `.env` file.
3. Compile the runtime:
   ```bash
   npm run compile
   ```
4. Start the local server:
   ```bash
   npm run dev
   ```

## Before Committing

- Do not commit `.env`, generated media, `node_modules`, `dist`, local logs or database dumps.
- Keep client-facing text aligned with Baghel Digital.
- Keep admin flows simple enough for a shop owner to understand.
- Run `npm run compile` after code changes.

## License

Contributions to this repository are provided under the GNU General Public License v3.0.
