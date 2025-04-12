
import { createResponse } from "../response.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

Deno.test("createResponse - returns correct status and headers", async () => {
  const testData = { test: "data" };
  const response = createResponse(testData, 201, { "Custom-Header": "value" });
  
  assertEquals(response.status, 201);
  assertEquals(response.headers.get("Content-Type"), "application/json");
  assertEquals(response.headers.get("Custom-Header"), "value");
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  
  const responseBody = await response.json();
  assertEquals(responseBody.test, "data");
});

Deno.test("createResponse - uses default status 200", () => {
  const response = createResponse({ success: true });
  assertEquals(response.status, 200);
});

Deno.test("createResponse - handles null data", async () => {
  const response = createResponse(null);
  assertEquals(await response.text(), "null");
});
