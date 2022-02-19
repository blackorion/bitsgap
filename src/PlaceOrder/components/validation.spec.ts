import { validateTargets } from '../validation';
import { ProfitTarget } from '../model';

describe('validation', () => {

    it('should set error when profit sum is over 500%', () => {
        const expectedMessage = 'Maximum profit sum is 500%';

        const result = validateTargets([
            createDefaultTarget({ id: '1', profit: 300 }),
            createDefaultTarget({ id: '2', profit: 400 }),
        ]);

        expect(result).toContainEqual(expect.objectContaining({ id: '1', errors: { profit: [expectedMessage] } }));
        expect(result).toContainEqual(expect.objectContaining({ id: '2', errors: { profit: [expectedMessage] } }));
    });

    it('should set error when profit is lower then 0.01', () => {
        const expectedMessage = 'Minimum value is 0.01';

        const result = validateTargets([
            createDefaultTarget({ id: '1', profit: -300 }),
            createDefaultTarget({ id: '2', profit: 0.001 }),
            createDefaultTarget({ id: '3', profit: 300 }),
            createDefaultTarget({ id: '4', profit: 0.01 }),
        ]);

        expect(result).toContainEqual(expect.objectContaining({ id: '1', errors: { profit: [expectedMessage] } }));
        expect(result).toContainEqual(expect.objectContaining({ id: '2', errors: { profit: [expectedMessage] } }));
        expect(result).not.toContainEqual(expect.objectContaining({ id: '3', errors: { profit: [expectedMessage] } }));
        expect(result).not.toContainEqual(expect.objectContaining({ id: '4', errors: { profit: [expectedMessage] } }));
    });

    it('should set error when preceding profit is greater than current', () => {
        const expectedMessage = 'Each target\'s profit should be greater than the previous one';

        const result = validateTargets([
            createDefaultTarget({ id: '1', profit: 10 }),
            createDefaultTarget({ id: '2', profit: 1 }),
        ]);

        expect(result).not.toContainEqual(expect.objectContaining({ id: '1', errors: { profit: [expectedMessage] } }));
        expect(result).toContainEqual(expect.objectContaining({ id: '2', errors: { profit: [expectedMessage] } }));
    });

    test.each([
        0
        - 1,
    ])('should set error when target price is 0 or less', (targetPrice) => {
        const expectedMessage = 'Price must be greater than 0';

        const result = validateTargets([
            createDefaultTarget({ id: '1', targetPrice }),
        ]);

        expect(result).toContainEqual(expect.objectContaining({ id: '1', errors: { targetPrice: [expectedMessage] } }));
    });

    it('should set error when total amount is greater than 100', () => {
        const expectedMessage = '200% out of 100% selected. Please decrease by 100%';

        const result = validateTargets([
            createDefaultTarget({ id: '1', amount: 100, profit: 1 }),
            createDefaultTarget({ id: '2', amount: 100, profit: 2 }),
        ]);

        expect(result).toContainEqual(expect.objectContaining({ id: '1', errors: { amount: [expectedMessage] } }));
        expect(result).toContainEqual(expect.objectContaining({ id: '2', errors: { amount: [expectedMessage] } }));
    });

});

function createDefaultTarget(props: Partial<ProfitTarget>): ProfitTarget {
    return {
        id: '1',
        profit: 2,
        amount: 3,
        targetPrice: 4,
        ...props,
    };
}