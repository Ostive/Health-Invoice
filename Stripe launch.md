```bash
# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger a test webhook manually
stripe trigger checkout.session.completed

# View recent events
stripe events list

# View specific event
stripe events retrieve evt_xxx
```