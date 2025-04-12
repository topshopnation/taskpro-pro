
import { processCustomData, UserData } from "../user-data.ts";
import { ValidationError } from "../error-utils.ts";
import { assertEquals, assertRejects } from "https://deno.land/std@0.177.0/testing/asserts.ts";

Deno.test("processCustomData - valid JSON input", async () => {
  const validJson = JSON.stringify({
    user_id: "test-user-123",
    plan_type: "monthly"
  });
  
  const result = await processCustomData(validJson, false);
  assertEquals(result.user_id, "test-user-123");
  assertEquals(result.plan_type, "monthly");
});

Deno.test("processCustomData - invalid JSON input", async () => {
  const invalidJson = "{broken-json}";
  
  await assertRejects(
    async () => await processCustomData(invalidJson, false),
    ValidationError,
    "Invalid JSON format in custom data"
  );
});

Deno.test("processCustomData - missing required fields", async () => {
  const missingFieldsJson = JSON.stringify({
    user_id: "test-user-123"
    // missing plan_type
  });
  
  await assertRejects(
    async () => await processCustomData(missingFieldsJson, false),
    ValidationError,
    "Missing plan_type in custom data"
  );
});

Deno.test("processCustomData - invalid plan type", async () => {
  const invalidPlanJson = JSON.stringify({
    user_id: "test-user-123",
    plan_type: "invalid-plan"
  });
  
  await assertRejects(
    async () => await processCustomData(invalidPlanJson, false),
    ValidationError,
    "Invalid plan_type: invalid-plan, must be 'monthly' or 'yearly'"
  );
});

Deno.test("processCustomData - non-string user_id", async () => {
  const invalidUserIdJson = JSON.stringify({
    user_id: 12345,
    plan_type: "monthly"
  });
  
  await assertRejects(
    async () => await processCustomData(invalidUserIdJson, false),
    ValidationError,
    "Expected user_id to be a string"
  );
});

Deno.test("processCustomData - simulator mode", async () => {
  const result = await processCustomData(null, true);
  
  assertEquals(result.user_id, "test-user-id-from-simulator");
  assertEquals(result.plan_type, "monthly");
});
