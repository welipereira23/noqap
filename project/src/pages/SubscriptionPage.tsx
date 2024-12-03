import { SubscriptionPlan } from '../components/SubscriptionPlan';

export function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Escolha seu plano
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Comece a controlar seu tempo de forma profissional hoje mesmo.
          </p>
        </div>
        <SubscriptionPlan />
      </div>
    </div>
  );
}
