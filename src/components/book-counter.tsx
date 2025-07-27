import { useState, useEffect, useCallback } from "react";
import { useOrderBookStream } from "@/hooks/use-order-book-stream";
import { usePageVisibility } from "@/hooks/use-page-visibility";
import { formatQuantity } from "@/lib/utils";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentStore } from "@/stores/use-document-store";
import { Pause, Play, Triangle } from "lucide-react";
import { motion } from "motion/react";

export function BookCounter() {
	const { symbol } = useDocumentStore();
	const { bids, asks } = useOrderBookStream(symbol, 100);
	const isPageVisible = usePageVisibility();
	const [numberOfRows, setNumberOfRows] = useState(6);
	const [isRunning, setIsRunning] = useState(false);
	const [buyPressure, setBuyPressure] = useState(0);
	const [sellPressure, setSellPressure] = useState(0);
	const [calculationMethod] = useState<"weighted" | "depth" | "combined">("combined");

	// Calculate order pressure with price weighting and market depth analysis
	const calculatePressure = useCallback(() => {
		if (!isRunning || !isPageVisible || bids.length === 0 || asks.length === 0) return;

		const topBids = bids.slice(0, numberOfRows);
		const topAsks = asks.slice(0, numberOfRows);

		// Get current market price (mid-price)
		const bestBid = topBids[0]?.[0] || 0;
		const bestAsk = topAsks[0]?.[0] || 0;
		const midPrice = (bestBid + bestAsk) / 2;

		// Calculate price-weighted pressure
		const calculateWeightedPressure = (orders: [number, number][]) => {
			return orders.reduce((total, [price, quantity]) => {
				// Calculate distance from mid-price as a percentage
				const priceDistance = Math.abs(price - midPrice) / midPrice;

				// Weight factor: closer orders get higher weight (exponential decay)
				const weightFactor = Math.exp(-priceDistance * 10); // Adjust multiplier for sensitivity

				// Volume-weighted calculation
				const weightedQuantity = quantity * weightFactor;

				return total + weightedQuantity;
			}, 0);
		};

		// Calculate market depth pressure (considers order book structure)
		const calculateDepthPressure = (orders: [number, number][]) => {
			if (orders.length === 0) return 0;

			// Calculate cumulative volume at each level
			let cumulativeVolume = 0;
			let depthPressure = 0;

			orders.forEach(([price, quantity], index) => {
				cumulativeVolume += quantity;

				// Depth factor: earlier levels have more impact
				const depthFactor = 1 / (index + 1);

				// Price proximity factor
				const priceDistance = Math.abs(price - midPrice) / midPrice;
				const proximityFactor = Math.exp(-priceDistance * 5);

				depthPressure += cumulativeVolume * depthFactor * proximityFactor;
			});

			return depthPressure;
		};

		let totalBuyPressure = 0;
		let totalSellPressure = 0;

		switch (calculationMethod) {
			case "weighted": {
				totalBuyPressure = calculateWeightedPressure(topBids);
				totalSellPressure = calculateWeightedPressure(topAsks);
				break;
			}
			case "depth": {
				totalBuyPressure = calculateDepthPressure(topBids);
				totalSellPressure = calculateDepthPressure(topAsks);
				break;
			}
			case "combined":
			default: {
				const buyWeightedPressure = calculateWeightedPressure(topBids);
				const sellWeightedPressure = calculateWeightedPressure(topAsks);
				const buyDepthPressure = calculateDepthPressure(topBids);
				const sellDepthPressure = calculateDepthPressure(topAsks);

				// Combine weighted and depth pressure (70% weighted, 30% depth)
				totalBuyPressure = buyWeightedPressure * 0.7 + buyDepthPressure * 0.3;
				totalSellPressure = sellWeightedPressure * 0.7 + sellDepthPressure * 0.3;
				break;
			}
		}

		setBuyPressure(totalBuyPressure);
		setSellPressure(totalSellPressure);
	}, [bids, asks, numberOfRows, isRunning, calculationMethod, isPageVisible]);

	// Update pressure when data changes
	useEffect(() => {
		if (isRunning && isPageVisible) {
			calculatePressure();
		}
	}, [calculatePressure, isRunning, isPageVisible]);

	// Start/stop counter with spacebar
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.code === "Space") {
				event.preventDefault();
				setIsRunning((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, []);

	// Toggle stop/start
	const toggleRunning = () => {
		setIsRunning((prev) => !prev);
	};

	const totalPressure = buyPressure + sellPressure;
	const buyPercentage = totalPressure > 0 ? (buyPressure / totalPressure) * 100 : 50;
	const sellPercentage = 100 - buyPercentage;

	return (
		<div className="space-y-2">
			{/* Book Counter Controls */}
			<DataCard title="Book Counter">
				<div className="flex items-center justify-between gap-2 p-4">
					<Label className="text-sm font-normal text-muted-foreground">
						number of rows{" "}
						<kbd className="flex h-5 items-center gap-0.5 whitespace-nowrap rounded bg-muted px-1.5 text-xs text-muted-foreground ring-1 ring-inset ring-border">
							Space
						</kbd>
					</Label>
					<div className="flex items-center gap-2">
						<Input
							type="number"
							value={numberOfRows}
							onChange={(e) => setNumberOfRows(Number(e.target.value))}
							className="w-16 h-8 text-center"
							min={1}
							max={50}
						/>
						<Button
							variant={isRunning ? "default" : "outline"}
							size="sm"
							onClick={toggleRunning}
							className="text-xs"
						>
							{isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
						</Button>
					</div>
				</div>
				<div className="grid items-center grid-cols-2 gap-2 border-t ">
					{/* Seesaw Style Pressure Visualization */}
					<div className="relative flex items-center justify-center h-32 font-mono tabular-nums font-bold">
						{/* Pivot */}
						<Triangle className="absolute bottom-8 w-6 h-6 text-foreground opacity-30" />

						{/* Seesaw bar with tilt */}
						<motion.div
							className="relative w-48 h-2 bg-foreground bg-gradient-to-r from-muted via-muted-foreground to-muted rounded-sm origin-center"
							animate={{
								rotate: Math.max(-15, Math.min(15, -((buyPercentage - 50) / 50) * 15)),
							}}
							transition={{
								type: "spring",
								stiffness: 120,
								damping: 14,
							}}
						>
							{/* Left circle (Buy) */}
							<motion.div
								animate={{ opacity: buyPercentage > sellPercentage ? 1 : 0.5 }}
								transition={{ duration: 0.3 }}
								className="inline-flex items-center backdrop-blur-lg justify-center absolute ring-2 ring-background -top-9 -left-4 w-12 h-12 bg-green-500 rounded-full text-xs scale-85"
							>
								{buyPercentage.toFixed(1)}%
							</motion.div>

							{/* Right circle (Sell) */}
							<motion.div
								animate={{ opacity: sellPercentage > buyPercentage ? 1 : 0.5 }}
								transition={{ duration: 0.3 }}
								className="inline-flex items-center backdrop-blur-lg justify-center absolute ring-2 ring-background -top-9 -right-4 w-12 h-12 bg-red-500 rounded-full text-xs scale-85"
							>
								{sellPercentage.toFixed(1)}%
							</motion.div>
						</motion.div>
					</div>

					{/* Pressure Values Display */}
					<div className="flex justify-between flex-col text-xs text-muted-foreground">
						<div>Buy Pressure: {formatQuantity(buyPressure).short}</div>
						<div>Sell Pressure: {formatQuantity(sellPressure).short}</div>
					</div>
				</div>
			</DataCard>
		</div>
	);
}
