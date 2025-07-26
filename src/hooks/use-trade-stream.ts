import { useEffect, useRef } from "react";
import { useTradesStore } from "@/stores/use-trades-store";

// Global connection manager to prevent duplicate WebSocket connections
class TradeConnectionManager {
	private static connections = new Map<
		string,
		{
			ws: WebSocket;
			subscribers: Set<() => void>;
		}
	>();

	static getConnection(symbol: string) {
		return this.connections.get(symbol);
	}

	static createConnection(symbol: string) {
		const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
		const subscribers = new Set<() => void>();

		ws.onopen = () => {
			console.log(`Trade WebSocket connected for ${symbol}`);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				const trade = {
					price: Number(data.p),
					qty: Number(data.q),
					isBuyerMaker: data.m,
					time: data.T,
				};

				// Notify all subscribers
				subscribers.forEach((callback) => callback());

				// Add trade to store
				const tradesStore = useTradesStore.getState();
				tradesStore.addTrade(trade);
			} catch (error) {
				console.error("Error processing trade data:", error);
			}
		};

		ws.onerror = (error) => {
			console.error(`Trade WebSocket error for ${symbol}:`, error);
		};

		ws.onclose = (event) => {
			console.log(`Trade WebSocket closed for ${symbol}:`, event.code, event.reason);
			this.connections.delete(symbol);
		};

		this.connections.set(symbol, { ws, subscribers });
		return { ws, subscribers };
	}

	static subscribe(symbol: string, callback: () => void) {
		let connection = this.getConnection(symbol);
		if (!connection) {
			connection = this.createConnection(symbol);
		}
		connection.subscribers.add(callback);
		return () => {
			connection?.subscribers.delete(callback);
			if (connection?.subscribers.size === 0) {
				connection.ws.close(1000, "No more subscribers");
				this.connections.delete(symbol);
			}
		};
	}
}

export function useTradeStream(symbol = "btcusdt") {
	const { clearTrades } = useTradesStore();
	const isMountedRef = useRef(true);

	// Clear trades when symbol changes
	useEffect(() => {
		clearTrades();
	}, [symbol, clearTrades]);

	// Set mounted flag
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Subscribe to trade updates
	useEffect(() => {
		const unsubscribe = TradeConnectionManager.subscribe(symbol, () => {
			// The trade is already added to the store in the connection manager
			// This callback can be used for additional processing if needed
		});

		return unsubscribe;
	}, [symbol]);
}
