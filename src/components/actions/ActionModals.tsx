import { ExpenseModal } from './ExpenseModal'
import { ReceivePaymentModal } from './ReceivePaymentModal'
import { RegisterCustomerModal } from './RegisterCustomerModal'

/** All globally-triggerable quick-action modals, mounted once in the shell. */
export function ActionModals() {
  return (
    <>
      <ExpenseModal />
      <ReceivePaymentModal />
      <RegisterCustomerModal />
    </>
  )
}
