import { ProfitTarget, ProfitTargetErrors } from './model';

type ValidationResult = [keyof ProfitTarget, string] | null;

const maximumProfitSumValidator = (sum: number) => (): ValidationResult =>
    (sum > 500)
        ? ['profit', 'Maximum profit sum is 500%']
        : null;
const minimumProfitValueValidator = (target: ProfitTarget): ValidationResult =>
    (target.profit < 0.01)
        ? ['profit', 'Minimum value is 0.01']
        : null;
const profitIncreasedValidator = (targets: ProfitTarget[]) => (target: ProfitTarget, ix: number): ValidationResult =>
    ix !== 0 && target.profit <= targets[ix - 1].profit
        ? ['profit', 'Each target\'s profit should be greater than the previous one']
        : null;
const minimumTargetPriceValidator = (target: ProfitTarget): ValidationResult =>
    (target.targetPrice <= 0)
        ? ['targetPrice', 'Price must be greater than 0']
        : null;
const maximumAmountSumValidator = (sum: number, decreaseValue: number) => (): ValidationResult =>
    decreaseValue > 0
        ? ['amount', `${sum}% out of 100% selected. Please decrease by ${decreaseValue}%`]
        : null;

export function validateTargets(targets: ProfitTarget[]): ProfitTargetErrors[] {
    const [profitSum, amountSum] = targets.reduce(([profit, amount], target) =>
        [profit + target.profit, amount + target.amount], [0, 0]);
    const amountDecreaseValue = amountSum - 100;

    return targets.map(reduceErrors(
        maximumProfitSumValidator(profitSum),
        minimumProfitValueValidator,
        profitIncreasedValidator(targets),
        minimumTargetPriceValidator,
        maximumAmountSumValidator(amountSum, amountDecreaseValue),
    ));
}

function reduceErrors(...validators: ((target: ProfitTarget, ix: number) => ValidationResult)[]): (t: ProfitTarget, ix: number) => ProfitTargetErrors {
    return (t: ProfitTarget, ix: number) => {
        const errors = validators
            .map(validate => validate(t, ix))
            .reduce((acc, vr) => {
                if (!vr)
                    return acc;

                const [key, message] = vr;
                const x = acc.get(key) || [];
                acc.set(key, x.concat([message]));

                return acc;
            }, new Map());

        return ({ id: t.id, errors: Object.fromEntries(errors.entries()) });
    };
}