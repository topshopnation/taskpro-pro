
import { runTests } from "https://deno.land/std@0.177.0/testing/mod.ts";

// Import all test files so they're included in the test run
import "./tests/user-data.test.ts";
import "./tests/payment-handler.test.ts";
import "./tests/validator.test.ts";
import "./tests/response.test.ts";
import "./tests/error-utils.test.ts";
import "./tests/subscription-service.test.ts";

runTests({
  // Filter which tests to run
  only: Deno.args.length ? new RegExp(Deno.args[0]) : undefined,
  // Allow parallel tests
  parallel: true,
});

console.log("PayPal webhook test runner complete");
