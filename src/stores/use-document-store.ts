import { create } from "zustand";

interface DocumentStore {
	symbol: string;
	quoteAsset: string;
	setSymbol: (symbol: string) => void;
	setQuoteAsset: (quoteAsset: string) => void;
	resetSymbol: () => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
	symbol: "btcusdt",
	quoteAsset: "USDT",
	setSymbol: (symbol) => set({ symbol }),
	setQuoteAsset: (quoteAsset) => set({ quoteAsset }),
	resetSymbol: () => set({ symbol: "" }),
}));
