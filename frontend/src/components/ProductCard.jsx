import PropTypes from "prop-types";
import styles from "../styles/productCard.module.css";
import { useNavigate } from "react-router-dom";
import config from "../config";
import InfinityLoader from "./InfinityLoader";
import { useState } from "react";

function ProductCard({ image, title, price, url }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  /* Define the onclick here, which creates and retrevies cosmos db uuid for that product and then
  navigates to it when click on*/
  const registerProductOrGetId = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.backendURL}/register_product_or_get_id`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, title, image, price }),
        }
      );
      const data = await response.json();
      navigate(`/product?id=${data.id}`, {
        state: { id: data.id, url, title, image, price },
      });
    } catch (error) {
      console.error("Error sending query to backend: ", error);
    } finally {
      setLoading(false);
    }
  };
  const parsePrice = (price) => {
    if (typeof price === "string") {
      const numericPrice = price.replace(/[^0-9.]/g, ""); // Remove non-numeric characters
      return parseFloat(numericPrice) || 0; // Convert to float or return 0 if invalid
    }
    return 0;
  };

  return (
    <div onClick={registerProductOrGetId}>
      {loading ? (
        <div className="overlay">
          <InfinityLoader loading={loading} />
        </div>
      ) : (
        <div className={styles.card}>
          <img src={image} alt={title} className={styles.image} />
          <div className={styles.cardGrid}>
            <div className={styles.title}>
              {title.length > 25
                ? `${title.at(0).toUpperCase()}${title.substring(1, 20)}...`
                : `${title.at(0).toUpperCase()}${title.substring(1)}`}
            </div>
            <div className={styles.price}>{price}</div>
          </div>
        </div>
      )}
    </div>
  );
}

ProductCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
};

export default ProductCard;
