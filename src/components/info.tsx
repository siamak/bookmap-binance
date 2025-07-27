import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info as InfoIcon, AlertTriangle } from "lucide-react";

export function InfoAccordion() {
	return (
		<Accordion type="multiple" className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4 gap-2">
			{/* Binance Info */}
			<AccordionItem
				value="binance"
				className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
			>
				<AccordionTrigger className="p-4 flex items-start gap-3">
					<InfoIcon className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
					<h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
						Binance Futures Real-Time Data
					</h2>
				</AccordionTrigger>
				<AccordionContent className="px-4 pb-4 text-sm text-blue-800 dark:text-blue-200 space-y-1">
					<p>• This application connects to Binance Futures API for real-time market data</p>
					<p>• Data includes live trades, order book depth, and price movements</p>
					<p>• All data is publicly available and does not require authentication</p>
					<p>• Updates are streamed in real-time for accurate market monitoring</p>
				</AccordionContent>
			</AccordionItem>

			{/* Risk Disclaimer */}
			<AccordionItem
				value="disclaimer"
				className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg"
			>
				<AccordionTrigger className="p-4 flex items-start gap-3">
					<AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
					<h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Important Information</h3>
				</AccordionTrigger>
				<AccordionContent className="px-4 pb-4 text-sm text-amber-800 dark:text-amber-200 space-y-1">
					<p>• This is a data visualization tool only - no trading functionality</p>
					<p>• Cryptocurrency trading involves substantial risk of loss</p>
					<p>• Past performance does not guarantee future results</p>
					<p>• Always conduct your own research before making investment decisions</p>
					<p>• Consider consulting with a financial advisor for investment advice</p>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
