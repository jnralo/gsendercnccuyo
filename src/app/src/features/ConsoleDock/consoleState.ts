import { useSyncExternalStore } from 'react';

// Estado abierto/cerrado de la consola. No se guarda: el programa siempre arranca
// con la consola cerrada. La posicion elegida (1-4) si se guarda, en
// workspace.consoleLayout.

let open = false;
const listeners = new Set<() => void>();

const notify = () => {
    for (const listener of listeners) {
        listener();
    }
};

export const consoleState = {
    isOpen: () => open,
    setOpen: (value: boolean) => {
        if (open !== value) {
            open = value;
            notify();
        }
    },
    toggle: () => {
        open = !open;
        notify();
    },
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const useConsoleOpen = () =>
    useSyncExternalStore(subscribe, consoleState.isOpen, consoleState.isOpen);
