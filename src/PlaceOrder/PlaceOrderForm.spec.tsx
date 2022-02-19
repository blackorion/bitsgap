import React, { FC } from 'react';
import { fireEvent, queryHelpers, render, screen } from '@testing-library/react';
import { PlaceOrderForm } from './PlaceOrderForm';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PROFIT_TARGET_FORM, TAKE_PROFIT_FORM } from './components/TakeProfit/TakeProfit';
import { createStores, storeContext } from './context';

const queryByName = queryHelpers.queryByAttribute.bind(null, 'name');
const queryAllByName = queryHelpers.queryAllByAttribute.bind(null, 'name');

const Wrapper: FC = ({ children }) =>
    <storeContext.Provider value={createStores()}>
        {children}
    </storeContext.Provider>

describe('Take Profit', () => {

    it('should calculate total', () => {
        render(<PlaceOrderForm/>, { wrapper: Wrapper })

        const price = screen.getByLabelText(/price/i);
        userEvent.type(price, '10000');

        const amount = screen.getByLabelText(/amount/i);
        userEvent.type(amount, '0.5');

        expect(screen.getByLabelText(/total/i)).toHaveValue('5000');
    });

    it('should be able to add new profit', () => {
        render(<PlaceOrderForm/>, { wrapper: Wrapper })

        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);

        const addProfitBtn = screen.getByRole('button', { name: /add profit/i });
        userEvent.click(addProfitBtn);

        expect(screen.getByRole('button', { name: /Add profit target 3\/5/i })).toBeInTheDocument();
        expect(screen.getAllByTestId(PROFIT_TARGET_FORM)).toHaveLength(2);
    });

    it('should hide add profit button when 5 profit targets are added', () => {
        render(<PlaceOrderForm/>, { wrapper: Wrapper })

        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);

        const addProfitBtn = screen.getByRole('button', { name: /add profit/i });
        userEvent.click(addProfitBtn);
        userEvent.click(addProfitBtn);
        userEvent.click(addProfitBtn);
        userEvent.click(addProfitBtn);

        expect(screen.getAllByTestId(PROFIT_TARGET_FORM)).toHaveLength(5);
        expect(screen.queryByRole('button', { name: /add profit/i })).not.toBeInTheDocument();
    });

    it('should be able to remove profit target row', () => {
        render(<PlaceOrderForm/>, { wrapper: Wrapper })

        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);

        const addProfitBtn = screen.getByRole('button', { name: /add profit/i });
        userEvent.click(addProfitBtn);

        const [removeBtn] = screen.getAllByRole('button', { name: /remove/i });
        userEvent.click(removeBtn);

        expect(screen.getAllByTestId(PROFIT_TARGET_FORM)).toHaveLength(1);
    });

    it('should show take profit form', () => {
        render(<PlaceOrderForm/>, { wrapper: Wrapper });

        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);

        expect(screen.getByTestId(TAKE_PROFIT_FORM)).toBeInTheDocument();
    });

    it('should initialize profit target row with default values when enabling the form', () => {
        const { container } = render(<PlaceOrderForm/>, { wrapper: Wrapper });

        const price = screen.getByLabelText(/price/i);
        userEvent.type(price, '{selectall}10000');
        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);

        expect(queryByName(container, 'profit')).toHaveValue('2');
        expect(queryByName(container, 'price')).toHaveValue('30000');
        expect(queryByName(container, 'amount')).toHaveValue('100');
    });

    it('should not display take profit form by default', () => {
        render(<PlaceOrderForm/>, { wrapper: Wrapper });

        expect(screen.queryByTestId(TAKE_PROFIT_FORM)).not.toBeInTheDocument();
    });

    it('should update profit target values on change', () => {
        const { container } = render(<PlaceOrderForm/>, { wrapper: Wrapper });

        const price = screen.getByLabelText(/price/i);
        userEvent.type(price, '{selectall}10000');

        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);

        const profit = queryByName(container, 'profit')!;
        userEvent.type(profit, '{selectall}4');
        const targetPrice = queryByName(container, 'price')!;
        userEvent.type(targetPrice, '{selectall}110000');
        const amount = queryByName(container, 'amount')!;
        userEvent.type(amount, '{selectall}99');

        expect(queryByName(container, 'profit')).toHaveValue('10');
        expect(queryByName(container, 'price')).toHaveValue('110000');
        expect(queryByName(container, 'amount')).toHaveValue('99');
    });

    it('should display validation errors on form sumbit', () => {
        const { container } = render(<PlaceOrderForm/>, { wrapper: Wrapper });

        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);
        const addProfitBtn = screen.getByRole('button', { name: /add profit/i });
        userEvent.click(addProfitBtn);

        const profitInputs = queryAllByName(container, 'profit');
        profitInputs.forEach(input => userEvent.type(input, '{selectall}4'));

        const submitBtn = screen.getByRole('button', { name: /buy btc/i });
        userEvent.click(submitBtn);

        const [first, second] = queryAllByName(container, 'profit')
        expect(first).not.toBeInvalid();
        expect(second).toBeInvalid();
    });

    it('should not display validation errors before submit', () => {
        const { container } = render(<PlaceOrderForm/>, { wrapper: Wrapper });

        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);
        const addProfitBtn = screen.getByRole('button', { name: /add profit/i });
        userEvent.click(addProfitBtn);

        const profitInputs = queryAllByName(container, 'profit');
        profitInputs.forEach(input => userEvent.type(input, '{selectall}4'));

        const [first, second] = queryAllByName(container, 'profit')
        expect(first).not.toBeInvalid();
        expect(second).not.toBeInvalid();
    });

    it('should hide validation errors on input blur', () => {
        const { container } = render(<PlaceOrderForm/>, { wrapper: Wrapper });

        const takeProfitSwitch = screen.getByRole('checkbox');
        userEvent.click(takeProfitSwitch);
        const addProfitBtn = screen.getByRole('button', { name: /add profit/i });
        userEvent.click(addProfitBtn);

        const amountInputs = queryAllByName(container, 'amount');
        amountInputs.forEach(input => userEvent.type(input, '{selectall}99999'));

        const submitBtn = screen.getByRole('button', { name: /buy btc/i });
        userEvent.click(submitBtn);

        const [first, second] = queryAllByName(container, 'amount');
        fireEvent.focus(first);
        fireEvent.blur(first);

        expect(first).not.toBeInvalid();
        expect(second).not.toBeInvalid();
    });

});