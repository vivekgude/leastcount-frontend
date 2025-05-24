import { useForm as useHookForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const useForm = <T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) => {
  return useHookForm<z.infer<T>>({
    ...options,
    resolver: zodResolver(schema),
  });
}; 