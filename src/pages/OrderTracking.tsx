import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  Phone, 
  Mail,
  Search,
  AlertCircle,
  Star
} from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_method: string;
  delivery_address: string;
  delivery_city: string;
  delivery_neighborhood: string;
  delivery_zipcode: string;
  created_at: string;
  updated_at: string;
  estimated_delivery: string | null;
  order_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    product_price: number;
    subtotal: number;
    customizations: string | null;
  }>;
}

const OrderTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('order') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('order')) {
      searchOrder(searchParams.get('order')!);
    }
  }, [searchParams]);

  const searchOrder = async (orderId: string) => {
    if (!orderId.trim()) {
      setError('Digite o ID do pedido');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Try to find by full ID or partial ID
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            product_price,
            subtotal,
            customizations
          )
        `)
        .or(`id.eq.${orderId},id.ilike.${orderId}%`)
        .single();

      if (error || !data) {
        setError('Pedido não encontrado. Verifique o ID e tente novamente.');
        setOrder(null);
        return;
      }

      setOrder(data);
      
    } catch (error) {
      console.error('Error searching order:', error);
      setError('Erro ao buscar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Pedido Recebido',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Pronto para Retirada',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'preparing':
        return <Package className="h-5 w-5 text-purple-600" />;
      case 'ready':
        return <Star className="h-5 w-5 text-green-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Recebido', description: 'Pedido foi recebido' },
    { key: 'confirmed', label: 'Confirmado', description: 'Pedido confirmado' },
    { key: 'preparing', label: 'Preparando', description: 'Açaí sendo preparado' },
    { key: 'ready', label: 'Pronto', description: 'Pronto para retirada/entrega' },
    { key: 'delivered', label: 'Entregue', description: 'Pedido entregue' },
  ];

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Acompanhar Pedido - Kija Açaí"
        description="Acompanhe seu pedido de açaí em tempo real. Digite o ID do pedido para ver o status atualizado."
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Acompanhar Pedido</h1>
          <p className="text-muted-foreground">
            Digite o ID do seu pedido para acompanhar o status em tempo real
          </p>
        </div>

        {/* Search */}
        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="order-search">ID do Pedido</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="order-search"
                    placeholder="Digite o ID do pedido (ex: A1B2C3D4)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && searchOrder(searchQuery)}
                  />
                  <Button 
                    onClick={() => searchOrder(searchQuery)}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Você pode encontrar o ID do pedido no email de confirmação que enviamos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  Status: {getStatusLabel(order.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="flex justify-between items-center">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getCurrentStepIndex(order.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center text-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            isCompleted 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="text-sm font-medium">{step.label}</div>
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ 
                        width: `${(getCurrentStepIndex(order.status) / (statusSteps.length - 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Pedido:</span>
                      <Badge variant="outline" className="font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="text-lg font-bold">
                      R$ {order.total_amount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Pagamento:</span>
                    <Badge variant="outline">
                      {order.payment_method === 'pix' ? 'PIX' : 
                       order.payment_method === 'credit' ? 'Cartão de Crédito' :
                       order.payment_method === 'debit' ? 'Cartão de Débito' :
                       order.payment_method === 'money' ? 'Dinheiro' : order.payment_method}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="font-medium mb-2">Data do Pedido:</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {order.estimated_delivery && (
                    <div>
                      <div className="font-medium mb-2">Previsão de Entrega:</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.estimated_delivery).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer & Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle>Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium mb-2">Cliente:</div>
                    <div className="text-sm">{order.customer_name}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone:
                    </div>
                    <div className="text-sm">{order.customer_phone}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Endereço:
                    </div>
                    <div className="text-sm">
                      {order.delivery_address}<br />
                      {order.delivery_neighborhood}<br />
                      {order.delivery_city} - {order.delivery_zipcode}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-start border-b pb-4 last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity} × R$ {item.product_price.toFixed(2).replace('.', ',')}
                        </p>
                        {item.customizations && (
                          <p className="text-xs text-blue-600 mt-1">
                            Personalizações: {item.customizations}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {item.subtotal.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold">Dúvidas sobre seu pedido?</h3>
                  <p className="text-sm text-muted-foreground">
                    Entre em contato conosco pelo WhatsApp ou email
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="gap-2">
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;