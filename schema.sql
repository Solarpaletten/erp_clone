-- ERP/Accounting system database schema
-- This script defines tables for a basic accounting application inspired by the B1.lt program.

-- Note: The script uses standard SQL and should work with PostgreSQL. If you use MySQL
-- you may need to adjust the syntax for AUTO_INCREMENT and timestamp defaults.

-- Company information. Each company represents a separate legal entity in the system.
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50),
    vat_code VARCHAR(50),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Users of the system. Users belong to a company and have a role (e.g. admin, accountant).
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Clients table includes both customers and suppliers. The flags is_supplier and is_customer
-- indicate the relationship type. Additional contact fields support communication.
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    registration_date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(50),
    code VARCHAR(50),
    vat_code VARCHAR(50),
    phone VARCHAR(50),
    fax VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    is_supplier BOOLEAN DEFAULT FALSE,
    is_customer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Warehouses store goods and track stock levels.
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Products represent goods and services. Additional fields support pricing and tax.
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    category VARCHAR(255),
    manufacturer VARCHAR(255),
    purchase_price DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    vat_rate DECIMAL(5,2),
    is_service BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Current stock quantities per product and warehouse. The quantity may be negative
-- when backorders or adjustments occur.
CREATE TABLE inventory (
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    product_id INT NOT NULL REFERENCES products(id),
    quantity DECIMAL(12,4) NOT NULL DEFAULT 0,
    PRIMARY KEY (warehouse_id, product_id)
);

-- Header for inventory transactions. Each transaction groups multiple items.
CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    transaction_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL, -- purchase, sale, transfer_in, transfer_out, write_off, adjustment
    reference VARCHAR(100),
    client_id INT REFERENCES clients(id),
    notes TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detail lines for inventory transactions. Each line references a product and contains
-- quantity and price information. VAT fields support tax calculations.
CREATE TABLE inventory_transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES inventory_transactions(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity DECIMAL(12,4) NOT NULL,
    unit_price DECIMAL(12,2),
    total DECIMAL(12,2),
    vat_rate DECIMAL(5,2),
    vat_amount DECIMAL(12,2)
);

-- Sales invoices record outgoing documents. Totals are stored for quick reporting.
CREATE TABLE sales_invoices (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    client_id INT NOT NULL REFERENCES clients(id),
    due_date DATE,
    total DECIMAL(12,2) NOT NULL,
    vat_total DECIMAL(12,2) NOT NULL,
    net_total DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, issued, paid
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Line items for sales invoices.
CREATE TABLE sales_invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    description VARCHAR(255),
    quantity DECIMAL(12,4) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    vat_rate DECIMAL(5,2),
    vat_amount DECIMAL(12,2)
);

-- Purchase invoices record incoming documents from suppliers.
CREATE TABLE purchase_invoices (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    supplier_id INT NOT NULL REFERENCES clients(id),
    due_date DATE,
    total DECIMAL(12,2) NOT NULL,
    vat_total DECIMAL(12,2) NOT NULL,
    net_total DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Line items for purchase invoices.
CREATE TABLE purchase_invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    description VARCHAR(255),
    quantity DECIMAL(12,4) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    vat_rate DECIMAL(5,2),
    vat_amount DECIMAL(12,2)
);

-- Cash registers (cash accounts) for managing petty cash and POS operations.
CREATE TABLE cash_accounts (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Cash transactions record money received and paid out. The reference can link
-- to invoice numbers or other documents.
CREATE TABLE cash_transactions (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    account_id INT NOT NULL REFERENCES cash_accounts(id),
    transaction_date DATE NOT NULL,
    type VARCHAR(20) NOT NULL, -- receipt or payment
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    description TEXT,
    client_id INT REFERENCES clients(id),
    reference VARCHAR(100),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank accounts for company bank transactions.
CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    bank_name VARCHAR(255) NOT NULL,
    iban VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Bank transactions record receipts and payments via bank. Transfers between
-- bank accounts can be recorded as two entries (outgoing and incoming).
CREATE TABLE bank_transactions (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    account_id INT NOT NULL REFERENCES bank_accounts(id),
    transaction_date DATE NOT NULL,
    type VARCHAR(20) NOT NULL, -- receipt, payment, transfer
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    description TEXT,
    client_id INT REFERENCES clients(id),
    reference VARCHAR(100),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chart of accounts for double-entry bookkeeping.
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- asset, liability, equity, revenue, expense
    parent_id INT REFERENCES accounts(id)
);

-- Journal entries group multiple debit and credit lines. Each entry represents
-- a transaction in the general ledger.
CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    entry_date DATE NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal entry lines define debits and credits against accounts.
CREATE TABLE journal_entry_lines (
    id SERIAL PRIMARY KEY,
    journal_entry_id INT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES accounts(id),
    debit DECIMAL(12,2) NOT NULL DEFAULT 0,
    credit DECIMAL(12,2) NOT NULL DEFAULT 0,
    description TEXT
);

-- Employees for payroll module. Additional HR details can be added as needed.
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    personal_code VARCHAR(50),
    date_of_birth DATE,
    employment_date DATE,
    position VARCHAR(255),
    salary DECIMAL(12,2),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Payroll records capture salary calculations per period.
CREATE TABLE payroll_records (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    employee_id INT NOT NULL REFERENCES employees(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_salary DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2),
    net_salary DECIMAL(12,2),
    payment_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bill of materials define which raw materials are needed for a finished product.
CREATE TABLE bill_of_materials (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    product_id INT NOT NULL REFERENCES products(id),
    raw_product_id INT NOT NULL REFERENCES products(id),
    quantity DECIMAL(12,4) NOT NULL
);

-- Production orders represent manufacturing jobs. They reference a finished product.
CREATE TABLE production_orders (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    order_number VARCHAR(50) NOT NULL,
    order_date DATE NOT NULL,
    product_id INT NOT NULL REFERENCES products(id),
    quantity DECIMAL(12,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, in_progress, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Materials consumed in a production order.
CREATE TABLE production_order_materials (
    id SERIAL PRIMARY KEY,
    production_order_id INT NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
    raw_product_id INT NOT NULL REFERENCES products(id),
    quantity DECIMAL(12,4) NOT NULL
);

-- Finished products produced by a production order. Typically one record per order
-- matching the product_id, but this table allows multiple outputs if needed.
CREATE TABLE production_order_products (
    id SERIAL PRIMARY KEY,
    production_order_id INT NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity DECIMAL(12,4) NOT NULL
);

-- Documents table stores file paths to uploaded files (e.g. scanned invoices).
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    document_type VARCHAR(50),
    name VARCHAR(255),
    file_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT REFERENCES users(id)
);

-- Tax and other declarations. Period fields define the reporting period.
CREATE TABLE declarations (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    declaration_type VARCHAR(50),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    filed_date DATE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, filed, submitted
    total_amount DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);