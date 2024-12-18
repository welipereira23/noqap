import React from 'react';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrialBannerProps {
  daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  return (
    <div className="bg-indigo-600">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-indigo-800">
              <Clock className="h-6 w-6 text-white" />
            </span>
            <p className="ml-3 font-medium text-white truncate">
              <span className="md:hidden">
                {daysRemaining} dias restantes no período de teste
              </span>
              <span className="hidden md:inline">
                Você tem {daysRemaining} dias restantes no seu período de teste gratuito
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <Link
              to="/subscription"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
            >
              Assinar agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
