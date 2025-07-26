import { useEffect, useRef, useCallback } from "react";
import { useTradesStore } from "@/stores/use-trades-store";

export function useTradeStream(symbol = "btcusdt") {
	const { addTrade, clearTrades } = useTradesStore();
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Clear trades when symbol changes
	useEffect(() => {
		clearTrades();
	}, [symbol, clearTrades]);

	const connectWebSocket = useCallback(() => {
		// Close existing connection if any
		if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
			wsRef.current.close();
		}

		const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
		wsRef.current = ws;

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
				addTrade(trade);
			} catch (error) {
				console.error("Error processing trade data:", error);
			}
		};

		ws.onerror = (error) => {
			console.error(`Trade WebSocket error for ${symbol}:`, error);
		};

		ws.onclose = (event) => {
			console.log(`Trade WebSocket closed for ${symbol}:`, event.code, event.reason);

			// Only attempt reconnection if it wasn't a manual close
			if (event.code !== 1000 && !event.wasClean) {
				console.log(`Attempting to reconnect trade stream for ${symbol} in 3 seconds...`);
				reconnectTimeoutRef.current = setTimeout(() => {
					connectWebSocket();
				}, 3000);
			}
		};

		return ws;
	}, [symbol, addTrade]);

	useEffect(() => {
		const ws = connectWebSocket();

		return () => {
			// Clear any pending reconnection
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}

			// Close WebSocket if it's open
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.close(1000, "Component unmounting");
			}
		};
	}, [connectWebSocket]);
}
