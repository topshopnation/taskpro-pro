
# PayPal Webhook Handler

This Edge Function processes PayPal webhook events for subscription management.

## Features

- Handles PayPal subscription events (creation, renewal, cancellation)
- Updates subscription status in the database
- Processes custom data for user identification
- Supports testing mode for development
- Robust error handling and validation

## Error Handling

The webhook handler includes comprehensive error handling:

- **Validation Errors**: Ensures all required fields and formats are valid
- **Payment Processing Errors**: Handles issues with payment data
- **Database Errors**: Manages database connection and query issues
- **General Error Handling**: Catches and reports all other errors

## Testing

The function includes unit tests to ensure proper operation. To run tests:

```bash
cd supabase/functions/paypal-webhook
deno test --allow-env
```

Or run a specific test file:

```bash
deno test --allow-env tests/user-data.test.ts
```

To run all tests with the test runner script:

```bash
deno run --allow-env --allow-read run-tests.ts
```

## Webhook Events

The function handles these PayPal webhook events:

- `PAYMENT.SALE.COMPLETED`
- `CHECKOUT.ORDER.APPROVED`
- `BILLING.SUBSCRIPTION.CREATED`
- `BILLING.SUBSCRIPTION.RENEWED`
- `BILLING.SUBSCRIPTION.CANCELLED`

## Configuration

Requires a Supabase service role key and PayPal webhook ID to be set as environment variables:

- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PAYPAL_WEBHOOK_ID` - PayPal webhook ID for verification (optional for simulator)

## Development

To test with the PayPal simulator:
1. Send a POST request to your webhook endpoint with example payload
2. Check the logs to ensure the function correctly identifies simulator requests
3. No database changes will be made in simulator mode
