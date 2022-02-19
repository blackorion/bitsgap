import React from 'react';
import { act } from '@testing-library/react';
import { TargetsStore } from './TargetsStore';
import { PlaceOrderStore } from './store/PlaceOrderStore';
import { validateTargets } from './validation';

describe('Targets Store', () => {
    let order: PlaceOrderStore;
    let sut: TargetsStore;

    beforeEach(() => {
        order = new PlaceOrderStore();
        sut = new TargetsStore(order);
    });

    it('should create a default target on reset', async () => {
        order.setPrice(200);
        sut.reset();

        expect(sut.targets).toHaveLength(1);

        const [first] = sut.targets;
        expect(first).toHaveProperty('profit', 2);
        expect(first).toHaveProperty('targetPrice', 600);
        expect(first).toHaveProperty('amount', 100);
    });

    it('should be able to add target', () => {
        sut.addTarget();

        expect(sut.targets).toHaveLength(1);
    });

    it('should automatically set profit when adding new target', () => {
        sut.addTarget();

        const latest = latestOf(sut.targets);
        expect(latest).toHaveProperty('profit', 2);
    });

    it('should automatically set target price when adding new target', () => {
        const PRICE = 10;
        const PROFIT = 20;
        order.setPrice(PRICE);
        const first = sut.reset();

        act(() => {
            sut.updateTarget(first, 'profit', PROFIT);
            sut.addTarget();
        });

        const latest = latestOf(sut.targets);
        expect(latest).toHaveProperty('targetPrice', 230);
    });

    it('should automatically set amount when adding new target', () => {
        act(() => {
            sut.addTarget();
        });

        const latest = latestOf(sut.targets);
        expect(latest).toHaveProperty('amount', 20);
    });

    it('should reduce the highest amount when adding new target', () => {
        sut.reset();

        act(() => {
            const latest = latestOf(sut.targets);
            sut.updateTarget(latest.id, 'amount', 10);
            const added = sut.addTarget();
            sut.updateTarget(added, 'amount', 90);
            sut.addTarget();
        });

        const amounts = sut.targets.map(it => it.amount);
        expect(amounts).toEqual([10, 70, 20]);
    });

    it('should reduce all the highest amount values when adding new target', () => {
        sut.reset();

        act(() => {
            const latest = latestOf(sut.targets);
            sut.updateTarget(latest.id, 'amount', 100);
            sut.addTarget();
        });
        act(() => {
            const latest = latestOf(sut.targets);
            sut.updateTarget(latest.id, 'amount', 100);
            sut.addTarget();
        });
        act(() => {
            const latest = latestOf(sut.targets);
            sut.updateTarget(latest.id, 'amount', 100);
            sut.addTarget();
        });

        const amounts = sut.targets.map(it => it.amount);
        expect(amounts).toEqual([80, 0, 0, 20]);
    });

    it('should be able to update target values', () => {
        const PROFIT = 20;
        const first = sut.reset();

        act(() => {
            sut.updateTarget(first, 'profit', PROFIT);
        });

        expect(sut.targets[0]).toHaveProperty('profit', PROFIT);
    });

    it('should be able to remove target', () => {
        const first = sut.reset();

        act(() => sut.removeTarget(first));

        expect(sut.targets).toHaveLength(0);
    });

    it('should update target price when profit is changed', () => {
        order.setPrice(10_000);
        const first = sut.reset();

        act(() => {
            sut.updateTarget(first, 'profit', 10);
        });

        expect(sut.targets[0]).toHaveProperty('targetPrice', 110_000);
    });

    it('should update profit when target price is changed', () => {
        order.setPrice(10_000);
        const first = sut.reset();

        act(() => {
            sut.updateTarget(first, 'targetPrice', 110_000);
        });

        expect(sut.targets[0]).toHaveProperty('profit', 10);
    });

    it('should clear all errors on reset', () => {
        order.setPrice(0);
        sut = new TargetsStore(order, validateTargets);

        act(() => {
            const id = sut.addTarget();
            sut.updateTarget(id, 'targetPrice', -100);
            sut.reset();
        });

        expect(sut.errors).toHaveLength(0);
    });

    it('should display all errors', () => {
        order.setPrice(0);
        sut = new TargetsStore(order, validateTargets);

        act(() => {
            const id = sut.addTarget();
            sut.updateTarget(id, 'targetPrice', -100);
            sut.reset();
        });

        expect(sut.errors).toHaveLength(0);
    });

    it.todo('what do we do with the first one? can we remove it?');
    it.todo('shell we recalculate the items that follow a deleted row?')

});

function latestOf<T>(items: T[]): T {
    return items[items.length - 1];
}