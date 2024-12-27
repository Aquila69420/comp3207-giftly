import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Parameters from "../components/Parameters";
import Navbar from "../components/Navbar";
import styles from "../styles/home.module.css";
import TextInput from "../components/TextInput"

function Home() {
  const [username, setUsername] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Sidebar username={username} />
        <div className={styles.content}>
          I am looking for 
          <TextInput username={username} />
        </div>
      </div>
    </div>
  );
}

export default Home;
