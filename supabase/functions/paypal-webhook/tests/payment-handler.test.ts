
import { handlePaymentEvent } from "../payment-handler.ts";
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { spy, stub } from "https://deno.land/std@0.177.0/testing/mock.ts";

// Mock the dependencies
import * as userData from "../user-data.ts";
import * as supabaseClient from "../supabase-client.ts";

Deno.test("handlePaymentEvent - simulator mode", async () => {
  const testRequestData = {
    event_type: "PAYMENT.SALE.COMPLETED",
    resource: {
      id: "test-payment-id",
      state: "completed"
    }
  };

  const response = await handlePaymentEvent(testRequestData, true);
  assertEquals(response.status, 200);
  
  const responseBody = await response.json();
  assertEquals(responseBody.success, true);
  assertEquals(responseBody.test_mode, true);
});

Deno.test("handlePaymentEvent - subscription payment", async () => {
  // Create test data with billing_agreement_id to simulate subscription
  const testRequestData = {
    event_type: "PAYMENT.SALE.COMPLETED",
    resource: {
      id: "test-payment-id",
      state: "completed",
      billing_agreement_id: "test-agreement-id",
      custom_id: JSON.stringify({
        user_id: "real-user-123",
        plan_type: "monthly"
      })
    }
  };
  
  // Mock the processCustomData function
  const processDataMock = stub(userData, "processCustomData", () => 
    Promise.resolve({
      user_id: "real-user-123", 
      plan_type: "monthly"
    })
  );
  
  // Mock the Supabase client and its from().update() chain
  const mockUpdate = spy(() => ({ data: {}, error: null }));
  const mockEq = spy(() => ({ data: {}, error: null, update: mockUpdate }));
  const mockFrom = spy(() => ({ eq: mockEq, update: mockUpdate }));
  
  stub(supabaseClient, "getSupabaseClient", () => ({
    from: mockFrom
  }));
  
  try {
    const response = await handlePaymentEvent(testRequestData, false);
    assertEquals(response.status, 200);
    
    const responseBody = await response.json();
    assertEquals(responseBody.success, true);
    
    // Verify that the Supabase client was called correctly
    assertEquals(mockFrom.calls.length, 1);
    assertEquals(mockFrom.calls[0].args[0], "subscriptions");
    
    // Verify the update was called with the right user_id
    assertEquals(mockEq.calls.length, 1);
    assertEquals(mockEq.calls[0].args[0], "user_id");
    assertEquals(mockEq.calls[0].args[1], "real-user-123");
    
    // Verify that processCustomData was called
    assertEquals(processDataMock.calls.length, 1);
  } finally {
    // Clean up mocks
    processDataMock.restore();
  }
});
