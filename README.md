# Baghel Digital Ecommerce Demo

Premium electronics storefront and admin demo built for a local retail client presentation. The project is customized for an Indian electronics shop with INR pricing, Cash on Delivery, customer accounts, saved addresses, invoice downloads, support documents and a simplified ecommerce admin dashboard.

## What This Demo Shows

- Premium black/gold and light gold storefront themes
- Electronics catalog with product details, specifications and warranty/service sections
- INR pricing across the shopping experience
- Cash on Delivery checkout flow
- Customer registration, login, saved address book and account dashboard
- Checkout address reuse from saved customer addresses
- Order success page with invoice and support document downloads
- Admin dashboard focused on orders and products
- Simplified product creation fields for real electronics inventory
- Order management flow: review, confirm/reject, mark COD paid, ship and deliver

## Local Setup

```bash
npm install
npm run compile
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

## Demo Credentials

```text
Admin email: admin@admin.com
Admin password: Admin123!
```

Customer accounts can be created from the storefront login/register page.

## Environment

The project expects a PostgreSQL database and local environment variables in `.env`. Do not commit `.env`, database dumps, generated media, `node_modules`, `dist`, or server logs.

## Main Commands

```bash
npm run compile
npm run dev
npm run build
npm run start
```

## Project Notes

This is a client-facing ecommerce demo customized by Ashwani Baghel for Baghel Digital. The codebase uses a GPL-licensed commerce foundation and keeps the original GPL license available in this repository.

## License

This repository is distributed under the GNU General Public License v3.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE.md).
