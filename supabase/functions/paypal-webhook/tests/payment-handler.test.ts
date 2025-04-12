
import { handlePaymentEvent } from "../payment-handler.ts";
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { spy, stub } from "https://deno.land/std@0.177.0/testing/mock.ts";

// Mock the dependencies
import * as userData from "../user-data.ts";
import * as supabaseClient from "../supabase-client.ts";
import * as subscriptionService from "../subscription-service.ts";

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
  
  // Mock the updateSubscription function
  const updateSubscriptionMock = stub(subscriptionService, "updateSubscription", () =>
    Promise.resolve({
      user_id: "real-user-123",
      plan_type: "monthly",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date().toISOString(),
    })
  );
  
  try {
    const response = await handlePaymentEvent(testRequestData, false);
    assertEquals(response.status, 200);
    
    const responseBody = await response.json();
    assertEquals(responseBody.success, true);
    
    // Verify that processCustomData was called
    assertEquals(processDataMock.calls.length, 1);
    
    // Verify that updateSubscription was called
    assertEquals(updateSubscriptionMock.calls.length, 1);
    assertEquals(updateSubscriptionMock.calls[0].args[0].user_id, "real-user-123");
    assertEquals(updateSubscriptionMock.calls[0].args[0].plan_type, "monthly");
  } finally {
    // Clean up mocks
    processDataMock.restore();
    updateSubscriptionMock.restore();
  }
});
