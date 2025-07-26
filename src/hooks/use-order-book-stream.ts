
import { useEffect, useState, useRef } from "react";


export type DepthLevel = [number, number]; // [price, quantity]

interface OrderBook {
	bids: Map<number, number>;
	asks: Map<number, number>;
}

interface WebSocketData {
	b?: [string, string][]; // bids: [price, quantity]
	a?: [string, string][]; // asks: [price, quantity]
}

// Global connection manager to prevent duplicate WebSocket connections
class OrderBookConnectionManager {
	private static connections = new Map<
		string,
		{
			ws: WebSocket;
			subscribers: Set<(bids: DepthLevel[], asks: DepthLevel[]) => void>;
			orderBook: OrderBook;
			lastBids: Map<string, number>;
			lastAsks: Map<string, number>;
		}
	>();

	static getConnection(symbol: string) {
		return this.connections.get(symbol);
	}

	static createConnection(symbol: string) {
		const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth`);
		const subscribers = new Set<(bids: DepthLevel[], asks: DepthLevel[]) => void>();
		const orderBook: OrderBook = {
			bids: new Map(),
			asks: new Map(),
		};
		const lastBids = new Map<string, number>();
		const lastAsks = new Map<string, number>();

		ws.onopen = () => {
			console.log(`Order book WebSocket connected for ${symbol}`);
		};

		ws.onmessage = (event) => {
			try {
				const data: WebSocketData = JSON.parse(event.data);
				const { b: newBids, a: newAsks } = data;

				// Update bids
				newBids?.forEach(([priceStr, qtyStr]: [string, string]) => {
					const price = parseFloat(priceStr);
					const quantity = parseFloat(qtyStr);

					if (quantity === 0) {
						orderBook.bids.delete(price);
					} else {
						orderBook.bids.set(price, quantity);
					}
				});

				// Update asks
				newAsks?.forEach(([priceStr, qtyStr]: [string, string]) => {
					const price = parseFloat(priceStr);
					const quantity = parseFloat(qtyStr);

					if (quantity === 0) {
						orderBook.asks.delete(price);
					} else {
						orderBook.asks.set(price, quantity);
					}
				});

				// Notify all subscribers
				const sortedBids = Array.from(orderBook.bids.entries()).sort((a, b) => b[0] - a[0]);
				const sortedAsks = Array.from(orderBook.asks.entries()).sort((a, b) => a[0] - b[0]);

				subscribers.forEach((callback) => callback(sortedBids, sortedAsks));
			} catch (error) {
				console.error("Error processing order book data:", error);
			}
		};

		ws.onerror = (error) => {
			console.error(`Order book WebSocket error for ${symbol}:`, error);
		};

		ws.onclose = (event) => {
			console.log(`Order book WebSocket closed for ${symbol}:`, event.code, event.reason);
			this.connections.delete(symbol);
		};

		this.connections.set(symbol, { ws, subscribers, orderBook, lastBids, lastAsks });
		return { ws, subscribers, orderBook, lastBids, lastAsks };
	}

	static subscribe(symbol: string, callback: (bids: DepthLevel[], asks: DepthLevel[]) => void) {
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

export function useOrderBookStream(symbol = "btcusdt", depthLimit = 20) {
	const [bids, setBids] = useState<DepthLevel[]>([]);
	const [asks, setAsks] = useState<DepthLevel[]>([]);
	const isMountedRef = useRef(true);

	// Set mounted flag
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Subscribe to order book updates
	useEffect(() => {
		const unsubscribe = OrderBookConnectionManager.subscribe(symbol, (newBids, newAsks) => {
			if (!isMountedRef.current) return;

			setBids(newBids.slice(0, depthLimit));
			setAsks(newAsks.slice(0, depthLimit));
		});

		return unsubscribe;
	}, [symbol, depthLimit]);

	// Clear data when symbol changes
	useEffect(() => {
		setBids([]);
		setAsks([]);
	}, [symbol]);

	return { bids, asks };
}
