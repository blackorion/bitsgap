import { ProfitTarget } from './model';

export function createDefaultTarget(id: string, initialProfit: number, initialPrice: number): ProfitTarget {
    const profit = initialProfit + 2;
    const targetPrice = initialPrice + (initialPrice * profit);
    const amount = 20;

    return { id, profit, targetPrice, amount };
}

export function reduceHighestAmount(targets: ProfitTarget[]): ProfitTarget[] {
    let maxIx = 0;
    let total = 0;

    targets.forEach((target, ix) => {
        if (target.amount > targets[maxIx].amount)
            maxIx = ix;

        total += target.amount;
    });

    if (total <= 100)
        return targets;

    targets[maxIx].amount -= Math.min(total - 100, targets[maxIx].amount);

    return targets;
}