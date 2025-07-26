import { create } from "zustand";

export interface Trade {
	price: number;
	qty: number;
	isBuyerMaker: boolean;
	time: number;
}

interface TradesStore {
	trades: Trade[];
	setTrades: (trades: Trade[]) => void;
	addTrade: (trade: Trade) => void;
	clearTrades: () => void;
}

export const useTradesStore = create<TradesStore>((set) => ({
	trades: [],
	setTrades: (trades) => set({ trades }),
	addTrade: (trade) =>
		set((state) => ({
			trades: [...state.trades.slice(-200), trade],
		})),
	clearTrades: () => set({ trades: [] }),
}));
