import { useSymbols } from "@/hooks/use-symbols";
import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTradesStore } from "@/stores/use-trades-store";
import { useDocumentStore } from "@/stores/use-document-store";
import { ThrottledPrice } from "@/components/throttled-price";

export function SymbolSelector() {
	const { symbol, setSymbol, quoteAsset } = useDocumentStore();
	const { symbols, loading: symbolsLoading, error } = useSymbols(quoteAsset);
	const { trades } = useTradesStore();
	const [open, setOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const parentRef = useRef<HTMLDivElement>(null);

	const filteredSymbols = useMemo(() => {
		if (!searchValue.trim()) return symbols;
		return symbols.filter((symbol) => symbol.toLowerCase().includes(searchValue.toLowerCase()));
	}, [symbols, searchValue]);

	const rowVirtualizer = useVirtualizer({
		count: filteredSymbols.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 32,
		overscan: 4,
	});

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

			<ThrottledPrice trades={trades} prefix="$" />
		</div>
	);
}
