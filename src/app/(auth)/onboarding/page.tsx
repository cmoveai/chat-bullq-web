import { Suspense } from 'react';
import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard';

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Suspense>
        <OnboardingWizard />
      </Suspense>
    </div>
  );
}
