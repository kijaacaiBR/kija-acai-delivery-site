import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { MapPin, CreditCard, User, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';

const checkoutSchema = z.object({
  // Step 1: Customer Info
  customer_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  
  // Step 2: Delivery Address
  delivery_zipcode: z.string().min(8, 'CEP deve ter 8 dígitos'),
  delivery_address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  delivery_neighborhood: z.string().min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  delivery_city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  
  // Step 3: Payment
  payment_method: z.enum(['credit', 'debit', 'pix', 'money'], {
    required_error: 'Selecione uma forma de pagamento',
  }),
  
  // Optional
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      delivery_zipcode: '',
      delivery_address: '',
      delivery_neighborhood: '',
      delivery_city: '',
      payment_method: 'pix',
      notes: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, trigger } = form;

  const deliveryFee = 5.00;
  const totalWithDelivery = total + deliveryFee;

  const stepTitles = [
    { number: 1, title: 'Dados Pessoais', icon: User },
    { number: 2, title: 'Endereço', icon: MapPin },
    { number: 3, title: 'Pagamento', icon: CreditCard },
    { number: 4, title: 'Confirmação', icon: FileText },
  ];

  const nextStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ['customer_name', 'customer_email', 'customer_phone'];
        break;
      case 2:
        fieldsToValidate = ['delivery_zipcode', 'delivery_address', 'delivery_neighborhood', 'delivery_city'];
        break;
      case 3:
        fieldsToValidate = ['payment_method'];
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid && step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          delivery_address: data.delivery_address,
          delivery_neighborhood: data.delivery_neighborhood,
          delivery_city: data.delivery_city,
          delivery_zipcode: data.delivery_zipcode,
          payment_method: data.payment_method,
          notes: data.notes || null,
          total_amount: totalWithDelivery,
          delivery_fee: deliveryFee,
          status: (data.payment_method === 'pix' ? 'pending_payment' : 'pending') as any,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        customizations: item.customizations?.join(', ') || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and show success
      clearCart();
      
      if (data.payment_method === 'pix') {
        toast({
          title: "Pedido criado!",
          description: "Agora finalize o pagamento via PIX.",
        });
        
        // Redirect to PIX payment page
        window.location.href = `/pagamento-pix?order=${order.id}`;
      } else {
        toast({
          title: "Pedido realizado com sucesso!",
          description: `Seu pedido #${order.id.slice(0, 8)} foi enviado para a cozinha.`,
        });
        
        // Redirect to order confirmation page
        window.location.href = `/confirmacao?order=${order.id}`;
      }

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carrinho vazio</h2>
          <p className="text-muted-foreground mb-4">Adicione alguns produtos antes de finalizar o pedido.</p>
          <Button onClick={() => window.location.href = '/'}>
            Voltar ao cardápio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Finalizar Pedido - Kija Açaí"
        description="Finalize seu pedido de açaí artesanal. Entrega rápida e segura."
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <Progress value={(step / 4) * 100} className="mb-4" />
          <div className="flex justify-between text-sm">
            {stepTitles.map((stepInfo) => {
              const Icon = stepInfo.icon;
              return (
                <div
                  key={stepInfo.number}
                  className={`flex items-center gap-2 ${
                    step >= stepInfo.number ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{stepInfo.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(stepTitles[step - 1].icon, { className: "w-5 h-5" })}
                  {stepTitles[step - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Customer Info */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customer_name">Nome completo *</Label>
                        <Input
                          id="customer_name"
                          {...register('customer_name')}
                          placeholder="Seu nome completo"
                        />
                        {errors.customer_name && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.customer_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customer_email">Email *</Label>
                        <Input
                          id="customer_email"
                          type="email"
                          {...register('customer_email')}
                          placeholder="seu@email.com"
                        />
                        {errors.customer_email && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.customer_email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customer_phone">Telefone/WhatsApp *</Label>
                        <Input
                          id="customer_phone"
                          {...register('customer_phone')}
                          placeholder="(11) 99999-9999"
                        />
                        {errors.customer_phone && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.customer_phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Delivery Address */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="delivery_zipcode">CEP *</Label>
                        <Input
                          id="delivery_zipcode"
                          {...register('delivery_zipcode')}
                          placeholder="00000-000"
                        />
                        {errors.delivery_zipcode && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.delivery_zipcode.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="delivery_address">Endereço completo *</Label>
                        <Input
                          id="delivery_address"
                          {...register('delivery_address')}
                          placeholder="Rua, número, complemento"
                        />
                        {errors.delivery_address && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.delivery_address.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="delivery_neighborhood">Bairro *</Label>
                          <Input
                            id="delivery_neighborhood"
                            {...register('delivery_neighborhood')}
                            placeholder="Bairro"
                          />
                          {errors.delivery_neighborhood && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.delivery_neighborhood.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="delivery_city">Cidade *</Label>
                          <Input
                            id="delivery_city"
                            {...register('delivery_city')}
                            placeholder="Cidade"
                          />
                          {errors.delivery_city && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.delivery_city.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <Label>Forma de pagamento *</Label>
                      <RadioGroup
                        value={watch('payment_method')}
                        onValueChange={(value) => form.setValue('payment_method', value as any)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix">PIX (Aprovação instantânea)</Label>
                          <Badge variant="secondary">Recomendado</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="credit" id="credit" />
                          <Label htmlFor="credit">Cartão de Crédito</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="debit" id="debit" />
                          <Label htmlFor="debit">Cartão de Débito</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="money" id="money" />
                          <Label htmlFor="money">Dinheiro (Troco será informado)</Label>
                        </div>
                      </RadioGroup>
                      {errors.payment_method && (
                        <p className="text-sm text-destructive">
                          {errors.payment_method.message}
                        </p>
                      )}

                      <div>
                        <Label htmlFor="notes">Observações (opcional)</Label>
                        <Textarea
                          id="notes"
                          {...register('notes')}
                          placeholder="Alguma observação sobre o pedido ou entrega..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Confirmation */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Confirme seus dados</h3>
                        
                        <div className="space-y-4 text-sm">
                          <div>
                            <strong>Cliente:</strong> {watch('customer_name')}<br />
                            <strong>Email:</strong> {watch('customer_email')}<br />
                            <strong>Telefone:</strong> {watch('customer_phone')}
                          </div>
                          
                          <div>
                            <strong>Entrega:</strong><br />
                            {watch('delivery_address')}, {watch('delivery_neighborhood')}<br />
                            {watch('delivery_city')} - {watch('delivery_zipcode')}
                          </div>
                          
                          <div>
                            <strong>Pagamento:</strong> {
                              watch('payment_method') === 'pix' ? 'PIX' :
                              watch('payment_method') === 'credit' ? 'Cartão de Crédito' :
                              watch('payment_method') === 'debit' ? 'Cartão de Débito' :
                              'Dinheiro'
                            }
                          </div>

                          {watch('notes') && (
                            <div>
                              <strong>Observações:</strong> {watch('notes')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>

                    {step < 4 ? (
                      <Button type="button" onClick={nextStep} className="gap-2">
                        Próximo
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">Qtd: {item.quantity}</p>
                      {item.customizations && item.customizations.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.customizations.join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}

                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de entrega</span>
                    <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {totalWithDelivery.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;