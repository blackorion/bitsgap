import React, { createContext, useContext } from 'react';

import { PlaceOrderStore } from './store/PlaceOrderStore';
import { validateTargets } from './validation';
import { TargetsStore } from './TargetsStore';

export const createStores = () => {
    const placeOrder = new PlaceOrderStore();
    const takeProfit = new TargetsStore(placeOrder, validateTargets);

    return { placeOrder, takeProfit };
};
const stores = createStores();
export const storeContext = createContext<Store | null>(null);

interface Store {
    placeOrder: PlaceOrderStore;
    takeProfit: TargetsStore;
}

const useStore = (): Store => {
    const store = useContext(storeContext);

    if (!store)
        throw Error('Store context is not initialized');

    return store;
};

const StoreProvider: React.FC = ({ children }) => (
    <storeContext.Provider value={stores}>{children}</storeContext.Provider>
);

export { useStore, StoreProvider };
