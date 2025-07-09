import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Eye, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  MessageSquare,
  RefreshCw,
  FileText,
  AlertTriangle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  customizations: string | null;
}

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
  notes: string | null;
  created_at: string;
  updated_at: string;
  estimated_delivery: string | null;
  delivery_fee: number | null;
  discount_amount: number | null;
  promotion_code: string | null;
  order_items?: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    fetchOrders();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          fetchOrders(); // Refresh when any order changes
          toast({
            title: "Pedido atualizado",
            description: "A lista foi atualizada automaticamente.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            product_price,
            quantity,
            subtotal,
            customizations
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (order: Order, newStatus: string, note?: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'delivered') {
        updateData.estimated_delivery = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      // Send notification email to customer
      await sendStatusNotification(order, newStatus, note);

      await fetchOrders();
      toast({
        title: "Status atualizado",
        description: `Pedido #${order.id.slice(0, 8)} atualizado para ${getStatusLabel(newStatus)}.`,
      });

      setShowStatusDialog(false);
      setStatusNote('');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const sendStatusNotification = async (order: Order, status: string, note?: string) => {
    try {
      await supabase.functions.invoke('send-order-notification', {
        body: {
          order_id: order.id,
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          status: status,
          note: note,
          order_details: {
            total: order.total_amount,
            items: order.order_items || []
          }
        }
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      // Don't block the status update if notification fails
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Pronto para Retirada',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: 'outline',
      confirmed: 'default',
      preparing: 'secondary',
      ready: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return variantMap[status] || 'outline';
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      preparing: 'text-purple-600',
      ready: 'text-green-600',
      delivered: 'text-emerald-600',
      cancelled: 'text-red-600',
    };
    return colorMap[status] || 'text-gray-600';
  };

  const filterOrdersByDate = (orders: Order[]) => {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === now.toDateString();
        });
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orders.filter(order => new Date(order.created_at) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orders.filter(order => new Date(order.created_at) >= monthAgo);
      default:
        return orders;
    }
  };

  const filteredOrders = filterOrdersByDate(orders).filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (order: Order, status: string) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Statistics for dashboard
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    todayRevenue: orders
      .filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.total_amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Pedidos</h1>
          <p className="text-muted-foreground">Visualize, gerencie e acompanhe todos os pedidos em tempo real</p>
        </div>
        <Button onClick={() => fetchOrders()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">Total de Pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{orderStats.preparing}</div>
            <p className="text-xs text-muted-foreground">Preparando</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{orderStats.ready}</div>
            <p className="text-xs text-muted-foreground">Prontos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{orderStats.delivered}</div>
            <p className="text-xs text-muted-foreground">Entregues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">
              R$ {orderStats.todayRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Receita Hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, email, telefone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="preparing">Preparando</SelectItem>
                <SelectItem value="ready">Pronto</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Pedidos ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-mono text-sm font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                    {order.promotion_code && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Cupom: {order.promotion_code}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {order.customer_email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {order.customer_phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {order.delivery_neighborhood}, {order.delivery_city}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.order_items?.length || 0} item(s)
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {order.order_items[0].product_name}
                          {order.order_items.length > 1 && ` +${order.order_items.length - 1} mais`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-lg">
                      R$ {order.total_amount.toFixed(2).replace('.', ',')}
                    </div>
                    {order.delivery_fee && (
                      <div className="text-xs text-muted-foreground">
                        Taxa: R$ {order.delivery_fee.toFixed(2).replace('.', ',')}
                      </div>
                    )}
                    {order.discount_amount && (
                      <div className="text-xs text-green-600">
                        Desconto: -R$ {order.discount_amount.toFixed(2).replace('.', ',')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getStatusVariant(order.status)}
                        className={`cursor-pointer ${getStatusColor(order.status)}`}
                        onClick={() => handleStatusChange(order, order.status)}
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                      {order.status === 'ready' && (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {order.payment_method === 'pix' ? 'PIX' : 
                       order.payment_method === 'credit' ? 'Cartão de Crédito' :
                       order.payment_method === 'debit' ? 'Cartão de Débito' :
                       order.payment_method === 'money' ? 'Dinheiro' : order.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {order.updated_at !== order.created_at && (
                      <div className="text-xs text-blue-600">
                        Atualizado: {new Date(order.updated_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStatusChange(order, order.status)}
                        className="h-8 w-8 p-0"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes do Pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Informações completas do pedido e itens
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-sm">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Telefone</Label>
                    <p className="text-sm">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Endereço de Entrega</Label>
                    <p className="text-sm">
                      {selectedOrder.delivery_address}<br />
                      {selectedOrder.delivery_neighborhood}<br />
                      {selectedOrder.delivery_city} - {selectedOrder.delivery_zipcode}
                    </p>
                  </div>
                  {selectedOrder.notes && (
                    <div>
                      <Label className="text-sm font-medium">Observações</Label>
                      <p className="text-sm bg-muted p-2 rounded">{selectedOrder.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Itens do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-start border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantity} × R$ {item.product_price.toFixed(2).replace('.', ',')}
                          </p>
                          {item.customizations && (
                            <p className="text-xs text-blue-600">
                              Personalizações: {item.customizations}
                            </p>
                          )}
                        </div>
                        <p className="font-medium">
                          R$ {item.subtotal.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>R$ {((selectedOrder.total_amount || 0) - (selectedOrder.delivery_fee || 0) + (selectedOrder.discount_amount || 0)).toFixed(2).replace('.', ',')}</span>
                      </div>
                      {selectedOrder.delivery_fee && (
                        <div className="flex justify-between text-sm">
                          <span>Taxa de entrega</span>
                          <span>R$ {selectedOrder.delivery_fee.toFixed(2).replace('.', ',')}</span>
                        </div>
                      )}
                      {selectedOrder.discount_amount && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Desconto</span>
                          <span>-R$ {selectedOrder.discount_amount.toFixed(2).replace('.', ',')}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>R$ {selectedOrder.total_amount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status do Pedido</DialogTitle>
            <DialogDescription>
              Atualize o status do pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()} e adicione uma nota se necessário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Novo Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Pronto para Retirada</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="note">Nota Interna (Opcional)</Label>
              <Textarea
                id="note"
                placeholder="Adicione uma nota sobre esta atualização de status..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedOrder && updateOrderStatus(selectedOrder, newStatus, statusNote)}
              disabled={!newStatus}
            >
              Atualizar Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;