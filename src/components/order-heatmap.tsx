import { motion } from "motion/react";
import { useOrderBookStream } from "@/hooks/use-order-book-stream";
import { useWallDetection } from "@/hooks/use-wall-detection";
import { formatQuantity } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataCard } from "@/components/ui/data-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useRef } from "react";
import { useAlertStore } from "@/stores/use-alert-store";
import { ArrowBigRight } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDocumentStore } from "@/stores/use-document-store";

// Types
type OrderBookEntry = [price: number, quantity: number];
type OrderType = "bid" | "ask";

// Constants
const ORDER_BOOK_DEPTH = 40;
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

// Find nearest order book entry to a specific price
function findNearestOrder(
	orders: OrderBookEntry[],
	targetPrice: number
): { entry: OrderBookEntry; index: number; distance: number } | null {
	if (orders.length === 0) return null;

	let nearestIndex = 0;
	let minDistance = Math.abs(orders[0][0] - targetPrice);

	for (let i = 1; i < orders.length; i++) {
		const distance = Math.abs(orders[i][0] - targetPrice);
		if (distance < minDistance) {
			minDistance = distance;
			nearestIndex = i;
		}
	}

	return {
		entry: orders[nearestIndex],
		index: nearestIndex,
		distance: minDistance,
	};
}

// Calculate position as percentage (0-1) within the order book
function calculatePosition(orders: OrderBookEntry[], targetPrice: number): number {
	if (orders.length === 0) return 0;
	if (orders.length === 1) return 0.5;

	const nearest = findNearestOrder(orders, targetPrice);
	if (!nearest) return 0;

	return 74 + nearest.index * 24;
}

// Main utility function to find nearest item and position
function findNearestItemAndPosition(
	orders: OrderBookEntry[],
	targetPrice: number
): {
	nearest: OrderBookEntry | null;
	index: number;
	position: number;
} {
	const nearest = findNearestOrder(orders, targetPrice);
	const position = calculatePosition(orders, targetPrice);

	return {
		nearest: nearest?.entry || null,
		index: nearest?.index || 0,
		position,
	};
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
				<div
					className="flex justify-between px-4 py-[2px] w-full cursor-help relative"
					style={{ backgroundColor }}
				>
					{shine && <ShineEffect />}
					<span className="relative z-10">{displayPrice}</span>
					<span className="relative z-10">{formatQuantity(quantity).short}</span>
				</div>
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
	indicatorPosition: number;
}

function OrderBookSection({
	title,
	icon,
	titleColor,
	orders,
	maxQuantity,
	orderType,
	activeShines,
	indicatorPosition,
}: OrderBookSectionProps) {
	const { symbol } = useDocumentStore();
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: orders.length,
		getScrollElement: () => scrollerRef.current,
		estimateSize: () => 24,
		overscan: 2,
	});

	const headers = (
		<div className="flex justify-between">
			<span>Price</span>
			<span>Qty</span>
		</div>
	);

	return (
		<DataCard title={`${icon} ${title}`} titleClassName={titleColor} headers={headers} className="relative flex-1">
			<ArrowBigRight
				className={`absolute top-0 -left-1 size-5 ${orderType === "bid" ? "text-green-500" : "text-red-500"}`}
				style={{ top: `${indicatorPosition + 2}px` }}
			/>
			<ScrollArea ref={scrollAreaRef} className="h-120">
				<div
					ref={scrollerRef}
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const [price, quantity] = orders[virtualRow.index];
						const shineKey = `${orderType}-${price}`;

						return (
							<div
								key={`${orderType}-${symbol}-${virtualRow.key}`}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<OrderRow
									price={price}
									quantity={quantity}
									backgroundColor={getIntensityColor(quantity, maxQuantity, orderType === "bid")}
									orderType={orderType}
									shine={activeShines.has(shineKey)}
								/>
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</DataCard>
	);
}

export function OrderHeatmap() {
	const { symbol } = useDocumentStore();
	const { bids, asks } = useOrderBookStream(symbol, ORDER_BOOK_DEPTH);
	const [targetPrice, setTargetPrice] = useState<number>(0);
	const { alerts } = useAlertStore();
	const [activeShines, setActiveShines] = useState<Set<string>>(new Set());

	// Enable wall detection
	useWallDetection(bids, asks);

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

	const bidResult = findNearestItemAndPosition(bids, targetPrice);
	const askResult = findNearestItemAndPosition(asks, targetPrice);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col md:flex-row gap-4 text-xs font-mono">
				<OrderBookSection
					title="Bids"
					icon="🟢"
					titleColor="text-green-400"
					orders={bids}
					maxQuantity={maxBidQuantity}
					orderType="bid"
					activeShines={activeShines}
					indicatorPosition={bidResult.position}
				/>
				<OrderBookSection
					title="Asks"
					icon="🔴"
					titleColor="text-red-400"
					orders={asks}
					maxQuantity={maxAskQuantity}
					orderType="ask"
					activeShines={activeShines}
					indicatorPosition={askResult.position}
				/>
			</div>
			<div className="flex gap-2 items-center">
				<Label className="text-muted-foreground">Near Price</Label>
				<Input
					type="number"
					value={targetPrice}
					onChange={(e) => setTargetPrice(Number(e.target.value))}
					className="w-24"
				/>
			</div>
		</div>
	);
}
