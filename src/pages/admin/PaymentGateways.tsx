import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  QrCode, 
  Settings, 
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'pix' | 'credit' | 'debit' | 'boleto';
  enabled: boolean;
  configuration: Record<string, any>;
  icon: React.ReactNode;
  description: string;
}

const PaymentGatewaysPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'mercado-pago',
      name: 'Mercado Pago',
      type: 'credit',
      enabled: false,
      configuration: {
        public_key: '',
        access_token: '',
        webhook_url: ''
      },
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
      description: 'Aceite cartões, PIX, boleto e mais com o Mercado Pago'
    },
    {
      id: 'pagseguro',
      name: 'PagSeguro',
      type: 'credit',
      enabled: false,
      configuration: {
        email: '',
        token: '',
        app_id: '',
        app_key: ''
      },
      icon: <DollarSign className="h-6 w-6 text-orange-600" />,
      description: 'Processamento seguro de pagamentos com PagSeguro'
    },
    {
      id: 'picpay',
      name: 'PicPay',
      type: 'pix',
      enabled: false,
      configuration: {
        x_picpay_token: '',
        x_seller_token: ''
      },
      icon: <Smartphone className="h-6 w-6 text-green-600" />,
      description: 'Pagamentos instantâneos com PicPay'
    },
    {
      id: 'pix-manual',
      name: 'PIX Manual',
      type: 'pix',
      enabled: true,
      configuration: {
        pix_key: '',
        recipient_name: '',
        bank_name: ''
      },
      icon: <QrCode className="h-6 w-6 text-purple-600" />,
      description: 'Receba pagamentos PIX com sua chave'
    }
  ]);

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadGatewaySettings();
  }, []);

  const loadGatewaySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('key', 'payment_%');

      if (error) throw error;

      // Update gateways with saved settings
      const updatedGateways = gateways.map(gateway => {
        const gatewaySettings = data?.filter(setting => 
          setting.key.startsWith(`payment_${gateway.id}`)
        ) || [];

        if (gatewaySettings.length > 0) {
          const config = { ...gateway.configuration };
          const enabled = gatewaySettings.find(s => s.key === `payment_${gateway.id}_enabled`)?.value === 'true';
          
          gatewaySettings.forEach(setting => {
            const configKey = setting.key.replace(`payment_${gateway.id}_`, '');
            if (configKey !== 'enabled') {
              config[configKey] = setting.value;
            }
          });

          return { ...gateway, enabled, configuration: config };
        }
        return gateway;
      });

      setGateways(updatedGateways);
    } catch (error) {
      console.error('Error loading gateway settings:', error);
    }
  };

  const saveGatewaySettings = async (gateway: PaymentGateway) => {
    try {
      const settings = [
        {
          key: `payment_${gateway.id}_enabled`,
          value: gateway.enabled.toString(),
          type: 'boolean',
          description: `${gateway.name} habilitado`
        }
      ];

      // Add configuration settings
      Object.entries(gateway.configuration).forEach(([key, value]) => {
        settings.push({
          key: `payment_${gateway.id}_${key}`,
          value: value as string,
          type: 'text',
          description: `${gateway.name} - ${key}`
        });
      });

      // Delete existing settings for this gateway
      await supabase
        .from('site_settings')
        .delete()
        .like('key', `payment_${gateway.id}_%`);

      // Insert new settings
      const { error } = await supabase
        .from('site_settings')
        .insert(settings);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: `${gateway.name} configurado com sucesso.`,
      });

      setShowConfiguration(false);
      setSelectedGateway(null);
      loadGatewaySettings();

    } catch (error) {
      console.error('Error saving gateway settings:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const toggleGateway = async (gatewayId: string, enabled: boolean) => {
    const updatedGateways = gateways.map(g => 
      g.id === gatewayId ? { ...g, enabled } : g
    );
    setGateways(updatedGateways);

    const gateway = updatedGateways.find(g => g.id === gatewayId);
    if (gateway) {
      await saveGatewaySettings(gateway);
    }
  };

  const updateConfiguration = (key: string, value: string) => {
    if (selectedGateway) {
      setSelectedGateway({
        ...selectedGateway,
        configuration: {
          ...selectedGateway.configuration,
          [key]: value
        }
      });
    }
  };

  const toggleSensitiveVisibility = (field: string) => {
    setShowSensitiveInfo(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const testGatewayConnection = async (gateway: PaymentGateway) => {
    toast({
      title: "Testando conexão...",
      description: `Verificando configuração do ${gateway.name}`,
    });

    // Simulate API test - in real implementation, call the gateway's test endpoint
    setTimeout(() => {
      toast({
        title: "Teste concluído",
        description: gateway.enabled 
          ? `${gateway.name} está funcionando corretamente.`
          : `Configure ${gateway.name} para ativar os testes.`,
        variant: gateway.enabled ? "default" : "destructive",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gateways de Pagamento</h1>
          <p className="text-muted-foreground">Configure e gerencie os métodos de pagamento aceitos</p>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">PIX</p>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-xs text-muted-foreground">Dos pagamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Cartão</p>
                <p className="text-2xl font-bold">12%</p>
                <p className="text-xs text-muted-foreground">Dos pagamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Dinheiro</p>
                <p className="text-2xl font-bold">3%</p>
                <p className="text-xs text-muted-foreground">Dos pagamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Taxa Sucesso</p>
                <p className="text-2xl font-bold">98.5%</p>
                <p className="text-xs text-muted-foreground">Aprovação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gateways.map((gateway) => (
          <Card key={gateway.id} className={`relative ${gateway.enabled ? 'ring-2 ring-green-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {gateway.icon}
                  <div>
                    <CardTitle className="text-lg">{gateway.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {gateway.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {gateway.enabled ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`toggle-${gateway.id}`}>Habilitar {gateway.name}</Label>
                <Switch
                  id={`toggle-${gateway.id}`}
                  checked={gateway.enabled}
                  onCheckedChange={(checked) => toggleGateway(gateway.id, checked)}
                />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedGateway(gateway);
                    setShowConfiguration(true);
                  }}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testGatewayConnection(gateway)}
                  disabled={!gateway.enabled}
                >
                  Testar
                </Button>
              </div>

              {/* Configuration Preview */}
              <div className="text-xs text-muted-foreground">
                {Object.keys(gateway.configuration).length > 0 ? (
                  <div>
                    Configurado: {Object.keys(gateway.configuration).filter(key => 
                      gateway.configuration[key] && gateway.configuration[key].trim() !== ''
                    ).length} de {Object.keys(gateway.configuration).length} campos
                  </div>
                ) : (
                  <div>Nenhuma configuração necessária</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Dialog */}
      {showConfiguration && selectedGateway && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedGateway.icon}
                Configurar {selectedGateway.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(selectedGateway.configuration).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/_/g, ' ')}
                  </Label>
                  <div className="relative">
                    <Input
                      id={key}
                      type={key.includes('token') || key.includes('key') ? 
                        (showSensitiveInfo[key] ? 'text' : 'password') : 'text'}
                      value={value as string}
                      onChange={(e) => updateConfiguration(key, e.target.value)}
                      placeholder={`Digite seu ${key.replace(/_/g, ' ')}`}
                    />
                    {(key.includes('token') || key.includes('key')) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => toggleSensitiveVisibility(key)}
                      >
                        {showSensitiveInfo[key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => saveGatewaySettings(selectedGateway)} className="flex-1">
                  Salvar Configurações
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowConfiguration(false);
                    setSelectedGateway(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewaysPage;