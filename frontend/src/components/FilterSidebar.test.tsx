import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterSidebar from './FilterSidebar';

describe('FilterSidebar', () => {
  it('applies parsed filters and clears back to empty state', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(<FilterSidebar onApply={onApply} />);

    await user.selectOptions(screen.getByLabelText('Category'), 'Books');
    await user.type(screen.getByLabelText('Min Price'), '10');
    await user.type(screen.getByLabelText('Max Price'), '25.5');

    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenNthCalledWith(1, {
      category: 'Books',
      minPrice: 10,
      maxPrice: 25.5,
    });

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onApply).toHaveBeenCalledTimes(2);
    expect(onApply).toHaveBeenNthCalledWith(2, {});
    expect(screen.getByLabelText('Category')).toHaveValue('');
    expect(screen.getByLabelText('Min Price')).toHaveValue(null);
    expect(screen.getByLabelText('Max Price')).toHaveValue(null);
  });
});
