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
    try{
      setLoading(true);
      const response = await fetch(`${config.backendURL}/register_product_or_get_id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({url, title, image, price}),
      });
      const data = await response.json();
      navigate(`/product?id=${data.id}`, {state: {id: data.id, url, title, image, price}});
    }
    catch (error) {
      console.error("Error sending query to backend: ", error);
    }
    finally {
      setLoading(false);
    }
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
          <div className={styles.title}>
            {title.length > 25 ? `${title.substring(0, 25)}...` : title}
          </div>
          <div className={styles.price}>{price}</div>
        </div>
      )}
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
