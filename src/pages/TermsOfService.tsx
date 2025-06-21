
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
              provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of TaskPro per device for 
              personal, non-commercial transitory viewing only.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>This is the grant of a license, not a transfer of title</li>
              <li>Under this license you may not modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained in TaskPro</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Subscription Terms</h2>
            <p>
              TaskPro offers subscription-based services. By subscribing, you agree to pay the 
              applicable subscription fees on a recurring basis until you cancel your subscription.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You may cancel your subscription at any time</li>
              <li>Refunds are handled according to our refund policy</li>
              <li>We reserve the right to change subscription prices with notice</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Limitations</h2>
            <p>
              In no event shall TaskPro or its suppliers be liable for any damages arising out of 
              the use or inability to use TaskPro.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at 
              terms@taskpro.app
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
