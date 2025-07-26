import { useQueryState } from "nuqs";

// Create a custom hook that combines nuqs with Zustand
export const useDocumentStore = () => {
	const [symbol, setSymbol] = useQueryState("symbol", {
		defaultValue: "btcusdt",
		parse: (value) => value.toLowerCase(),
		serialize: (value) => value.toLowerCase(),
	});

	const [quoteAsset, setQuoteAsset] = useQueryState("quoteAsset", {
		defaultValue: "USDT",
		parse: (value) => value.toUpperCase(),
		serialize: (value) => value.toUpperCase(),
	});

	const resetSymbol = () => setSymbol("btcusdt");

	return {
		symbol,
		quoteAsset,
		setSymbol,
		setQuoteAsset,
		resetSymbol,
	};
};
