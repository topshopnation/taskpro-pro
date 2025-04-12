
import { validateWebhookRequest } from "../validator.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

Deno.test("validateWebhookRequest - parses JSON correctly", async () => {
  const mockPayload = JSON.stringify({
    event_type: "PAYMENT.SALE.COMPLETED",
    resource: { id: "test-id" }
  });
  
  const mockRequest = new Request("https://example.com/webhook", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "paypal-transmission-id": "mock-id"
    }),
    body: mockPayload
  });
  
  const { requestData, headersObj, isSimulator } = await validateWebhookRequest(mockRequest);
  
  assertEquals(requestData.event_type, "PAYMENT.SALE.COMPLETED");
  assertEquals(requestData.resource.id, "test-id");
  assertEquals(headersObj["content-type"], "application/json");
  assertEquals(headersObj["paypal-transmission-id"], "mock-id");
});

Deno.test("validateWebhookRequest - detects simulator requests", async () => {
  // Case 1: Simulator in transmission ID
  const mockRequest1 = new Request("https://example.com/webhook", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "paypal-transmission-id": "simulator-12345"
    }),
    body: JSON.stringify({ event_type: "TEST.EVENT" })
  });
  
  const result1 = await validateWebhookRequest(mockRequest1);
  assertEquals(result1.isSimulator, true);
  
  // Case 2: WH-TEST in event ID
  const mockRequest2 = new Request("https://example.com/webhook", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ 
      id: "WH-TEST-12345",
      event_type: "TEST.EVENT" 
    })
  });
  
  const result2 = await validateWebhookRequest(mockRequest2);
  assertEquals(result2.isSimulator, true);
  
  // Case 3: test flag set to true
  const mockRequest3 = new Request("https://example.com/webhook", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ 
      test: true,
      event_type: "TEST.EVENT" 
    })
  });
  
  const result3 = await validateWebhookRequest(mockRequest3);
  assertEquals(result3.isSimulator, true);
});

Deno.test("validateWebhookRequest - handles invalid JSON", async () => {
  const mockRequest = new Request("https://example.com/webhook", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: "{invalid-json}"
  });
  
  try {
    await validateWebhookRequest(mockRequest);
    // Should not reach here
    assertEquals(true, false, "Should have thrown an error");
  } catch (error) {
    assertEquals(error.message, "Invalid JSON payload");
  }
});
