import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

const CartTest = () => {
  const { addItem, items, total, clearCart } = useCart();

  const sampleProducts = [
    {
      productId: 'test-1',
      name: 'Açaí Tradicional 500ml',
      price: 15.90,
      quantity: 1,
      image: '/placeholder.svg'
    },
    {
      productId: 'test-2',
      name: 'Açaí com Granola 700ml',
      price: 18.50,
      quantity: 1,
      image: '/placeholder.svg'
    },
    {
      productId: 'test-3',
      name: 'Smoothie de Frutas',
      price: 12.00,
      quantity: 1,
      image: '/placeholder.svg'
    }
  ];

  const addSampleProduct = (product: any) => {
    addItem(product);
  };

  const testCartPersistence = () => {
    const cartData = localStorage.getItem('kija-cart');
    toast({
      title: "Dados do carrinho no localStorage",
      description: cartData ? `${JSON.parse(cartData).length} itens encontrados` : "Nenhum item encontrado",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Teste do Carrinho</CardTitle>
        <p className="text-sm text-muted-foreground">
          Itens no carrinho: {items.length} | Total: R$ {total.toFixed(2).replace('.', ',')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Adicionar produtos de teste:</h4>
          {sampleProducts.map((product) => (
            <Button
              key={product.productId}
              variant="outline"
              size="sm"
              className="w-full text-left justify-start"
              onClick={() => addSampleProduct(product)}
            >
              {product.name} - R$ {product.price.toFixed(2).replace('.', ',')}
            </Button>
          ))}
        </div>
        
        <div className="space-y-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={testCartPersistence}
          >
            Verificar localStorage
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={clearCart}
            disabled={items.length === 0}
          >
            Limpar carrinho
          </Button>
        </div>

        {items.length > 0 && (
          <div className="pt-3 border-t">
            <h4 className="font-semibold text-sm mb-2">Itens no carrinho:</h4>
            <div className="space-y-1 text-xs">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CartTest;