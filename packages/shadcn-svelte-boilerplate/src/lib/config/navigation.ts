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
	Palette,
	BrainCircuit,
	Bot,
	MessageSquare,
	History,
	Store,
	BookOpen,
	Database,
	Mic,
	GitBranch,
	Key,
	Cpu,
	DollarSign,
	ThumbsUp,
	LayoutTemplate,
	FlaskConical,
	Wrench,
	Shield,
	ArrowRightLeft,
	Bug,
	Sparkles,
	TestTube,
	Code
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
	{ href: '/settings', label: 'Settings', icon: Settings },
	{
		label: 'AI Platform',
		icon: BrainCircuit,
		children: [
			{ href: '/ai', label: 'My Agents', icon: Bot },
			{ href: '/ai/create', label: 'Create Agent', icon: Sparkles },
			{ href: '/ai/chat', label: 'Chat', icon: MessageSquare },
			{ href: '/ai/chat-multi', label: 'Multi-Agent Chat', icon: Users },
			{ href: '/ai/history', label: 'History', icon: History },
			{ href: '/ai/marketplace', label: 'Marketplace', icon: Store },
			{ href: '/ai/templates', label: 'Templates', icon: LayoutTemplate }
		]
	},
	{
		label: 'AI Tools',
		icon: Wrench,
		children: [
			{ href: '/ai/prompts', label: 'Prompts', icon: FileText },
			{ href: '/ai/knowledge', label: 'Knowledge Base', icon: Database },
			{ href: '/ai/studio', label: 'Prompt Studio', icon: Sparkles },
			{ href: '/ai/voice', label: 'Voice Assistant', icon: Mic },
			{ href: '/ai/workflows', label: 'Workflows', icon: GitBranch },
			{ href: '/ai/comparison', label: 'Model Comparison', icon: FlaskConical }
		]
	},
	{
		label: 'AI Settings',
		icon: Settings,
		children: [
			{ href: '/ai/models', label: 'Models', icon: Cpu },
			{ href: '/ai/api-keys', label: 'API Keys', icon: Key },
			{ href: '/ai/usage', label: 'Usage & Billing', icon: DollarSign },
			{ href: '/ai/feedback', label: 'Feedback', icon: ThumbsUp }
		]
	},
	{
		label: 'AI Development',
		icon: Code,
		children: [
			{ href: '/ai/fine-tune', label: 'Fine-Tuning', icon: Cpu },
			{ href: '/ai/evals', label: 'Evaluations', icon: TestTube },
			{ href: '/ai/ab-test', label: 'A/B Testing', icon: FlaskConical },
			{ href: '/ai/debug/context', label: 'Context Debug', icon: Bug },
			{ href: '/ai/agents/logs', label: 'Agent Logs', icon: FileText }
		]
	},
	{
		label: 'Agent Config',
		icon: Bot,
		children: [
			{ href: '/ai/agents/functions', label: 'Functions', icon: Code },
			{ href: '/ai/agents/safety', label: 'Safety & Guardrails', icon: Shield },
			{ href: '/ai/agents/handoff', label: 'Handoff Rules', icon: ArrowRightLeft }
		]
	}
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
