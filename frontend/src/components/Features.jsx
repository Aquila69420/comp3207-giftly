import React from "react";
import { FaMagic, FaShieldAlt, FaSmile, FaLightbulb } from "react-icons/fa";
import logo from "../image/giftly_logo_trans.png";
import styles from "../styles/feature.module.css";

const Features = () => {
  return (
    <div className={styles.features}>
      <img src={logo} alt="logo" width={90} />
      <div className={styles.feature}>
        <p className={styles.addSpace}>
          <div>
            <FaMagic size={24} color="purple" />
          </div>
          <div>
            <strong>Adaptable performance:</strong> Our platform effortlessly
            adjusts to your needs, making it easy to discover gifts and streamline
            your gift-giving tasks.
          </div>
        </p>
      </div>

      <div className={styles.feature}>
        <p className={styles.addSpace}>
          <div>
            <FaShieldAlt size={24} color="green" />
          </div>
          <div>
            <strong>Built to last:</strong> Enjoy an unmatched experience with
            features designed to provide long-term value and reliability for all
            your gifting needs.
          </div>
        </p>
      </div>

      <div className={styles.feature}>
        <p className={styles.addSpace}>
          <div>
            <FaSmile size={24} color="orange" />
          </div>
          <div>
            <strong>Great user experience:</strong> Navigate your gift-giving
            journey effortlessly.
          </div>
        </p>
      </div>

      <div className={styles.feature}>
        <p className={styles.addSpace}>
          <div>
            <FaLightbulb size={24} color="red" />
          </div>
          <div>
            <strong>Innovative functionality:</strong> Stay ahead with unique
            features like Secret Santa automation and gift profile customisation
          </div>
        </p>
      </div>
    </div>
  );
};

export default Features;
