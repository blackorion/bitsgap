export type OrderSide = 'buy' | 'sell';

export interface ProfitTarget {
    id: string;
    profit: number;
    targetPrice: number;
    amount: number;
}

export interface ProfitTargetErrors {
    id: string;
    errors?: Record<Partial<keyof ProfitTarget>, string[]>;
}