import { TradeFeed } from "@/components/trade-feed";
import { OrderHeatmap } from "@/components/order-heatmap";
import { BookCounter } from "@/components/book-counter";
import { SymbolSelector } from "@/components/symbol-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen } from "lucide-react";
import { ChartBar } from "lucide-react";
import { AlertTriangle, Info } from "lucide-react";
import { OrderAlerts } from "@/components/order-alerts";

export default function App() {
	return (
		<div>
			<div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
				<div className="border-b pb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<img src="/logo.png" alt="OrderFlow" className="h-6 w-auto" />
						<h1 className="text-xl font-medium">OrderFlow</h1>
					</div>
					<SymbolSelector />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 sm:gap-4 gap-2">
					<div className="space-y-3">
						<h1 className="text-xl font-medium flex items-center gap-2">
							<BookOpen className="size-5 text-primary" />
							Trades
						</h1>
						<div className="flex-1 space-y-3">
							<TradeFeed />
							<OrderAlerts />
						</div>
					</div>
					<div className="space-y-3">
						<h1 className="text-xl font-medium flex items-center gap-2">
							<ChartBar className="size-5 text-primary" />
							Heatmap
						</h1>
						<BookCounter />
						<OrderHeatmap />
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4 gap-2">
					{/* Header with important information */}
					<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<Info className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
							<div className="space-y-2">
								<h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
									Binance Futures Real-Time Data
								</h2>
								<div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
									<p>• This application connects to Binance Futures API for real-time market data</p>
									<p>• Data includes live trades, order book depth, and price movements</p>
									<p>• All data is publicly available and does not require authentication</p>
									<p>• Updates are streamed in real-time for accurate market monitoring</p>
								</div>
							</div>
						</div>
					</div>

					{/* Risk Disclaimer */}
					<div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
									Important Information
								</h3>
								<div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
									<p>• This is a data visualization tool only - no trading functionality</p>
									<p>• Cryptocurrency trading involves substantial risk of loss</p>
									<p>• Past performance does not guarantee future results</p>
									<p>• Always conduct your own research before making investment decisions</p>
									<p>• Consider consulting with a financial advisor for investment advice</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="flex my-5 justify-center">
				<iframe
					src="https://ghbtns.com/github-btn.html?user=siamak&repo=orderflow&type=star&count=true&size=large"
					frameBorder="0"
					scrolling="0"
					width="120"
					height="30"
					title="GitHub"
				></iframe>
			</div>
			<ThemeToggle />
		</div>
	);
}
