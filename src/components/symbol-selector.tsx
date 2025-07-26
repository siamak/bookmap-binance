import { useSymbols } from "@/hooks/use-symbols";
import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTradesStore } from "@/stores/use-trades-store";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { useDocumentStore } from "@/stores/use-document-store";

export function SymbolSelector() {
	const { symbol, setSymbol, quoteAsset } = useDocumentStore();
	const { symbols, loading: symbolsLoading, error } = useSymbols(quoteAsset);
	const { trades } = useTradesStore();
	const [open, setOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const parentRef = useRef<HTMLDivElement>(null);

	// Get current price from latest trade
	const currentPrice = useMemo(() => {
		if (trades.length === 0) return null;
		const latestTrade = trades[trades.length - 1];
		return latestTrade.price;
	}, [trades]);

	// Filter symbols based on search
	const filteredSymbols = useMemo(() => {
		if (!searchValue.trim()) return symbols;
		return symbols.filter((symbol) => symbol.toLowerCase().includes(searchValue.toLowerCase()));
	}, [symbols, searchValue]);

	// Virtualizer setup - stable reference
	const rowVirtualizer = useVirtualizer({
		count: filteredSymbols.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 32,
		overscan: 4,
	});

	// Recalculate virtualizer when filtered symbols change
	useEffect(() => {
		rowVirtualizer.measure();
	}, [filteredSymbols.length, rowVirtualizer]);

	return (
		<div className="flex flex-row items-center gap-2">
			<Popover modal open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						id="symbol"
						type="button"
						className="w-fit uppercase"
						aria-expanded={open}
					>
						<div className="flex flex-col items-start">
							<span>{symbol ? symbol : "Select symbol"}</span>
						</div>
						<ChevronDown className="ml-2" />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="p-0 w-[300px]">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder="Search symbol..."
							value={searchValue}
							onValueChange={setSearchValue}
						/>
						<CommandList>
							{symbolsLoading ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="animate-spin h-5 w-5 text-gray-500" />
								</div>
							) : error ? (
								<div className="flex items-center justify-center py-4 text-red-500">Error: {error}</div>
							) : symbols.length === 0 ? (
								<div className="flex items-center justify-center py-4 text-gray-500">
									No symbols available
								</div>
							) : filteredSymbols.length === 0 && searchValue ? (
								<div className="flex items-center justify-center py-4 text-gray-500">
									No symbols found
								</div>
							) : (
								<div
									ref={parentRef}
									style={{
										maxHeight: "300px",
										width: "100%",
										overflow: "auto",
										position: "relative",
									}}
								>
									<div
										style={{
											height: `${rowVirtualizer.getTotalSize()}px`,
											width: "100%",
											position: "relative",
										}}
									>
										{rowVirtualizer.getVirtualItems().map((virtualRow) => {
											const sym = filteredSymbols[virtualRow.index];
											if (!sym) return null;

											return (
												<div
													key={`${sym}-${virtualRow.index}`}
													style={{
														position: "absolute",
														top: 0,
														left: 0,
														width: "100%",
														height: `${virtualRow.size}px`,
														transform: `translateY(${virtualRow.start}px)`,
													}}
												>
													<CommandItem
														value={sym}
														className={cn(
															"uppercase",
															symbol === sym && "bg-accent text-accent-foreground"
														)}
														onSelect={() => {
															setSymbol(sym);
															setOpen(false);
															setSearchValue("");
														}}
													>
														{sym}
													</CommandItem>
												</div>
											);
										})}
									</div>
								</div>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{currentPrice && (
				<SlidingNumber
					number={currentPrice}
					className="px-1 tabular-nums text-muted-foreground font-normal"
					decimalPlaces={currentPrice?.toString().split(".")[1]?.length ?? 0}
					prefix="$"
					transition={{
						stiffness: 200,
						damping: 20,
						mass: 0.4,
					}}
				/>
			)}
		</div>
	);
}
