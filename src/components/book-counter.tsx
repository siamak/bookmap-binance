import { useState, useEffect, useCallback } from "react";
import { useOrderBookStream } from "@/hooks/use-order-book-stream";
import { formatQuantity } from "@/lib/utils";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentStore } from "@/stores/use-document-store";

export function BookCounter() {
	const { symbol } = useDocumentStore();
	const { bids, asks } = useOrderBookStream(symbol, 100);
	const [numberOfRows, setNumberOfRows] = useState(6);
	const [isRunning, setIsRunning] = useState(false);
	const [isFixed, setIsFixed] = useState(false);
	const [buyPressure, setBuyPressure] = useState(0);
	const [sellPressure, setSellPressure] = useState(0);
	const [calculationMethod, setCalculationMethod] = useState<"weighted" | "depth" | "combined">("combined");
	const [showDebug, setShowDebug] = useState(false);

	// Calculate order pressure with price weighting and market depth analysis
	const calculatePressure = useCallback(() => {
		if (!isRunning || bids.length === 0 || asks.length === 0) return;

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
	}, [bids, asks, numberOfRows, isRunning, calculationMethod]);

	// Update pressure when data changes
	useEffect(() => {
		if (isRunning) {
			calculatePressure();
		}
	}, [calculatePressure, isRunning]);

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

	// Toggle fixed mode
	const toggleFixed = () => {
		setIsFixed((prev) => !prev);
		if (isFixed) {
			setIsRunning(false);
		}
	};

	// Toggle stop/start
	const toggleRunning = () => {
		setIsRunning((prev) => !prev);
	};

	const totalPressure = buyPressure + sellPressure;
	const buyPercentage = totalPressure > 0 ? (buyPressure / totalPressure) * 100 : 50;
	const sellPercentage = 100 - buyPercentage;

	return (
		<div className="space-y-4">
			{/* Book Counter Controls */}
			<DataCard title="Book Counter" className="space-y-3">
				<div className="flex items-center gap-4 pt-0 p-4">
					<div className="flex items-center gap-2">
						<Label className="text-sm text-muted-foreground">number of rows</Label>
						<Input
							type="number"
							value={numberOfRows}
							onChange={(e) => setNumberOfRows(Number(e.target.value))}
							className="w-16 h-8 text-center"
							min={1}
							max={50}
						/>
					</div>
					<div className="flex gap-2">
						<Button
							variant={isFixed ? "default" : "outline"}
							size="sm"
							onClick={toggleFixed}
							className="text-xs"
						>
							fixed
						</Button>
						<Button
							variant={isRunning ? "default" : "outline"}
							size="sm"
							onClick={toggleRunning}
							className="text-xs"
						>
							{isRunning ? "stop" : "start"}
						</Button>
						<Button
							variant={showDebug ? "default" : "outline"}
							size="sm"
							onClick={() => setShowDebug(!showDebug)}
							className="text-xs"
						>
							debug
						</Button>
					</div>
				</div>

				{/* Calculation Method Selector */}
				<div className="px-4 pb-4">
					<div className="flex items-center gap-2 mb-2">
						<Label className="text-sm text-muted-foreground">calculation method</Label>
					</div>
					<div className="flex gap-1">
						<Button
							variant={calculationMethod === "weighted" ? "default" : "outline"}
							size="sm"
							onClick={() => setCalculationMethod("weighted")}
							className="text-xs"
						>
							weighted
						</Button>
						<Button
							variant={calculationMethod === "depth" ? "default" : "outline"}
							size="sm"
							onClick={() => setCalculationMethod("depth")}
							className="text-xs"
						>
							depth
						</Button>
						<Button
							variant={calculationMethod === "combined" ? "default" : "outline"}
							size="sm"
							onClick={() => setCalculationMethod("combined")}
							className="text-xs"
						>
							combined
						</Button>
					</div>
				</div>

				{/* Debug Information */}
				{showDebug && (
					<div className="px-4 pb-4 text-xs text-muted-foreground space-y-1">
						<div>Method: {calculationMethod}</div>
						<div>Rows: {numberOfRows}</div>
						<div>Bids: {bids.length} levels</div>
						<div>Asks: {asks.length} levels</div>
						{bids.length > 0 && asks.length > 0 && (
							<div>Mid Price: {((bids[0][0] + asks[0][0]) / 2).toFixed(2)}</div>
						)}
					</div>
				)}
			</DataCard>

			{/* Pressure Visualization Bar */}
			<div className="relative h-5 bg-muted rounded-lg overflow-hidden">
				{/* Buy Pressure (Green) */}
				<div
					className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300 ease-out"
					style={{ width: `${buyPercentage}%` }}
				>
					<div className="flex items-center justify-center h-full text-white font-mono text-sm font-medium">
						{formatQuantity(buyPressure).short}
					</div>
				</div>

				{/* Sell Pressure (Red) */}
				<div
					className="absolute right-0 top-0 h-full bg-red-600 transition-all duration-300 ease-out"
					style={{ width: `${sellPercentage}%` }}
				>
					<div className="flex items-center justify-center h-full text-white font-mono text-sm font-medium">
						{formatQuantity(sellPressure).short}
					</div>
				</div>
			</div>

			{/* Status indicator */}
			{isRunning && (
				<div className="text-xs text-muted-foreground text-center">
					Counter running - Press spacebar to stop
				</div>
			)}
		</div>
	);
}
