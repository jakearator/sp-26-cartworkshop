import { useState, useEffect } from 'react';
import { useCartContext } from '../../contexts/CartContext';
import styles from './AddToCartButton.module.css';

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { dispatch } = useCartContext();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!isAdded) return;

    const timer = setTimeout(() => {
      setIsAdded(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAdded]);

  const handleClick = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
    });
    setIsAdded(true);
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${isAdded ? styles.added : ''}`}
      onClick={handleClick}
      aria-label={`Add ${product.name} to cart`}
    >
      {isAdded ? 'Added!' : 'Add to Cart'}
    </button>
  );
}
