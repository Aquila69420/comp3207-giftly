import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/ProductCard.component.css';

function ProductCard({ image, title, price, onClick }) {
  return (
    <div className={styles.card}>
      <img src={image} alt={title} className={styles.image} />
      <div className={styles.title}>{title}</div>
      <div className={styles.price}>{price}</div>
    </div>
  );
}

ProductCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ProductCard;