/** Navigation items for the sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Gastos', icon: 'money_off', route: '/gastos' },
  { label: 'Ingresos', icon: 'attach_money', route: '/ingresos' },
  { label: 'Presupuestos', icon: 'pie_chart', route: '/presupuestos' },
  { label: 'Metas de Ahorro', icon: 'savings', route: '/metas' },
  { label: 'Deudas', icon: 'credit_card', route: '/deudas' },
  { label: 'Perfil', icon: 'person', route: '/perfil' },
];

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}
