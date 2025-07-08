import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Save, Settings2, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  type: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: { [key: string]: string } = {};
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting.value || '';
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value,
          type: 'text'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Atualizar todas as configurações
      await Promise.all(
        Object.entries(settings).map(([key, value]) => 
          updateSetting(key, value)
        )
      );

      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do site</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Nome do Site</Label>
                <Input
                  id="site_name"
                  value={settings.site_name || ''}
                  onChange={(e) => handleInputChange('site_name', e.target.value)}
                  placeholder="Kija Açaí"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_tagline">Slogan</Label>
                <Input
                  id="site_tagline"
                  value={settings.site_tagline || ''}
                  onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                  placeholder="O melhor açaí da cidade"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Descrição do Site</Label>
              <Textarea
                id="site_description"
                value={settings.site_description || ''}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="Descrição completa do seu negócio..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Telefone</Label>
                <Input
                  id="contact_phone"
                  value={settings.contact_phone || ''}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_whatsapp">WhatsApp</Label>
                <Input
                  id="contact_whatsapp"
                  value={settings.contact_whatsapp || ''}
                  onChange={(e) => handleInputChange('contact_whatsapp', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">E-mail</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="contato@kijaacai.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_address">Endereço</Label>
              <Textarea
                id="contact_address"
                value={settings.contact_address || ''}
                onChange={(e) => handleInputChange('contact_address', e.target.value)}
                placeholder="Rua Example, 123 - Bairro - Cidade/UF"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Entrega */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Configurações de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  value={settings.delivery_fee || ''}
                  onChange={(e) => handleInputChange('delivery_fee', e.target.value)}
                  placeholder="5.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="free_delivery_min">Valor Mínimo para Frete Grátis (R$)</Label>
                <Input
                  id="free_delivery_min"
                  type="number"
                  step="0.01"
                  value={settings.free_delivery_min || ''}
                  onChange={(e) => handleInputChange('free_delivery_min', e.target.value)}
                  placeholder="50.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_time_min">Tempo Mínimo de Entrega (min)</Label>
                <Input
                  id="delivery_time_min"
                  type="number"
                  value={settings.delivery_time_min || ''}
                  onChange={(e) => handleInputChange('delivery_time_min', e.target.value)}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_time_max">Tempo Máximo de Entrega (min)</Label>
                <Input
                  id="delivery_time_max"
                  type="number"
                  value={settings.delivery_time_max || ''}
                  onChange={(e) => handleInputChange('delivery_time_max', e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Redes Sociais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="social_instagram">Instagram</Label>
                <Input
                  id="social_instagram"
                  value={settings.social_instagram || ''}
                  onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                  placeholder="https://instagram.com/kijaacai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_facebook">Facebook</Label>
                <Input
                  id="social_facebook"
                  value={settings.social_facebook || ''}
                  onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                  placeholder="https://facebook.com/kijaacai"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="social_twitter">Twitter/X</Label>
                <Input
                  id="social_twitter"
                  value={settings.social_twitter || ''}
                  onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                  placeholder="https://twitter.com/kijaacai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_tiktok">TikTok</Label>
                <Input
                  id="social_tiktok"
                  value={settings.social_tiktok || ''}
                  onChange={(e) => handleInputChange('social_tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@kijaacai"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar no final */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            size="lg"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;