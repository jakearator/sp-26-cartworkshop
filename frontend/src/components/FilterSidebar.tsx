import { useState } from "react";
import type { ProductFilters } from "../types/product";
import styles from "./FilterSidebar.module.css";

const CATEGORIES = ["Electronics", "Books", "Clothing"];

interface FilterSidebarProps {
  onApply: (filters: ProductFilters) => void;
}

export default function FilterSidebar({ onApply }: FilterSidebarProps) {
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    onApply({
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  function handleClear() {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    onApply({});
  }

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.heading}>Filters</h2>
      <form onSubmit={handleApply} className={styles.form}>
        <label className={styles.label}>
          Category
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Min Price
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </label>

        <label className={styles.label}>
          Max Price
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </label>

        <div className={styles.actions}>
          <button type="submit" className={styles.applyBtn}>
            Apply Filters
          </button>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </form>
    </aside>
  );
}
