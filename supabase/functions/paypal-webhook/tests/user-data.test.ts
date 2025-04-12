
import { processCustomData, UserData } from "../user-data.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

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
  let error: Error | null = null;
  
  try {
    await processCustomData(invalidJson, false);
  } catch (e) {
    error = e;
  }
  
  assertEquals(error instanceof Error, true);
  assertEquals(error?.message, "Invalid custom data format");
});

Deno.test("processCustomData - missing required fields", async () => {
  const missingFieldsJson = JSON.stringify({
    user_id: "test-user-123"
    // missing plan_type
  });
  
  let error: Error | null = null;
  
  try {
    await processCustomData(missingFieldsJson, false);
  } catch (e) {
    error = e;
  }
  
  assertEquals(error instanceof Error, true);
  assertEquals(error?.message, "Missing user_id or plan_type");
});

Deno.test("processCustomData - invalid plan type", async () => {
  const invalidPlanJson = JSON.stringify({
    user_id: "test-user-123",
    plan_type: "invalid-plan"
  });
  
  let error: Error | null = null;
  
  try {
    await processCustomData(invalidPlanJson, false);
  } catch (e) {
    error = e;
  }
  
  assertEquals(error instanceof Error, true);
  assertEquals(error?.message, "Invalid plan_type, must be 'monthly' or 'yearly'");
});

Deno.test("processCustomData - simulator mode", async () => {
  const result = await processCustomData(null, true);
  
  assertEquals(result.user_id, "test-user-id-from-simulator");
  assertEquals(result.plan_type, "monthly");
});
