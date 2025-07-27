import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function InfoAccordion() {
	return (
		<Accordion type="multiple" className="border rounded-lg">
			{/* Binance Info */}
			<AccordionItem value="binance">
				<AccordionTrigger className="p-4 flex items-start gap-3">
					<h2 className="text-lg font-semibold text-foreground">Binance Futures</h2>
				</AccordionTrigger>
				<AccordionContent className="px-4 pb-4 text-sm text-muted-foreground space-y-1">
					<ul className="list-disc list-inside">
						<li>This application connects to Binance Futures API for real-time market data</li>
						<li>Data includes live trades, order book depth, and price movements</li>
						<li>All data is publicly available and does not require authentication</li>
						<li>Updates are streamed in real-time for accurate market monitoring</li>
					</ul>
				</AccordionContent>
			</AccordionItem>

			{/* Risk Disclaimer */}
			<AccordionItem value="disclaimer">
				<AccordionTrigger className="p-4 flex items-start gap-3">
					<h3 className="text-lg font-semibold text-foreground">Important Information</h3>
				</AccordionTrigger>
				<AccordionContent className="px-4 pb-4 text-sm text-muted-foreground space-y-1">
					<ul className="list-disc list-inside">
						<li>This is a data visualization tool only - no trading functionality</li>
						<li>Cryptocurrency trading involves substantial risk of loss</li>
						<li>Past performance does not guarantee future results</li>
						<li>Always conduct your own research before making investment decisions</li>
						<li>Consider consulting with a financial advisor for investment advice</li>
					</ul>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
