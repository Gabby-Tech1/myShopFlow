import { create } from 'zustand'

export interface Toast {
  id: string
  title: string
  description?: string
  tone: 'success' | 'info' | 'error'
  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 5000)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string, action?: Toast['action']) =>
    useToasts.getState().push({ title, description, tone: 'success', action }),
  info: (title: string, description?: string, action?: Toast['action']) =>
    useToasts.getState().push({ title, description, tone: 'info', action }),
  error: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, tone: 'error' }),
}
