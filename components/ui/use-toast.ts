'use client'

import { toast } from 'sonner'

export function useToast() {
  return {
    toast: (options: {
      title: string
      description?: string
      variant?: 'default' | 'destructive'
    }) => {
      toast(options.title, {
        description: options.description,
        className:
          options.variant === 'destructive' ? 'bg-red-500 text-white' : '',
      })
    },
  }
}
