import { useStore } from './context';

export function useTargets() {
    const { takeProfit } = useStore();

    return takeProfit;
}