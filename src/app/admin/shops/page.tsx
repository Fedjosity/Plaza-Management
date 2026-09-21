import { redirect } from 'next/navigation';

export default function AdminShopsPage() {
  // Directly render dashboard with shop table view or redirect
  redirect('/admin');
}
