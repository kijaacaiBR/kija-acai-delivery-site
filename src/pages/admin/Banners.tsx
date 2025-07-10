import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { BannerForm } from '@/components/admin/BannerForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
}

const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      toast({
        title: "Erro ao carregar banners",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchBanners();
      toast({
        title: "Status atualizado",
        description: `Banner ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
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

  const updateSortOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ sort_order: newOrder })
        .eq('id', id);

      if (error) throw error;

      await fetchBanners();
      toast({
        title: "Ordem atualizada",
        description: "Posição do banner alterada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      toast({
        title: "Erro ao atualizar ordem",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchBanners();
      toast({
        title: "Banner excluído",
        description: "Banner removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir banner:', error);
      toast({
        title: "Erro ao excluir banner",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Gerencie os banners do site</p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            setEditingBanner(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Banner
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Banners ({filteredBanners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanners.map((banner, index) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-20 h-12 rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-sm text-muted-foreground">
                          {banner.subtitle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {banner.link_url.length > 30 
                          ? `${banner.link_url.substring(0, 30)}...` 
                          : banner.link_url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Sem link</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{banner.sort_order || 0}</span>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => updateSortOrder(banner.id, (banner.sort_order || 0) - 1)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => updateSortOrder(banner.id, (banner.sort_order || 0) + 1)}
                          disabled={index === filteredBanners.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={banner.is_active ? "default" : "secondary"}>
                      {banner.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(banner.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                      >
                        {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingBanner(banner);
                          setFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBanner(banner.id)}
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

      <BannerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        banner={editingBanner}
        onSuccess={fetchBanners}
      />
    </div>
  );
};

export default BannersPage;