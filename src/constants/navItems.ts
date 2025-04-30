// src/constants/navItems.ts
import { Home, ClipboardList, Users, FileText } from 'lucide-react';

export const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    to: '/jobs',
    label: 'Jobs',
    icon: ClipboardList,
  },
  {
    to: '/clients',
    label: 'Clients',
    icon: Users,
  },
  {
    to: '/invoices',
    label: 'Invoices',
    icon: FileText,
  },
  {
    to: '/sandbox',
    label: 'Sand',
    icon: FileText,
  },
];
