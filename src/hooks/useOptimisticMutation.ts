import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: (string | number)[];
  updateFn?: (oldData: any, variables: TVariables) => any;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  updateFn,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      if (updateFn) {
        queryClient.setQueryData(queryKey, (old: any) => updateFn(old, variables));
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err: Error, variables: TVariables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      toast({
        title: "Erro",
        description: errorMessage || "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });

      onError?.(err, variables);
    },
    onSuccess: (data: TData, variables: TVariables) => {
      if (successMessage) {
        toast({
          title: "Sucesso",
          description: successMessage,
        });
      }

      onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });
}