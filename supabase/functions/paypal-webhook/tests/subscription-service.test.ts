
import { calculatePeriodEnd } from "../subscription-service.ts";
import { assertEquals, assertThrows } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { ValidationError } from "../error-utils.ts";

Deno.test("calculatePeriodEnd - monthly plan", () => {
  const now = new Date();
  const result = calculatePeriodEnd("monthly");
  
  // Calculate expected date (1 month from now)
  const expected = new Date(now);
  expected.setMonth(expected.getMonth() + 1);
  
  // Compare year, month, and date only (ignoring time differences)
  assertEquals(result.getFullYear(), expected.getFullYear());
  assertEquals(result.getMonth(), expected.getMonth());
  assertEquals(result.getDate(), expected.getDate());
});

Deno.test("calculatePeriodEnd - yearly plan", () => {
  const now = new Date();
  const result = calculatePeriodEnd("yearly");
  
  // Calculate expected date (1 year from now)
  const expected = new Date(now);
  expected.setFullYear(expected.getFullYear() + 1);
  
  // Compare year, month, and date only (ignoring time differences)
  assertEquals(result.getFullYear(), expected.getFullYear());
  assertEquals(result.getMonth(), expected.getMonth());
  assertEquals(result.getDate(), expected.getDate());
});

Deno.test("calculatePeriodEnd - invalid plan type", () => {
  assertThrows(
    () => calculatePeriodEnd("invalid"),
    ValidationError,
    "Invalid plan type"
  );
});
