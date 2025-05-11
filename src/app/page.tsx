// app/page.tsx (Next 13+ App Router)
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/notifications')
}
