import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';

export function AccessPage() {
  const [paymentLink] = useState('https://nubank.com.br/cobrar/xbbuq/6756ed14-3da5-47c4-bc13-3ae656ca4aa2');
  const [whatsappLink] = useState('https://wa.me/553488243778?text=Olá! Acabei de fazer o pagamento para ter acesso ao sistema.');
  const user = useStore(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!user?.id) {
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_blocked')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar status de bloqueio:', error);
          return;
        }

        // Se o usuário não estiver bloqueado, redireciona para o dashboard
        if (!data?.is_blocked) {
          console.log('Usuário não está bloqueado, redirecionando para o dashboard');
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };

    checkBlockStatus();
  }, [user?.id, navigate]);

  const copyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      toast.success('Link copiado com sucesso!');
    } catch (err) {
      toast.error('Erro ao copiar o link');
    }
  };

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Bolt
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Controle total da sua carga horária por menos de R$ 5 reais por mês."
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Acesso ao Sistema</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">
                Controle total da sua carga horária por menos de R$ 5 reais por mês.
              </p>
              
              <p>
                Faça o pagamento e acesse por 1 ano.
              </p>
              
              <div className="flex justify-center">
                <img
                  src="/qr-code-payment.png"
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={copyPaymentLink}
              >
                Copiar Link do PIX
              </Button>

              <p className="text-sm text-muted-foreground mt-4">
                Após o pagamento, envie o comprovante pelo WhatsApp:
              </p>

              <Link
                to={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-green-500 hover:text-green-600"
              >
                <img src="/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" />
                <span>Enviar Comprovante</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
