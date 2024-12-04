import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, AlertCircle, CheckCircle, Clock, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useStripe } from '../../hooks/useStripe';
import { Link } from 'react-router-dom';

export function SubscriptionStatus() {
  const subscription = useStore((state) => state.subscription);
  const { redirectToPortal } = useStripe();

  if (!subscription) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900">Status da Assinatura</h3>
        </div>
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertCircle className="h-5 w-5" />
          <p>Você ainda não possui uma assinatura ativa.</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    trialing: 'text-blue-600',
    active: 'text-green-600',
    canceled: 'text-red-600',
    incomplete: 'text-yellow-600',
    incomplete_expired: 'text-gray-600',
    past_due: 'text-orange-600',
    unpaid: 'text-red-600',
    paused: 'text-gray-600',
  };

  const statusMessages = {
    trialing: 'Período de Teste',
    active: 'Assinatura Ativa',
    canceled: 'Assinatura Cancelada',
    incomplete: 'Pagamento Pendente',
    incomplete_expired: 'Pagamento Expirado',
    past_due: 'Pagamento Atrasado',
    unpaid: 'Pagamento não Realizado',
    paused: 'Assinatura Pausada',
  };

  const handleManageSubscription = async () => {
    if (subscription.stripe_customer_id) {
      await redirectToPortal(subscription.stripe_customer_id);
    }
  };

  // Calcular dias restantes do período de teste
  const trialDaysLeft = subscription.trial_end 
    ? differenceInDays(new Date(subscription.trial_end), new Date())
    : 0;

  // Verificar se o trial está próximo do fim (3 dias ou menos)
  const isTrialEnding = subscription.status === 'trialing' && trialDaysLeft <= 3 && trialDaysLeft > 0;

  // Verificar se o trial expirou
  const isTrialExpired = subscription.status === 'trialing' && trialDaysLeft <= 0;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-medium text-gray-900">Status da Assinatura</h3>
      </div>

      <div className="space-y-4">
        {/* Status da Assinatura */}
        <div className="flex items-center space-x-2">
          <CheckCircle className={`h-5 w-5 ${statusColors[subscription.status]}`} />
          <span className={`font-medium ${statusColors[subscription.status]}`}>
            {statusMessages[subscription.status]}
          </span>
        </div>

        {/* Aviso de Trial Expirando */}
        {isTrialEnding && (
          <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5" />
            <span>
              Seu período de teste termina em {trialDaysLeft} {trialDaysLeft === 1 ? 'dia' : 'dias'}. 
              Assine agora para continuar usando todos os recursos.
            </span>
          </div>
        )}

        {/* Aviso de Trial Expirado */}
        {isTrialExpired && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertOctagon className="h-5 w-5" />
            <span>
              Seu período de teste expirou. Assine agora para continuar usando todos os recursos.
            </span>
          </div>
        )}

        {/* Dias Restantes do Trial */}
        {subscription.status === 'trialing' && trialDaysLeft > 0 && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Clock className="h-5 w-5" />
            <span>
              {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'} no período de teste
            </span>
          </div>
        )}

        {/* Datas */}
        <div className="text-sm text-gray-600 space-y-1">
          {subscription.current_period_start && (
            <p>
              Início do período atual:{' '}
              {format(new Date(subscription.current_period_start), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          )}
          {subscription.current_period_end && (
            <p>
              Fim do período atual:{' '}
              {format(new Date(subscription.current_period_end), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          )}
          {subscription.trial_end && subscription.status === 'trialing' && (
            <p>
              Fim do período de teste:{' '}
              {format(new Date(subscription.trial_end), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          )}
        </div>

        {/* Botão de Gerenciar Assinatura */}
        {isTrialExpired ? (
          <Link
            to="/subscription"
            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-center"
          >
            Assinar agora
          </Link>
        ) : (
          <button
            onClick={handleManageSubscription}
            className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Gerenciar Assinatura
          </button>
        )}
      </div>
    </div>
  );
}