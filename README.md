# ERP Clone

This repository contains an **ERP/Accounting system clone** inspired by the B1.lt product.

## About the Project

This project provides a skeleton for building a web‑based accounting/ERP application. It includes:

- **Database schema (schema.sql)** – defines tables for companies, clients, products, warehouses, inventory movements, sales and purchase invoices, cash/bank transactions, journal entries, payroll, production, and documents. See `schema.sql` for the complete DDL used to generate the database.
- **Front‑end prototype (frontend/)** – a simple HTML/CSS/JS demo that recreates the client list screen similar to B1.lt. It uses DataTables for sorting and paging. The front‑end files include `index.html`, `scripts.js`, `style.css`, and a sample JSON dataset.

## How to Use

1. Load `schema.sql` into your database system (PostgreSQL or MySQL) to create the necessary tables.
2. Host the files in the `frontend/` directory on a web server and connect them to your backend API.
3. Replace the hard‑coded sample data in `scripts.js` with API calls to fetch real data from your backend.

For convenience, the original project directory and SQL schema are included in a tarball provided via the conversation attachments. You can download `erp_clone.tar.gz` and `schema.sql` from the ChatGPT file attachments and place them in this repository locally.
