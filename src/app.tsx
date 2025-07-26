import { TradeFeed } from "@/components/trade-feed";
import { OrderHeatmap } from "@/components/order-heatmap";
import { SymbolSelector } from "@/components/symbol-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen } from "lucide-react";
import { ChartBar } from "lucide-react";
import { useQueryState } from "nuqs";
import { OrderAlerts } from "./components/order-alerts";

export default function App() {
	const [symbol, setSymbol] = useQueryState("symbol", {
		defaultValue: "btcusdt",
	});

	return (
		<div>
			<div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
				<div className="border-b pb-4 flex items-center justify-between">
					<SymbolSelector value={symbol} onChange={setSymbol} />
					<ThemeToggle />
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="col-span-1 space-y-3">
						<h1 className="text-xl font-medium flex items-center gap-2">
							<BookOpen className="size-5 text-primary" />
							Trades
						</h1>
						<div className="flex-1 space-y-3">
							<TradeFeed key={`trade-${symbol}`} symbol={symbol} />
							<OrderAlerts />
						</div>
					</div>
					<div className="col-span-1 space-y-3">
						<h1 className="text-xl font-medium flex items-center gap-2">
							<ChartBar className="size-5 text-primary" />
							Heatmap
						</h1>
						<OrderHeatmap key={`order-${symbol}`} symbol={symbol} />
					</div>
				</div>
			</div>
		</div>
	);
}
