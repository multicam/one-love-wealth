import {
	LayoutDashboard,
	Users,
	Settings,
	FileText,
	User,
	CreditCard,
	BarChart3,
	Calendar,
	Inbox,
	ShoppingCart,
	Package,
	Home,
	ChevronDown,
	TrendingUp,
	PieChart,
	Activity,
	ClipboardList,
	Truck,
	UserPlus,
	UserCheck,
	Lock,
	Bell,
	Palette
} from '@lucide/svelte';
import type { Component } from 'svelte';

export interface NavItem {
	href?: string;
	label: string;
	icon?: Component;
	children?: NavItem[];
}

export const mainNavItems: NavItem[] = [
	{ href: '/', label: 'Home', icon: Home },
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		children: [
			{ href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
			{ href: '/analytics', label: 'Analytics', icon: BarChart3 },
			{ href: '/calendar', label: 'Calendar', icon: Calendar },
			{ href: '/inbox', label: 'Inbox', icon: Inbox }
		]
	},
	{
		label: 'Commerce',
		icon: ShoppingCart,
		children: [
			{ href: '/orders', label: 'Orders', icon: ClipboardList },
			{ href: '/products', label: 'Products', icon: Package },
			{ href: '/pricing', label: 'Pricing', icon: CreditCard }
		]
	},
	{
		label: 'Users',
		icon: Users,
		children: [
			{ href: '/users', label: 'All Users', icon: Users },
			{ href: '/profile', label: 'Profile', icon: User }
		]
	},
	{ href: '/forms', label: 'Forms', icon: FileText },
	{ href: '/settings', label: 'Settings', icon: Settings }
];

export const sidebarNavItems: NavItem[] = mainNavItems.filter((item) => item.href !== '/');

// Flatten nav items for simple iteration (useful for mobile menus)
export function flattenNavItems(items: NavItem[]): NavItem[] {
	return items.reduce<NavItem[]>((acc, item) => {
		if (item.children) {
			return [...acc, ...item.children];
		}
		return [...acc, item];
	}, []);
}

// Check if a nav item or its children match the current path
export function isNavItemActive(item: NavItem, pathname: string): boolean {
	if (item.href === pathname) return true;
	if (item.children) {
		return item.children.some((child) => child.href === pathname);
	}
	return false;
}

export { ChevronDown };

export const APP_NAME = 'MyApp';
