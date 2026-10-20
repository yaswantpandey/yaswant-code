'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { FacebookIcon, FrameIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from 'lucide-react';

export interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
	onClick?: (e: React.MouseEvent) => void;
}

export interface FooterSection {
	label: string;
	links: FooterLink[];
}

export interface FooterProps {
	brandLogo?: ReactNode;
	brandName?: string;
	brandDescription?: string;
	sections?: FooterSection[];
	className?: string;
	bottomContent?: ReactNode;
}

export const defaultFooterLinks: FooterSection[] = [
	{
		label: 'Product',
		links: [
			{ title: 'Features', href: '#features' },
			{ title: 'Pricing', href: '#pricing' },
			{ title: 'Testimonials', href: '#testimonials' },
			{ title: 'Integration', href: '/' },
		],
	},
	{
		label: 'Company',
		links: [
			{ title: 'FAQs', href: '/faqs' },
			{ title: 'About Us', href: '/about' },
			{ title: 'Privacy Policy', href: '/privacy' },
			{ title: 'Terms of Services', href: '/terms' },
		],
	},
	{
		label: 'Resources',
		links: [
			{ title: 'Blog', href: '/blog' },
			{ title: 'Changelog', href: '/changelog' },
			{ title: 'Brand', href: '/brand' },
			{ title: 'Help', href: '/help' },
		],
	},
	{
		label: 'Social Links',
		links: [
			{ title: 'Facebook', href: '#', icon: FacebookIcon },
			{ title: 'Instagram', href: '#', icon: InstagramIcon },
			{ title: 'Youtube', href: '#', icon: YoutubeIcon },
			{ title: 'LinkedIn', href: '#', icon: LinkedinIcon },
		],
	},
];

export function Footer({
	brandLogo,
	brandName = 'Asme',
	brandDescription,
	sections = defaultFooterLinks,
	className = '',
	bottomContent,
}: FooterProps = {}) {
	return (
		<footer className={`w-full border-t border-line bg-surface-2/60 ${className}`}>
			<div className="container-page py-14 lg:py-16">
				<div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
					<div className="space-y-4 max-w-sm">
						{brandLogo ? brandLogo : <FrameIcon className="size-8 text-accent" />}
						{brandDescription && (
							<p className="text-sm text-ink-2 leading-relaxed">{brandDescription}</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
						{sections.map((section) => (
							<div key={section.label}>
								<h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">{section.label}</h3>
								<ul className="mt-4 space-y-2.5 text-sm">
									{section.links.map((link) => (
										<li key={link.title}>
											<a
												href={link.href}
												onClick={link.onClick}
												className="text-ink-2 hover:text-accent transition-colors"
											>
												{link.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				{bottomContent ? (
					<div className="mt-12 pt-6 border-t border-line">{bottomContent}</div>
				) : (
					<p className="mt-12 pt-6 border-t border-line text-xs text-ink-3">
						© {new Date().getFullYear()} {brandName}. All rights reserved.
					</p>
				)}
			</div>
		</footer>
	);
}
