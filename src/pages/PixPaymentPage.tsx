import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PixPayment from '@/components/PixPayment';
import SEOHead from '@/components/SEOHead';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
}

const PixPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('ID do pedido não fornecido');
      setIsLoading(false);
      return;
    }

    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      if (!orderData) {
        throw new Error('Pedido não encontrado');
      }

      if (orderData.payment_method !== 'pix') {
        throw new Error('Este pedido não é para pagamento PIX');
      }

      if (orderData.status === 'confirmed') {
        // Pedido já foi pago, redirecionar para confirmação
        navigate(`/confirmacao?order=${orderId}`);
        return;
      }

      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      setError(error.message || 'Erro ao carregar pedido');
      toast({
        title: "Erro ao carregar pedido",
        description: error.message || "Verifique o link e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentConfirmed = () => {
    navigate(`/confirmacao?order=${orderId}`);
  };

  const handlePaymentCancelled = () => {
    toast({
      title: "Pagamento cancelado",
      description: "Você pode tentar novamente ou entrar em contato conosco.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Erro - Pagamento PIX - Kija Açaí"
          description="Erro ao carregar pagamento PIX"
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 text-center">
                  Erro ao carregar pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {error || 'Não foi possível carregar os dados do pedido.'}
                </p>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Início
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.history.back()}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Pagamento PIX - Kija Açaí"
        description="Finalize seu pedido com pagamento PIX instantâneo"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Pagamento PIX</h1>
            <p className="text-muted-foreground">
              Pedido #{order.id.slice(0, 8)} - {order.customer_name}
            </p>
          </div>

          {/* PIX Payment Component */}
          <div className="mb-8">
            <PixPayment
              orderId={order.id}
              amount={order.total_amount}
              customerEmail={order.customer_email}
              customerName={order.customer_name}
              onPaymentConfirmed={handlePaymentConfirmed}
              onPaymentCancelled={handlePaymentCancelled}
            />
          </div>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Precisa de ajuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Se você está tendo problemas com o pagamento PIX:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verifique se seu aplicativo bancário está atualizado</li>
                <li>• Certifique-se de ter saldo ou limite disponível</li>
                <li>• O PIX expira em 30 minutos após a geração</li>
                <li>• Entre em contato conosco se o problema persistir</li>
              </ul>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="w-full gap-2"
                >
                  <Home className="h-4 w-4" />
                  Voltar ao início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PixPaymentPage;