import { usePageVisibilityStore } from "@/stores/use-page-visibility-store";

/**
 * Hook to access page visibility state from the centralized store
 * @returns boolean indicating if the page is currently visible
 */
export function usePageVisibility() {
	return usePageVisibilityStore((state) => state.isVisible);
}
