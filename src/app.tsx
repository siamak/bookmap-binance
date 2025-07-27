import { TradeFeed } from "@/components/trade-feed";
import { OrderHeatmap } from "@/components/order-heatmap";
import { BookCounter } from "@/components/book-counter";
import { SymbolSelector } from "@/components/symbol-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen, ChartBar } from "lucide-react";
import { OrderAlerts } from "@/components/order-alerts";
import { InfoAccordion } from "@/components/info";

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
				<InfoAccordion />
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
