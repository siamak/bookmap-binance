"use client";

import { useEffect, useRef, useState } from "react";
import { SlidingNumber } from "@/components/ui/sliding-number";

type Trade = {
	price: number;
};

interface ThrottledPriceProps {
	trades: Trade[];
	className?: string;
	prefix?: string;
	updateInterval?: number;
	minDelta?: number;
}

export function ThrottledPrice({
	trades,
	className,
	prefix = "$",
	updateInterval = 250,
	minDelta = 0.01,
}: ThrottledPriceProps) {
	const [displayPrice, setDisplayPrice] = useState<number | null>(null);
	const lastPriceRef = useRef<number | null>(null);

	useEffect(() => {
		if (!trades.length) return;

		const interval = setInterval(() => {
			const latest = trades[trades.length - 1]?.price;
			if (latest == null) return;

			const last = lastPriceRef.current;

			if (last === null || Math.abs(latest - last) >= minDelta) {
				lastPriceRef.current = latest;
				setDisplayPrice(latest);
			}
		}, updateInterval);

		return () => clearInterval(interval);
	}, [trades, updateInterval, minDelta]);

	if (displayPrice === null) return null;

	return (
		<SlidingNumber
			number={Number(displayPrice.toFixed(1))}
			className={`px-1 tabular-nums text-muted-foreground font-normal ${className ?? ""}`}
			decimalPlaces={1}
			prefix={prefix}
			transition={{
				stiffness: 200,
				damping: 20,
				mass: 0.4,
			}}
		/>
	);
}
