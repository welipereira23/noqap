import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Trial {
  days: number;
  text: string;
}

interface Plan {
  name: string;
  price: number;
  priceId: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  recommended?: boolean;
  trial?: Trial;
}

interface PlanCardProps {
  plan: Plan;
  onSelect: () => void;
  isLoading: boolean;
}

export function PlanCard({ plan, onSelect, isLoading }: PlanCardProps) {
  const { name, price, interval, features, recommended, trial } = plan;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${recommended ? 'ring-2 ring-indigo-600' : ''}`}>
      {recommended && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-4">
          Recomendado
        </span>
      )}
      
      <h3 className="text-lg font-medium text-gray-900">{name}</h3>
      
      <div className="mt-4">
        <span className="text-3xl font-bold text-gray-900">R$ {price.toFixed(2)}</span>
        <span className="text-gray-500">/{interval === 'month' ? 'mês' : 'ano'}</span>
      </div>

      {trial && (
        <div className="mt-2">
          <span className="text-sm text-indigo-600 font-medium">{trial.text}</span>
          <span className="text-xs text-gray-500 block">
            Cancele a qualquer momento durante o período de teste
          </span>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className={`h-5 w-5 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={`ml-3 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-500'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isLoading}
        className={`mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${recommended 
            ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
            : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Assinar agora'
        )}
      </button>
    </div>
  );
}