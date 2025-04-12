
import { 
  WebhookError, 
  ValidationError, 
  PaymentProcessingError, 
  DatabaseError,
  handleError,
  validateRequiredFields
} from "../error-utils.ts";
import { assertEquals, assertThrows } from "https://deno.land/std@0.177.0/testing/asserts.ts";

Deno.test("WebhookError - creates error with statusCode", () => {
  const error = new WebhookError("Test error", 418);
  assertEquals(error.message, "Test error");
  assertEquals(error.statusCode, 418);
  assertEquals(error.name, "WebhookError");
});

Deno.test("ValidationError - creates error with correct prefix and status", () => {
  const error = new ValidationError("Missing field");
  assertEquals(error.message, "Validation error: Missing field");
  assertEquals(error.statusCode, 400);
  assertEquals(error.name, "ValidationError");
});

Deno.test("PaymentProcessingError - creates error with correct prefix and status", () => {
  const error = new PaymentProcessingError("Invalid payment");
  assertEquals(error.message, "Payment processing error: Invalid payment");
  assertEquals(error.statusCode, 422);
  assertEquals(error.name, "PaymentProcessingError");
});

Deno.test("DatabaseError - creates error with correct prefix and status", () => {
  const error = new DatabaseError("Connection failed");
  assertEquals(error.message, "Database error: Connection failed");
  assertEquals(error.statusCode, 500);
  assertEquals(error.name, "DatabaseError");
});

Deno.test("handleError - handles WebhookError correctly", async () => {
  const error = new ValidationError("Test validation error");
  const response = handleError(error);
  
  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Validation error: Test validation error");
  assertEquals(body.type, "ValidationError");
});

Deno.test("handleError - handles generic Error correctly", async () => {
  const error = new Error("Generic error");
  const response = handleError(error);
  
  assertEquals(response.status, 500);
  const body = await response.json();
  assertEquals(body.error, "Generic error");
});

Deno.test("handleError - handles non-Error correctly", async () => {
  const error = "String error";
  const response = handleError(error);
  
  assertEquals(response.status, 500);
  const body = await response.json();
  assertEquals(body.error, "Unknown error occurred");
});

Deno.test("validateRequiredFields - throws error on missing fields", () => {
  const testObj = { field1: "value1" };
  
  assertThrows(
    () => validateRequiredFields(testObj, ["field1", "field2", "field3"]),
    ValidationError,
    "Missing required fields: field2, field3"
  );
});

Deno.test("validateRequiredFields - passes with all fields present", () => {
  const testObj = { field1: "value1", field2: "value2", field3: "value3" };
  
  // Should not throw an error
  validateRequiredFields(testObj, ["field1", "field2", "field3"]);
});
