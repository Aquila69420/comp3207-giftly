import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "../styles/accountSettingPage.module.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import config from "../config";

export default function AccountSettingPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [fieldToUpdate, setFieldToUpdate] = useState("");

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newUsername: "",
      newPassword: "",
      newEmail: "",
      newPhone: "",
      newNotifications: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newUsername: Yup.string().when("fieldToUpdate", {
        is: "username",
        then: Yup.string().required("New username is required"),
      }),
      newPassword: Yup.string().when("fieldToUpdate", {
        is: "password",
        then: Yup.string().required("New password is required"),
      }),
      newEmail: Yup.string().when("fieldToUpdate", {
        is: "email",
        then: Yup.string()
          .email("Invalid email address")
          .required("New email is required"),
      }),
      newPhone: Yup.string().when("fieldToUpdate", {
        is: "phone",
        then: Yup.string().required("New phone number is required"),
      }),
      newNotifications: Yup.string().when("fieldToUpdate", {
        is: "notifications",
        then: Yup.string().required("Notification preference is required"),
      }),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!fieldToUpdate) {
          setMessage("Please select a field to update.");
          setMessageType("error");
          return;
        }

        // Step 1: Verify the current password
        const loginResponse = await fetch(`${config.backendURL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: localStorage.getItem("username"),
            password: values.currentPassword,
          }),
        });

        const loginResult = await loginResponse.json();

        console.log(loginResult);

        if (loginResult.response === "Username or password incorrect") {
          setMessage(loginResult.response || "Authentication failed!");
          setMessageType("error");
          return;
        }

        // Step 2: Proceed with the update request if the password is correct
        const updatePayload = {
          username: localStorage.getItem("username"),
          field: fieldToUpdate,
        };

        if (fieldToUpdate === "username")
          updatePayload.newUsername = values.newUsername;
        if (fieldToUpdate === "password")
          updatePayload.newPassword = values.newPassword;
        if (fieldToUpdate === "email") updatePayload.newEmail = values.newEmail;
        if (fieldToUpdate === "phone") updatePayload.newPhone = values.newPhone;
        if (fieldToUpdate === "notifications")
          updatePayload.newNotifications = values.newNotifications;

        const updateResponse = await fetch(
          `${config.backendURL}/update_user_details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayload),
          }
        );

        const updateResult = await updateResponse.json();

        console.log(updateResult);

        if (updateResponse.ok) {
          setMessage("Update successful!");
          setMessageType("success");
          resetForm();
          setFieldToUpdate("");
        } else {
          setMessage(updateResult.response || "Update failed!");
          setMessageType("error");
        }
      } catch (error) {
        setMessage("Error connecting to the server.");
        setMessageType("error");
      }
    },
  });

  return (
    <div className={styles.pageContainer}>
      {/* Back Button */}
      <div className={styles.backButton} onClick={() => navigate("/home")}>
        <IoMdArrowRoundBack size={25} />
      </div>

      {/* Header */}
      <h1 className={styles.pageHeader}>Account Settings</h1>

      {/* Update Details Section */}
      <div className={styles.updateSection}>
        <h2 className={styles.sectionHeader}>Update Your Information</h2>
        <div className={styles.username}>
          Username: {localStorage.getItem("username")}
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={
              messageType === "success"
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {message}
          </div>
        )}

        {/* Field Selection */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Field to Update</label>
          <select
            value={fieldToUpdate}
            onChange={(e) => setFieldToUpdate(e.target.value)}
            className={styles.input}
          >
            <option value="" disabled>
              -- Select Field --
            </option>
            <option value="password">Password</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="notifications">Notifications</option>
          </select>
        </div>

        {/* Formik Form */}
        {fieldToUpdate && (
          <form onSubmit={formik.handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={styles.input}
              />
            </div>
            {formik.touched.currentPassword &&
              formik.errors.currentPassword && (
                <div className={styles.errorText}>
                  {formik.errors.currentPassword}
                </div>
              )}
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                New{" "}
                {fieldToUpdate.charAt(0).toUpperCase() + fieldToUpdate.slice(1)}
              </label>
              <input
                type={fieldToUpdate === "password" ? "password" : "text"}
                name={`new${
                  fieldToUpdate.charAt(0).toUpperCase() + fieldToUpdate.slice(1)
                }`}
                placeholder={`Enter new ${fieldToUpdate}`}
                value={
                  formik.values[
                    `new${
                      fieldToUpdate.charAt(0).toUpperCase() +
                      fieldToUpdate.slice(1)
                    }`
                  ]
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={styles.input}
              />
              {formik.touched[
                `new${
                  fieldToUpdate.charAt(0).toUpperCase() + fieldToUpdate.slice(1)
                }`
              ] &&
                formik.errors[
                  `new${
                    fieldToUpdate.charAt(0).toUpperCase() +
                    fieldToUpdate.slice(1)
                  }`
                ] && (
                  <div className={styles.errorText}>
                    {
                      formik.errors[
                        `new${
                          fieldToUpdate.charAt(0).toUpperCase() +
                          fieldToUpdate.slice(1)
                        }`
                      ]
                    }
                  </div>
                )}
            </div>

            <button type="submit" className={styles.button}>
              Update{" "}
              {fieldToUpdate.charAt(0).toUpperCase() + fieldToUpdate.slice(1)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
