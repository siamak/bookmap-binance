import { create } from "zustand";

interface PageVisibilityState {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
}

export const usePageVisibilityStore = create<PageVisibilityState>((set) => ({
	isVisible: !document.hidden,
	setVisible: (visible) => set({ isVisible: visible }),
}));

// Initialize the store with current visibility state
if (typeof window !== "undefined") {
	// Set initial state
	usePageVisibilityStore.getState().setVisible(!document.hidden);

	// Listen for visibility changes
	document.addEventListener("visibilitychange", () => {
		usePageVisibilityStore.getState().setVisible(!document.hidden);
	});
}
