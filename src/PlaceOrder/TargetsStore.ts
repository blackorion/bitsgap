import { action, computed, observable } from 'mobx';
import { ProfitTarget, ProfitTargetErrors } from './model';
import { PlaceOrderStore } from './store/PlaceOrderStore';
import { nanoid } from 'nanoid';
import { createDefaultTarget, reduceHighestAmount } from './helpers';

export class TargetsStore {

    @observable targets: ProfitTarget[] = [];
    @observable errors: ProfitTargetErrors[] = [];

    constructor(
        private orderStore: PlaceOrderStore,
        private validateFn?: (targets: ProfitTarget[]) => ProfitTargetErrors[]) {
    }

    @computed
    get projectedProfit(): number {
        return this.targets
            .map(this.projectedProfitCalculationStrategy)
            .reduce((a, b) => a + b, 0);
    }

    @computed
    get projectedProfitCalculationStrategy(): (t: ProfitTarget) => number {
        return this.orderStore.activeOrderSide === 'buy'
            ? (target: ProfitTarget) => Math.abs(target.amount) * (target.targetPrice - this.orderStore.price)
            : (target: ProfitTarget) => Math.abs(target.amount) * (this.orderStore.price - target.targetPrice);
    }

    @action.bound
    addTarget(): string {
        const id = nanoid();
        const prev = this.targets[this.targets.length - 1] ?? { profit: 0 };
        const added = createDefaultTarget(id, prev.profit, this.orderStore.price);
        this.targets.push(added);

        this.targets = reduceHighestAmount(this.targets);

        return id;
    }

    @action.bound
    removeTarget(id: string) {
        this.targets = this.targets.filter(it => it.id !== id);
    }

    @action.bound
    updateTarget(id: string, field: keyof ProfitTarget, value: any) {
        const found = this.targets.find(target => (target.id === id));

        if (!found)
            return;

        this.errors = [];

        // @ts-ignore
        found[field] = value ?? 0;

        if (field === 'targetPrice')
            found.profit = ((value ?? 0) - this.orderStore.price) / this.orderStore.price;

        if (field === 'profit')
            found.targetPrice = this.orderStore.price + (this.orderStore.price * (value ?? 0));
    }

    @action.bound
    reset() {
        this.targets = [];
        this.errors = [];
        const id = this.addTarget();
        this.updateTarget(id, 'amount', 100);

        return id;
    }

    @action.bound
    verify(): ProfitTargetErrors[] {
        if (!this.validateFn)
            return [];

        this.errors = this.validateFn(this.targets);

        return this.errors;
    }

}