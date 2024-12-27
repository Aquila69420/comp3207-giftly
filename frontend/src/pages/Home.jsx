import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TextInput from "../components/TextInput";
import styles from "../styles/home.module.css";

function Home() {
  const [username, setUsername] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Sidebar username={username} />
        <div className={styles.content}>
          <h1 className={styles.header}>Giftly is your best shot—because Santa’s got nothing on you! 🎁🎄</h1>
          <TextInput username={username} />
        </div>
      </div>
    </div>
  );
}

export default Home;
