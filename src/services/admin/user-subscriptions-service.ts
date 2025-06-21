
import { adminDatabaseService } from "./admin-database-service";

export const userSubscriptionsService = {
  async getUserSubscriptions() {
    return adminDatabaseService.getAllSubscriptions();
  },

  async updateUserSubscription(subscriptionId: string, updates: { status?: string; plan_type?: string }) {
    // This will be handled by the user-management-service
    throw new Error("Use userManagementService.updateUserSubscription instead");
  }
};
