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
}

export const useAlertStore = create<AlertStore>((set) => ({
	alerts: [],
	pushAlert: (alert) => {
		const id = crypto.randomUUID();
		set((state) => ({
			alerts: [...state.alerts.slice(-9), { ...alert, id }],
		}));
		setTimeout(() => {
			set((state) => ({
				alerts: state.alerts.filter((a) => a.id !== id),
			}));
		}, 7000);
	},
	removeAlert: (id) =>
		set((state) => ({
			alerts: state.alerts.filter((a) => a.id !== id),
		})),
}));
