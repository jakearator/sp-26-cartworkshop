import { useState } from 'react';
import { useCartContext } from '../../contexts/CartContext';
import styles from './CheckoutForm.module.css';

interface FormData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

const US_STATES: { value: string; label: string }[] = [
  { value: '', label: 'Select a state' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'OH', label: 'Ohio' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'TX', label: 'Texas' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
];

const initialFormData: FormData = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
};

function validateField(name: keyof FormData, value: string): string | undefined {
  switch (name) {
    case 'fullName':
      if (!value.trim()) return 'Full name is required.';
      if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
      return undefined;
    case 'email':
      if (!value.trim()) return 'Email is required.';
      if (!value.includes('@')) return 'Email must contain @.';
      return undefined;
    case 'address':
      if (!value.trim()) return 'Shipping address is required.';
      if (value.trim().length < 5) return 'Address must be at least 5 characters.';
      return undefined;
    case 'city':
      if (!value.trim()) return 'City is required.';
      return undefined;
    case 'state':
      if (!value) return 'State is required.';
      return undefined;
    case 'zipCode':
      if (!value.trim()) return 'Zip code is required.';
      if (!/^\d{5}$/.test(value.trim())) return 'Zip code must be exactly 5 digits.';
      return undefined;
  }
}

function validateAll(data: FormData): FormErrors {
  const errors: FormErrors = {};
  (Object.keys(data) as (keyof FormData)[]).forEach((key) => {
    const error = validateField(key, data[key]);
    if (error) errors[key] = error;
  });
  return errors;
}

interface CheckoutFormProps {
  onOrderPlaced?: () => void;
}

export function CheckoutForm({ onOrderPlaced }: CheckoutFormProps) {
  const { cartItemCount, cartTotal, dispatch } = useCartContext();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const allErrors = validateAll(formData);
    const hasErrors = Object.keys(allErrors).length > 0;

    if (hasErrors) {
      setTouched(new Set(Object.keys(formData)));
      setErrors(allErrors);
      return;
    }

    setIsProcessing(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    onOrderPlaced?.();
    dispatch({ type: 'CLEAR_CART' });
    setIsProcessing(false);
    setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <h2 className={styles.successHeading}>Order placed successfully!</h2>
        <p className={styles.successBody}>
          Your order is on its way to{' '}
          <strong>
            {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
          </strong>
          . A confirmation will be sent to <strong>{formData.email}</strong>.
        </p>
      </div>
    );
  }

  const isCartEmpty = cartItemCount === 0;

  return (
    <section className={styles.section} aria-label="Checkout">
      <h2 className={styles.heading}>Checkout</h2>
      <p className={styles.summary}>
        {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} &mdash; Total:{' '}
        <strong>${cartTotal.toFixed(2)}</strong>
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className={styles.field}>
          <label htmlFor="fullName" className={styles.label}>
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={`${styles.input}${touched.has('fullName') && errors.fullName ? ` ${styles.inputError}` : ''}`}
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-required="true"
            aria-invalid={touched.has('fullName') && !!errors.fullName}
            aria-describedby={touched.has('fullName') && errors.fullName ? 'fullName-error' : undefined}
            autoComplete="name"
          />
          {touched.has('fullName') && errors.fullName && (
            <span id="fullName-error" className={styles.error} role="alert">
              {errors.fullName}
            </span>
          )}
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`${styles.input}${touched.has('email') && errors.email ? ` ${styles.inputError}` : ''}`}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-required="true"
            aria-invalid={touched.has('email') && !!errors.email}
            aria-describedby={touched.has('email') && errors.email ? 'email-error' : undefined}
            autoComplete="email"
          />
          {touched.has('email') && errors.email && (
            <span id="email-error" className={styles.error} role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* Shipping Address */}
        <div className={styles.field}>
          <label htmlFor="address" className={styles.label}>
            Shipping Address <span aria-hidden="true">*</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className={`${styles.input}${touched.has('address') && errors.address ? ` ${styles.inputError}` : ''}`}
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-required="true"
            aria-invalid={touched.has('address') && !!errors.address}
            aria-describedby={touched.has('address') && errors.address ? 'address-error' : undefined}
            autoComplete="street-address"
          />
          {touched.has('address') && errors.address && (
            <span id="address-error" className={styles.error} role="alert">
              {errors.address}
            </span>
          )}
        </div>

        {/* City + State row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="city" className={styles.label}>
              City <span aria-hidden="true">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className={`${styles.input}${touched.has('city') && errors.city ? ` ${styles.inputError}` : ''}`}
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={touched.has('city') && !!errors.city}
              aria-describedby={touched.has('city') && errors.city ? 'city-error' : undefined}
              autoComplete="address-level2"
            />
            {touched.has('city') && errors.city && (
              <span id="city-error" className={styles.error} role="alert">
                {errors.city}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="state" className={styles.label}>
              State <span aria-hidden="true">*</span>
            </label>
            <select
              id="state"
              name="state"
              className={`${styles.select}${touched.has('state') && errors.state ? ` ${styles.inputError}` : ''}`}
              value={formData.state}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={touched.has('state') && !!errors.state}
              aria-describedby={touched.has('state') && errors.state ? 'state-error' : undefined}
              autoComplete="address-level1"
            >
              {US_STATES.map(({ value, label }) => (
                <option key={value} value={value} disabled={value === ''}>
                  {label}
                </option>
              ))}
            </select>
            {touched.has('state') && errors.state && (
              <span id="state-error" className={styles.error} role="alert">
                {errors.state}
              </span>
            )}
          </div>
        </div>

        {/* Zip Code */}
        <div className={`${styles.field} ${styles.fieldZip}`}>
          <label htmlFor="zipCode" className={styles.label}>
            Zip Code <span aria-hidden="true">*</span>
          </label>
          <input
            id="zipCode"
            name="zipCode"
            type="text"
            inputMode="numeric"
            className={`${styles.input}${touched.has('zipCode') && errors.zipCode ? ` ${styles.inputError}` : ''}`}
            value={formData.zipCode}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-required="true"
            aria-invalid={touched.has('zipCode') && !!errors.zipCode}
            aria-describedby={touched.has('zipCode') && errors.zipCode ? 'zipCode-error' : undefined}
            autoComplete="postal-code"
            maxLength={5}
          />
          {touched.has('zipCode') && errors.zipCode && (
            <span id="zipCode-error" className={styles.error} role="alert">
              {errors.zipCode}
            </span>
          )}
        </div>

        {isCartEmpty && (
          <p className={styles.emptyNotice} role="status">
            Add items to your cart before placing an order.
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isCartEmpty || isProcessing}
          aria-label={isProcessing ? 'Processing your order' : 'Place your order'}
          aria-busy={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </section>
  );
}
