import type { CreateOrderHistoryEntry, OrderHistoryEntry } from '../types/order';

const ORDER_HISTORY_STORAGE_KEY = 'orderHistory';

function getAllOrderHistory(): OrderHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as OrderHistoryEntry[];
  } catch {
    return [];
  }
}

function setAllOrderHistory(entries: OrderHistoryEntry[]): void {
  try {
    window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage failures.
  }
}

export function saveOrderHistoryEntry(entry: CreateOrderHistoryEntry): void {
  const existing = getAllOrderHistory();
  const next: OrderHistoryEntry = {
    id: `order-${Date.now()}`,
    ...entry,
  };

  setAllOrderHistory([next, ...existing]);
}

export function getOrderHistoryForUser(username: string): OrderHistoryEntry[] {
  return getAllOrderHistory().filter((entry) => entry.username === username);
}
