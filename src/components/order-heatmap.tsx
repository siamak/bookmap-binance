import { motion, AnimatePresence } from "motion/react";
import { useOrderBookStream } from "@/hooks/use-order-book-stream";
import { formatQuantity } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataCard } from "@/components/ui/data-card";
import { useEffect, useState } from "react";
import { useAlertStore } from "@/stores/use-alert-store";

// Types
type OrderBookEntry = [price: number, quantity: number];
type OrderType = "bid" | "ask";

// Constants
const ORDER_BOOK_DEPTH = 40;
const ANIMATION_DURATION = 1;
const SHINE_DURATION = 2000; // ms

// Utility functions
function getIntensityColor(quantity: number, maxQuantity: number, isBid: boolean): string {
	const percent = quantity / maxQuantity;
	const alpha = Math.min(1, percent);
	const color = isBid ? "0,200,0" : "200,0,0";
	return `rgba(${color}, ${alpha.toFixed(2)})`;
}

function getMaxQuantity(orders: OrderBookEntry[]): number {
	return Math.max(...orders.map(([, qty]) => qty), 1);
}

// Shine effect component
function ShineEffect() {
	return (
		<motion.div
			className="absolute inset-0 pointer-events-none overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: [0, 1, 0] }}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				repeatDelay: 3,
				ease: "easeInOut",
			}}
		>
			<motion.div
				className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-foreground mix-blend-overlay skew-x-16"
				animate={{
					x: ["-100%", "100%"],
				}}
				transition={{
					duration: 1.5,
					repeat: Infinity,
					repeatDelay: 3,
					ease: "easeInOut",
				}}
			/>
		</motion.div>
	);
}

// Helper to parse alert message for wall alerts
function parseWallAlert(alertMsg: string): { side: OrderType; price: number } | null {
	// Example: "🧱 Bid Wall at 12345.0000 (1.2K)"
	const match = alertMsg.match(/(Bid|Ask) Wall at ([\d.]+)/);
	if (!match) return null;
	const side = match[1].toLowerCase() as OrderType;
	const price = parseFloat(match[2]);
	return { side, price };
}

// Component for individual order row
interface OrderRowProps {
	price: number;
	quantity: number;
	backgroundColor: string;
	orderType: OrderType;
	shine: boolean;
}

function OrderRow({ price, quantity, backgroundColor, orderType, shine }: OrderRowProps) {
	const isBid = orderType === "bid";
	const displayPrice = isBid ? price : formatQuantity(price).full;

	return (
		<Tooltip delayDuration={100}>
			<TooltipTrigger asChild>
				<motion.div
					layout
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: ANIMATION_DURATION }}
					className="flex justify-between px-4 py-[2px] w-full cursor-help relative"
					style={{ backgroundColor }}
				>
					{shine && <ShineEffect />}
					<span className="relative z-10">{displayPrice}</span>
					<span className="relative z-10">{formatQuantity(quantity).short}</span>
				</motion.div>
			</TooltipTrigger>
			<TooltipContent side="top" align="center" className="text-xs">
				<div className="text-center">
					<div className="font-medium">Quantity: {formatQuantity(quantity).full}</div>
					<div className="text-muted-foreground">Price: {formatQuantity(price).full}</div>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}

// Component for order book section
interface OrderBookSectionProps {
	title: string;
	icon: string;
	titleColor: string;
	orders: OrderBookEntry[];
	maxQuantity: number;
	orderType: OrderType;
	activeShines: Set<string>;
}

function OrderBookSection({
	title,
	icon,
	titleColor,
	orders,
	maxQuantity,
	orderType,
	activeShines,
}: OrderBookSectionProps) {
	const headers = (
		<div className="flex justify-between">
			<span>Price</span>
			<span>Qty</span>
		</div>
	);

	return (
		<DataCard title={`${icon} ${title}`} titleClassName={titleColor} headers={headers} className="flex-1">
			<AnimatePresence initial={false}>
				{orders.map(([price, quantity]) => {
					const shineKey = `${orderType}-${price}`;
					return (
						<OrderRow
							key={shineKey}
							price={price}
							quantity={quantity}
							backgroundColor={getIntensityColor(quantity, maxQuantity, orderType === "bid")}
							orderType={orderType}
							shine={activeShines.has(shineKey)}
						/>
					);
				})}
			</AnimatePresence>
		</DataCard>
	);
}

// Main component
interface OrderHeatmapProps {
	symbol?: string;
}

export function OrderHeatmap({ symbol = "btcusdt" }: OrderHeatmapProps) {
	const { bids, asks } = useOrderBookStream(symbol, ORDER_BOOK_DEPTH);
	const { alerts } = useAlertStore();
	const [activeShines, setActiveShines] = useState<Set<string>>(new Set());

	// Watch for new wall alerts and trigger shine
	useEffect(() => {
		if (!alerts.length) return;
		const lastAlert = alerts[alerts.length - 1];
		if (!lastAlert.message.includes("Wall at")) return;
		const parsed = parseWallAlert(lastAlert.message);
		if (!parsed) return;
		const shineKey = `${parsed.side}-${parsed.price}`;
		setActiveShines((prev) => {
			if (prev.has(shineKey)) return prev;
			const next = new Set(prev);
			next.add(shineKey);
			return next;
		});
		const timeout = setTimeout(() => {
			setActiveShines((prev) => {
				const next = new Set(prev);
				next.delete(shineKey);
				return next;
			});
		}, SHINE_DURATION);
		return () => clearTimeout(timeout);
	}, [alerts]);

	const maxBidQuantity = getMaxQuantity(bids);
	const maxAskQuantity = getMaxQuantity(asks);

	return (
		<div className="flex flex-col md:flex-row gap-4 text-xs font-mono">
			<OrderBookSection
				title="Bids"
				icon="🟢"
				titleColor="text-green-400"
				orders={bids}
				maxQuantity={maxBidQuantity}
				orderType="bid"
				activeShines={activeShines}
			/>
			<OrderBookSection
				title="Asks"
				icon="🔴"
				titleColor="text-red-400"
				orders={asks}
				maxQuantity={maxAskQuantity}
				orderType="ask"
				activeShines={activeShines}
			/>
		</div>
	);
}
