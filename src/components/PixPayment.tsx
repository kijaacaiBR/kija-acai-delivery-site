import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  QrCode, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PixPaymentProps {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerCpf: string;
  onPaymentConfirmed: () => void;
  onPaymentCancelled: () => void;
}

interface PaymentData {
  pixUrl: string;
  pixCode: string;
  qrCodeImage?: string;
  expiresAt: string;
  billId: string;
}

const PixPayment: React.FC<PixPaymentProps> = ({
  orderId,
  amount,
  customerEmail,
  customerName,
  customerPhone,
  customerCpf,
  onPaymentConfirmed,
  onPaymentCancelled
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');

  useEffect(() => {
    createPixPayment();
  }, []);

  useEffect(() => {
    if (paymentData && paymentStatus === 'pending') {
      const interval = setInterval(() => {
        const expiresAt = new Date(paymentData.expiresAt);
        const now = new Date();
        const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
        
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          setPaymentStatus('cancelled');
          onPaymentCancelled();
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [paymentData, paymentStatus]);

  useEffect(() => {
    if (paymentData && paymentStatus === 'pending') {
      // Polling para verificar status do pagamento
      const pollingInterval = setInterval(() => {
        checkPaymentStatus();
      }, 5000); // Verificar a cada 5 segundos

      return () => clearInterval(pollingInterval);
    }
  }, [paymentData, paymentStatus]);

  const createPixPayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          orderId,
          amount,
          description: `Pedido #${orderId.slice(0, 8)} - Kija Açaí`,
          customerEmail,
          customerName,
          customerPhone,
          customerCpf
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar pagamento PIX');
      }

      setPaymentData({
        pixUrl: data.pixUrl,
        pixCode: data.pixCode,
        qrCodeImage: data.qrCodeImage,
        expiresAt: data.expiresAt,
        billId: data.billId
      });

      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código para pagar.",
      });

    } catch (error) {
      console.error('Error creating PIX payment:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      onPaymentCancelled();
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { orderId }
      });

      if (error) throw error;

      if (data.success && data.statusChanged) {
        if (data.status === 'confirmed') {
          setPaymentStatus('confirmed');
          onPaymentConfirmed();
          toast({
            title: "Pagamento confirmado!",
            description: "Seu pedido foi confirmado e será preparado em breve.",
          });
        } else if (data.status === 'cancelled') {
          setPaymentStatus('cancelled');
          onPaymentCancelled();
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const copyPixCode = async () => {
    if (!paymentData?.pixCode) return;

    try {
      await navigator.clipboard.writeText(paymentData.pixCode);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu app de banco para pagar.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar código",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = timeLeft > 0 ? (timeLeft / (30 * 60)) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span>Gerando PIX...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'confirmed') {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Pagamento Confirmado!
          </h3>
          <p className="text-muted-foreground">
            Seu pedido foi confirmado e será preparado em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'cancelled' || timeLeft <= 0) {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200">
        <CardContent className="p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            PIX Expirado
          </h3>
          <p className="text-muted-foreground mb-4">
            O tempo para pagamento expirou. Você pode gerar um novo PIX.
          </p>
          <Button onClick={createPixPayment} disabled={isLoading}>
            Gerar Novo PIX
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!paymentData) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-6 w-6 text-primary" />
          Pagamento PIX
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Valor */}
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            R$ {amount.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-sm text-muted-foreground">
            Valor total do pedido
          </p>
        </div>

        {/* Tempo restante */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tempo restante:</span>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
          {paymentData.qrCodeImage ? (
            <img 
              src={paymentData.qrCodeImage} 
              alt="QR Code PIX" 
              className="w-32 h-32 mx-auto mb-2"
            />
          ) : (
            <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-2" />
          )}
          <p className="text-xs text-muted-foreground">
            Escaneie este QR Code com seu app de banco
          </p>
        </div>

        {/* Código PIX */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Código PIX (Copia e Cola):</label>
          <div className="flex space-x-2">
            <div className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
              {paymentData.pixCode}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={copyPixCode}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status e botão de verificação */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status do pagamento:</span>
            <Badge variant="secondary">Aguardando</Badge>
          </div>
          
          <Button 
            variant="outline" 
            onClick={checkPaymentStatus}
            disabled={isChecking}
            className="w-full gap-2"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isChecking ? 'Verificando...' : 'Verificar Pagamento'}
          </Button>
        </div>

        {/* Instruções */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>1. Abra o app do seu banco</p>
          <p>2. Escaneie o QR Code ou copie o código</p>
          <p>3. Confirme o pagamento</p>
          <p>4. Aguarde a confirmação automática</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PixPayment;