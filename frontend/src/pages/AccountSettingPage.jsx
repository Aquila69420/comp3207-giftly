import React from 'react'
import styles from "../styles/accountSettingPage.module.css"
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

export default function AccountSettingPage() {
    const navigate = useNavigate()
    const handleBack = (e) => {
        navigate("/home")
    }
  return (
    <div className={styles.backbutton} onClick={handleBack}>
    <IoMdArrowRoundBack size={25} />
  </div>

  )
}
