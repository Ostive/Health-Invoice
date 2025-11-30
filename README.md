# Health Invoice App (Facturier Soignant AI)

A modern, AI-powered invoicing application designed specifically for healthcare professionals. Streamline your billing process with automated invoice generation, client management, and professional PDF templates.

## Features

*   **AI-Powered Invoicing:** Generate invoices quickly and accurately.
*   **Professional PDF Templates:** Choose from multiple designs (Modern, Classic, Minimalist, Elegant, Corporate) to match your brand.
*   **Client Management:** Easily manage patient/client details.
*   **Dashboard:** Track your earnings and invoice status (Paid, Pending, Overdue).
*   **Secure:** Built with Supabase for secure authentication and data storage.
*   **Stripe Integration:** Manage subscriptions and payments seamlessly.

## Tech Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database & Auth:** Supabase
*   **PDF Generation:** @react-pdf/renderer
*   **Payments:** Stripe

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Ostive/Health-Invoice.git
    cd Health-Invoice
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory and add your Supabase and Stripe credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    STRIPE_SECRET_KEY=your_stripe_secret_key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add your environment variables in the Vercel dashboard.
4.  Deploy!

## License

[MIT](LICENSE)
