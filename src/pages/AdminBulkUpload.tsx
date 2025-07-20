import { ConciergeOnboardingForm } from "@/components/ConciergeOnboardingForm";

export default function AdminBulkUpload() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Concierge Onboarding</h1>
        <p className="text-slate-600 mt-2">
          Onboard new customers via phone and generate their documents for signature.
        </p>
      </div>

      <ConciergeOnboardingForm />
    </div>
  );
}