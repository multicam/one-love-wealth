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
	Home
} from '@lucide/svelte';
import type { Component } from 'svelte';

export interface NavItem {
	href: string;
	label: string;
	icon?: Component;
}

export const mainNavItems: NavItem[] = [
	{ href: '/', label: 'Home', icon: Home },
	{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/analytics', label: 'Analytics', icon: BarChart3 },
	{ href: '/calendar', label: 'Calendar', icon: Calendar },
	{ href: '/inbox', label: 'Inbox', icon: Inbox },
	{ href: '/orders', label: 'Orders', icon: ShoppingCart },
	{ href: '/products', label: 'Products', icon: Package },
	{ href: '/users', label: 'Users', icon: Users },
	{ href: '/forms', label: 'Forms', icon: FileText },
	{ href: '/profile', label: 'Profile', icon: User },
	{ href: '/pricing', label: 'Pricing', icon: CreditCard },
	{ href: '/settings', label: 'Settings', icon: Settings }
];

export const sidebarNavItems: NavItem[] = mainNavItems.filter((item) => item.href !== '/');

export const APP_NAME = 'MyApp';
