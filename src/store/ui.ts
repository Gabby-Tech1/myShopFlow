import { create } from 'zustand'

export type QuickModal = 'expense' | 'payment' | 'registerCustomer' | 'ownerFunds' | null

interface UiState {
  modal: QuickModal
  /** optional pre-selected customer for the payment modal */
  paymentCustomerId?: string
  openModal: (modal: QuickModal, opts?: { customerId?: string }) => void
  closeModal: () => void

  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

export const useUi = create<UiState>((set) => ({
  modal: null,
  paymentCustomerId: undefined,
  openModal: (modal, opts) => set({ modal, paymentCustomerId: opts?.customerId }),
  closeModal: () => set({ modal: null, paymentCustomerId: undefined }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}))
