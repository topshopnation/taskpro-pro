
import { AppLayout } from "@/components/layout/AppLayout";

export default function TermsOfService() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
            <p>
              By accessing and using TaskPro, you accept and agree to be bound by the terms and 
              provision of this agreement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Description of Service</h2>
            <p>
              TaskPro is a task management application that allows users to create, organize, 
              and track their tasks and projects.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password 
              and for restricting access to your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Subscription Terms</h2>
            <p>
              TaskPro offers both free and paid subscription plans. Paid subscriptions will be 
              charged according to the plan you select.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You can cancel your subscription at any time</li>
              <li>Refunds are handled according to the payment processor's policies</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            <p>
              TaskPro shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at legal@taskpro.app
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
