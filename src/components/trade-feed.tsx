import { useTradeStream } from "@/hooks/use-trade-stream";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { formatQuantity } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { DataCard } from "@/components/ui/data-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTradesStore } from "@/stores/use-trades-store";

export function TradeFeed({ symbol = "btcusdt" }) {
	useTradeStream(symbol);
	const { trades } = useTradesStore();

	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);

	const reversedTrades = trades.slice().reverse();

	const rowVirtualizer = useVirtualizer({
		count: reversedTrades.length,
		getScrollElement: () => scrollerRef.current,
		estimateSize: () => 20,
		overscan: 8,
	});

	const headers = (
		<div className="flex justify-between">
			<span className="text-muted-foreground">Price</span>
			<div className="flex-1"></div>
			<span className="text-muted-foreground w-[100px] text-right">Qty</span>
			<span className="text-muted-foreground w-[140px] text-right">Time</span>
		</div>
	);

	return (
		<DataCard headers={headers} className="overflow-hidden">
			<ScrollArea ref={scrollAreaRef} className="h-130">
				<div
					ref={scrollerRef}
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
					className="group/trade-feed"
				>
					<AnimatePresence initial={false}>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => {
							const t = reversedTrades[virtualRow.index];
							if (!t) return null;

							return (
								<div
									key={`trade-${virtualRow.key}`}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: `${virtualRow.size}px`,
										transform: `translateY(${virtualRow.start}px)`,
									}}
								>
									<motion.div
										layout
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="[&>div]:hover:opacity-100 [&>div]:transition-opacity [&>div]:duration-200"
									>
										<div className="flex items-center px-4 justify-between hover:bg-muted group-hover/trade-feed:opacity-40">
											<span className={t.isBuyerMaker ? "text-red-500" : "text-green-500"}>
												{formatQuantity(t.price).full}
											</span>
											<div className="flex-1" />
											<span className="w-[100px] text-right">{formatQuantity(t.qty).full}</span>
											<span className="text-muted-foreground w-[140px] text-xs text-right">
												{new Date(t.time).toLocaleTimeString()}
											</span>
										</div>
									</motion.div>
								</div>
							);
						})}
					</AnimatePresence>
				</div>
			</ScrollArea>
		</DataCard>
	);
}
