import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Calendar, Percent } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  type: string;
  value: number;
  min_order_value: number | null;
  max_discount: number | null;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  used_count: number | null;
  is_active: boolean;
  created_at: string;
}

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      toast({
        title: "Erro ao carregar promoções",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePromotionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchPromotions();
      toast({
        title: "Status atualizado",
        description: `Promoção ${!currentStatus ? 'ativada' : 'desativada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta promoção?')) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPromotions();
      toast({
        title: "Promoção excluída",
        description: "Promoção removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir promoção:', error);
      toast({
        title: "Erro ao excluir promoção",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      percentage: 'Porcentagem',
      fixed_amount: 'Valor Fixo',
      free_shipping: 'Frete Grátis',
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: "default" | "secondary" | "outline" } = {
      percentage: 'default',
      fixed_amount: 'secondary',
      free_shipping: 'outline',
    };
    return colorMap[type] || 'outline';
  };

  const isPromotionExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isPromotionActive = (startDate: string, endDate: string) => {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  const filteredPromotions = promotions.filter(promotion =>
    promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Promoções</h1>
          <p className="text-muted-foreground">Gerencie cupons e promoções</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Promoção
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar promoções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Promoções ({filteredPromotions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promoção</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promotion.title}</div>
                      {promotion.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {promotion.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {promotion.code ? (
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {promotion.code}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">Sem código</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(promotion.type)}>
                      {getTypeLabel(promotion.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {promotion.type === 'percentage' && <Percent className="h-3 w-3" />}
                      {promotion.type === 'percentage' 
                        ? `${promotion.value}%`
                        : promotion.type === 'fixed_amount'
                        ? `R$ ${promotion.value.toFixed(2)}`
                        : 'Grátis'
                      }
                    </div>
                    {promotion.min_order_value && (
                      <div className="text-xs text-muted-foreground">
                        Min: R$ {promotion.min_order_value.toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(promotion.start_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        até {new Date(promotion.end_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {promotion.used_count || 0}
                      {promotion.usage_limit && ` / ${promotion.usage_limit}`}
                    </div>
                    {promotion.usage_limit && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(((promotion.used_count || 0) / promotion.usage_limit) * 100)}% usado
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={promotion.is_active && isPromotionActive(promotion.start_date, promotion.end_date) ? "default" : "secondary"}
                      >
                        {promotion.is_active 
                          ? isPromotionExpired(promotion.end_date)
                            ? 'Expirada'
                            : isPromotionActive(promotion.start_date, promotion.end_date)
                            ? 'Ativa'
                            : 'Agendada'
                          : 'Inativa'
                        }
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePromotionStatus(promotion.id, promotion.is_active)}
                      >
                        {promotion.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePromotion(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionsPage;