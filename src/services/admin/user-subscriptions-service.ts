
import { adminDatabaseService } from "./admin-database-service";

export const userSubscriptionsService = {
  async getUserSubscriptions() {
    return adminDatabaseService.getAllSubscriptions();
  }
};
