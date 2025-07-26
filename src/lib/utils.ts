import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatQuantity(qty: number): { short: string; full: string } {
	const full = Number.isInteger(qty)
		? qty.toLocaleString()
		: qty
				.toLocaleString(undefined, {
					minimumFractionDigits: 0,
					maximumFractionDigits: 8,
				})
				.replace(/\.0+$/, "");

	let short: string;
	if (Math.abs(qty) >= 1_000_000_000) {
		short = (qty / 1_000_000_000).toFixed(2).replace(/\.0+$/, "") + "b";
	} else if (Math.abs(qty) >= 1_000_000) {
		short = (qty / 1_000_000).toFixed(2).replace(/\.0+$/, "") + "m";
	} else if (Math.abs(qty) >= 1_000) {
		short = (qty / 1_000).toFixed(2).replace(/\.0+$/, "") + "k";
	} else {
		short = full;
	}
	return { short, full };
}
