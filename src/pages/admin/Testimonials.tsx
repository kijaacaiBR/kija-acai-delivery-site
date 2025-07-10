import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Star } from 'lucide-react';
import { TestimonialForm } from '@/components/admin/TestimonialForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_avatar: string | null;
  comment: string;
  rating: number;
  is_active: boolean;
  is_featured: boolean | null;
  created_at: string;
}

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
      toast({
        title: "Erro ao carregar depoimentos",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTestimonialStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchTestimonials();
      toast({
        title: "Status atualizado",
        description: `Depoimento ${!currentStatus ? 'aprovado' : 'desativado'} com sucesso.`,
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

  const toggleFeaturedStatus = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchTestimonials();
      toast({
        title: "Status atualizado",
        description: `Depoimento ${!currentStatus ? 'destacado' : 'removido dos destaques'}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
      toast({
        title: "Erro ao atualizar destaque",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTestimonials();
      toast({
        title: "Depoimento excluído",
        description: "Depoimento removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir depoimento:', error);
      toast({
        title: "Erro ao excluir depoimento",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.comment.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Depoimentos</h1>
          <p className="text-muted-foreground">Gerencie os depoimentos dos clientes</p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            setEditingTestimonial(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Depoimento
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar depoimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Depoimentos ({filteredTestimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Comentário</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {testimonial.customer_avatar ? (
                        <img
                          src={testimonial.customer_avatar}
                          alt={testimonial.customer_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {testimonial.customer_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="font-medium">{testimonial.customer_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md text-sm line-clamp-3">
                      {testimonial.comment}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating)}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({testimonial.rating})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                      {testimonial.is_active ? 'Aprovado' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={testimonial.is_featured ? "default" : "outline"}>
                      {testimonial.is_featured ? 'Destacado' : 'Normal'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(testimonial.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTestimonialStatus(testimonial.id, testimonial.is_active)}
                      >
                        {testimonial.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeaturedStatus(testimonial.id, testimonial.is_featured)}
                      >
                        <Star className={`h-4 w-4 ${testimonial.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingTestimonial(testimonial);
                          setFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTestimonial(testimonial.id)}
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

      <TestimonialForm
        open={formOpen}
        onOpenChange={setFormOpen}
        testimonial={editingTestimonial}
        onSuccess={fetchTestimonials}
      />
    </div>
  );
};

export default TestimonialsPage;