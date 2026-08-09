'use client';

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'sds.cart.v1';

const lineKey = (productId, variantId) => `${productId}::${variantId || 'default'}`;

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...state, lines: action.lines, ready: true };

    case 'add': {
      const key = lineKey(action.line.productId, action.line.variantId);
      const existing = state.lines.find((l) => l.key === key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, qty: Math.min(l.qty + action.line.qty, l.stock) } : l
          ),
        };
      }
      return { ...state, lines: [...state.lines, { ...action.line, key }] };
    }

    case 'setQty':
      return {
        ...state,
        lines: state.lines
          .map((l) => (l.key === action.key ? { ...l, qty: Math.max(0, Math.min(action.qty, l.stock)) } : l))
          .filter((l) => l.qty > 0),
      };

    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };

    case 'clear':
      return { ...state, lines: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], ready: false });

  // Load once on mount. Server renders an empty cart, so nothing is read during SSR.
  useEffect(() => {
    let lines = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) lines = parsed;
      }
    } catch {
      // Corrupt or blocked storage — start empty rather than crashing the app.
    }
    dispatch({ type: 'hydrate', lines });
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      // Private mode or full quota — cart still works for this session.
    }
  }, [state.lines, state.ready]);

  const value = useMemo(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = state.lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
    return {
      lines: state.lines,
      ready: state.ready,
      count,
      subtotal,
      add: (line) => dispatch({ type: 'add', line }),
      setQty: (key, qty) => dispatch({ type: 'setQty', key, qty }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [state.lines, state.ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
