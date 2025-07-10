import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2, Star } from 'lucide-react';

const testimonialSchema = z.object({
  customer_name: z.string().min(1, 'Nome é obrigatório'),
  comment: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres'),
  rating: z.number().min(1).max(5),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

interface Testimonial {
  id: string;
  customer_name: string;
  customer_avatar: string | null;
  comment: string;
  rating: number;
  is_active: boolean;
  is_featured: boolean | null;
}

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial | null;
  onSuccess: () => void;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  open,
  onOpenChange,
  testimonial,
  onSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customer_name: '',
      comment: '',
      rating: 5,
      is_active: true,
      is_featured: false,
    },
  });

  useEffect(() => {
    if (testimonial) {
      form.reset({
        customer_name: testimonial.customer_name,
        comment: testimonial.comment,
        rating: testimonial.rating,
        is_active: testimonial.is_active,
        is_featured: testimonial.is_featured || false,
      });
      setAvatarPreview(testimonial.customer_avatar);
    } else {
      form.reset({
        customer_name: '',
        comment: '',
        rating: 5,
        is_active: true,
        is_featured: false,
      });
      setAvatarPreview(null);
    }
    setAvatarFile(null);
  }, [testimonial, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: "Erro no upload",
        description: "Erro ao fazer upload do avatar.",
        variant: "destructive",
      });
      return null;
    }
  };

  const onSubmit = async (data: TestimonialFormData) => {
    try {
      setUploading(true);

      let customer_avatar = testimonial?.customer_avatar || null;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          customer_avatar = uploadedUrl;
        }
      }

      const testimonialData = {
        customer_name: data.customer_name,
        comment: data.comment,
        rating: data.rating,
        is_active: data.is_active,
        is_featured: data.is_featured,
        customer_avatar,
      };

      if (testimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', testimonial.id);

        if (error) throw error;

        toast({
          title: "Depoimento atualizado",
          description: "Depoimento atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(testimonialData);

        if (error) throw error;

        toast({
          title: "Depoimento criado",
          description: "Depoimento criado com sucesso.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error);
      toast({
        title: "Erro ao salvar",
        description: "Erro ao salvar depoimento.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {testimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Avatar (opcional)</FormLabel>
              <div className="space-y-4">
                {avatarPreview && (
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img 
                      src={avatarPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Escolher Avatar
                  </Button>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Comentário do cliente sobre o produto/serviço" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliação</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {renderStars(field.value)}
                            </div>
                            <span>({field.value} estrelas)</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {renderStars(rating)}
                            </div>
                            <span>({rating} estrelas)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Depoimento Aprovado</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Depoimento será exibido no site
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Depoimento em Destaque</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Aparecerá em posição de destaque no site
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {testimonial ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};