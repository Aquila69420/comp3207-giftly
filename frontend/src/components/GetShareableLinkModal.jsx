// User opens the modal
// Behind the scenes call group/invite/get to retrieve all active invitations for a group
// If this output is not empty, retrieve the first valid token
// Else, call group/invite/generate to create a new invitation
// In either scenario, display the token in the modal, and a button to copy it to clipboard
import React, { useState } from "react";
import styles from "../styles/groups.module.css";
import InfinityLoader from "./InfinityLoader";
import { LuCopy, LuCopyCheck  } from "react-icons/lu";
import config from "../config";

const GetShareableLinkModal = ({ group, onClose }) => {
    const currentUserID = localStorage.getItem("userID");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const rootURL = window.location.origin;

    const handleGetLink = async () => {
        setLoading(true);
        const response = await fetch(`${config.backendURL}/groups/invite/get`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            params: JSON.stringify({
                groupID: group.id,
            }),
        });
        const data = await response.json();
        if (data.result && data.tokens.length > 0) {
            // If tokens are available, use the first one
            // Get the root URL of the app and append the token to rootURL/invite?token=token as a search parameter
            setInviteLink(`${rootURL}/invite?token=${data.tokens[0].token}`);
            setLoading(false);
        }
        else {
            // If no tokens are available, generate a new one
            const response = await fetch(`${config.backendURL}/groups/invite/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID: currentUserID,
                    groupID: group.id,
                }),
            });
            const data = await response.json();
            if (data.result) {
                setInviteLink(`${rootURL}/invite?token=${data.token}`);
                setLoading(false);
            }
            else {
                alert(`Error: ${data.msg}`);
                setLoading(false);
            }
        }
    };

    const handleCopyToClipboard = () => {
        // Copy the inviteLink to clipboard
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
    }; 

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Get Shareable Link for {group.groupname}</h2>
                {/* Label that displays the link obtained from backend or a loading animation till then */}
                <div className={styles.modalInput}>
                    {loading ? (
                        <div className="overlay">
                        <InfinityLoader loading={loading} />
                      </div>
                    ) : (
                        <label>{inviteLink}</label>
                    )}
                </div>
                <div className={styles.modalButtons}>
                    <button onClick={handleGetLink} className={styles.modalCreateButton}>
                        Get Link
                    </button>
                    <button onClick={handleCopyToClipboard} className={styles.modalCreateButton}>
                        {copied ? (
                            <div>
                                <LuCopyCheck />
                                Copied
                            </div>
                        ) : (
                            <div>
                                <LuCopy />
                                Copy
                            </div>
                        )}
                    </button>
                    <button onClick={onClose} className={styles.modalCancelButton}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GetShareableLinkModal;