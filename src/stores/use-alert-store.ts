import { create } from "zustand";

type AlertType = "wall" | "remove" | "trade";

interface AlertItem {
	id: string;
	type: AlertType;
	message: string;
	side?: "bid" | "ask";
	price?: number;
}

interface AlertStore {
	alerts: AlertItem[];
	pushAlert: (alert: Omit<AlertItem, "id">) => void;
	removeAlert: (id: string) => void;
	clearAlerts: () => void;
}

// Store timeout references to prevent memory leaks
const alertTimeouts = new Map<string, NodeJS.Timeout>();

export const useAlertStore = create<AlertStore>((set) => ({
	alerts: [],
	pushAlert: (alert) => {
		const id = crypto.randomUUID();

		// Clear any existing timeout for this alert (shouldn't happen, but safety)
		if (alertTimeouts.has(id)) {
			clearTimeout(alertTimeouts.get(id)!);
		}

		set((state) => ({
			alerts: [...state.alerts.slice(-9), { ...alert, id }],
		}));

		// Set timeout to remove alert
		const timeout = setTimeout(() => {
			set((state) => ({
				alerts: state.alerts.filter((a) => a.id !== id),
			}));
			alertTimeouts.delete(id);
		}, 7000);

		alertTimeouts.set(id, timeout);
	},
	removeAlert: (id) => {
		// Clear timeout if it exists
		if (alertTimeouts.has(id)) {
			clearTimeout(alertTimeouts.get(id)!);
			alertTimeouts.delete(id);
		}

		set((state) => ({
			alerts: state.alerts.filter((a) => a.id !== id),
		}));
	},
	clearAlerts: () => {
		// Clear all timeouts
		alertTimeouts.forEach((timeout) => clearTimeout(timeout));
		alertTimeouts.clear();

		set({ alerts: [] });
	},
}));
