import { Metadata } from 'next'
import SideNav from '@/app/ui/dashboard/sidenav';
export const experimental_ppr = true;

export const metadata:Metadata = {
  title: 'Dashboard'
}
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none bg-slate-50 dark:bg-black md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 bg-slate-50 dark:bg-black md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}