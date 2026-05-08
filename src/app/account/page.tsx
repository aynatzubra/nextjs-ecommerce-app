import { AccountPage } from '@/widgets/account'
import { requireUser } from '@/features/auth/lib/guards'

export default async function AccountPageRoute() {
  await requireUser()
  
  return <AccountPage />
}
