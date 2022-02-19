/* eslint @typescript-eslint/no-use-before-define: 0 */

import React, { FC, useState } from 'react';
import block from 'bem-cn-lite';
import { AddCircle, Cancel } from '@material-ui/icons';

import { NumberInput, Switch, TextButton } from 'components';

import { QUOTE_CURRENCY } from '../../constants';
import { OrderSide, ProfitTarget } from '../../model';
import './TakeProfit.scss';
import { useTargets } from '../../useTargets';
import { observer } from 'mobx-react';

export const TAKE_PROFIT_FORM = 'take-profit-form';
export const PROFIT_TARGET_FORM = 'profit-target-form';

type Props = {
    orderSide: OrderSide;
};

const b = block('take-profit');

const TakeProfit = observer(({ orderSide }: Props) => {
    const [formIsVisible, setFormIsVisible] = useState(false);
    const { targets, errors, addTarget, updateTarget, removeTarget, projectedProfit, reset } = useTargets();
    const isNotReachedTargetsLimit = targets.length < 5;

    const handleFormVisibility = (isVisible: boolean) => {
        setFormIsVisible(isVisible);

        if (isVisible)
            reset();
    }

    return (
        <div className={b()}>
            <div className={b('switch')}>
                <span>Take profit</span>
                <Switch checked={formIsVisible} onChange={handleFormVisibility}/>
            </div>
            {formIsVisible && (
                <div className={b('content')} data-testid={TAKE_PROFIT_FORM}>
                    <Titles orderSide={orderSide}/>
                    {targets.map(target => <InputRow key={target.id}
                                                     target={target}
                                                     onChange={updateTarget}
                                                     onRemove={removeTarget}
                                                     errors={errors.find(it => it.id === target.id)?.errors}/>)}
                    {isNotReachedTargetsLimit && (
                        <TextButton className={b('add-button')} onClick={addTarget}>
                            <AddCircle className={b('add-icon')}/>
                            <span>Add profit target {targets.length + 1}/5</span>
                        </TextButton>
                    )}
                    <div className={b('projected-profit')}>
                        <span className={b('projected-profit-title')}>Projected profit</span>
                        <span className={b('projected-profit-value')}>
                            <span>{projectedProfit}</span>
                            <span className={b('projected-profit-currency')}>
                              {QUOTE_CURRENCY}
                            </span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

export { TakeProfit };

const Titles: FC<{ orderSide: OrderSide; }> = ({ orderSide }) => (
    <div className={b('titles')}>
        <span>Profit</span>
        <span>Target price</span>
        <span>Amount to {orderSide === 'buy' ? 'sell' : 'buy'}</span>
    </div>
);

interface InputRowProps {
    target: ProfitTarget;
    errors?: Record<Partial<keyof ProfitTarget>, string[]>;
    onChange: (id: string, field: keyof ProfitTarget, value: number | null) => void;
    onRemove: (id: string) => void;
}

const InputRow: FC<InputRowProps> = ({ target, errors, onChange, onRemove }) => {
    const handleRemove = () => onRemove(target.id);
    const handleBlur = (field: keyof ProfitTarget) => (value: number | null) =>
        onChange(target.id, field, value);

    return (
        <div className={b('inputs')} data-testid={PROFIT_TARGET_FORM}>
            <NumberInput
                value={target.profit}
                name={'profit'}
                decimalScale={2}
                InputProps={{ endAdornment: '%' }}
                onBlur={handleBlur('profit')}
                variant="underlined"
                error={errors?.profit?.join(', ')}
            />
            <NumberInput
                value={target.targetPrice}
                name={'price'}
                decimalScale={2}
                InputProps={{ endAdornment: QUOTE_CURRENCY }}
                variant="underlined"
                onBlur={handleBlur('targetPrice')}
                error={errors?.targetPrice?.join(', ')}
            />
            <NumberInput
                value={target.amount}
                name={'amount'}
                decimalScale={2}
                InputProps={{ endAdornment: '%' }}
                variant="underlined"
                onBlur={handleBlur('amount')}
                error={errors?.amount?.join(', ')}
            />
            <div className={b('cancel-icon')} role={'button'} aria-label={'remove'} onClick={handleRemove}>
                <Cancel/>
            </div>
        </div>
    );
};
