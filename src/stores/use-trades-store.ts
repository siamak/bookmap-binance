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
	addTrade: (trade: Trade) => {
		set((state) => {
			const trades = [...state.trades];

			const lastTrade = trades[trades.length - 1];
			if (lastTrade && lastTrade.price === trade.price) {
				trades[trades.length - 1] = {
					...lastTrade,
					qty: lastTrade.qty + trade.qty,
					time: trade.time,
				};
			} else {
				trades.push(trade);
			}

			const limited = trades.slice(-100);

			return { trades: limited };
		});
	},
	clearTrades: () => set({ trades: [] }),
}));
