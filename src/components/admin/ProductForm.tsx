import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que 0'),
  original_price: z.number().optional(),
  category_id: z.string().optional(),
  ingredients: z.string().optional(),
  is_active: z.boolean().default(true),
  is_popular: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional(),
  sort_order: z.number().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  onProductCreated: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onProductCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      original_price: undefined,
      category_id: '',
      ingredients: '',
      is_active: true,
      is_popular: false,
      rating: 4.8,
      sort_order: 0,
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          toast({
            title: "Erro no upload da imagem",
            description: "Tente novamente ou continue sem imagem.",
            variant: "destructive",
          });
          return;
        }
      }

      // Create product
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description || null,
          price: data.price,
          original_price: data.original_price || null,
          category_id: data.category_id || null,
          ingredients: data.ingredients || null,
          image_url: imageUrl,
          is_active: data.is_active,
          is_popular: data.is_popular,
          rating: data.rating || null,
          sort_order: data.sort_order || 0,
        });

      if (error) throw error;

      toast({
        title: "Produto criado com sucesso!",
        description: "O produto foi adicionado ao cardápio.",
      });

      // Reset form and close dialog
      reset();
      setImageFile(null);
      setImagePreview('');
      setIsOpen(false);
      onProductCreated();

    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro ao criar produto",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Produto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>
              {imagePreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Açaí Tradicional 500ml"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descreva o produto..."
              rows={3}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_price">Preço Original (promocional)</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                {...register('original_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredientes</Label>
            <Textarea
              id="ingredients"
              {...register('ingredients')}
              placeholder="Liste os ingredientes..."
              rows={2}
            />
          </div>

          {/* Rating and Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Avaliação (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                {...register('rating', { valueAsNumber: true })}
                placeholder="4.8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Ordem de Exibição</Label>
              <Input
                id="sort_order"
                type="number"
                {...register('sort_order', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Switches */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Produto Ativo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_popular"
                checked={watch('is_popular')}
                onCheckedChange={(checked) => setValue('is_popular', checked)}
              />
              <Label htmlFor="is_popular">Produto Popular</Label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;