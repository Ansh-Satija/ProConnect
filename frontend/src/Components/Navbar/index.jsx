import React, { useEffect } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";
import { getNotifications } from "@/config/redux/action/notificationAction";

function NavbarComponent() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.notifications);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    if (authState.profileFetched) {
      const token = localStorage.getItem("token");
      if (token) dispatch(getNotifications({ token }));
    }
  }, [authState.profileFetched, dispatch]);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    dispatch(reset());
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navBar} aria-label="Main navigation">
        <button type="button" className={styles.brand} onClick={() => router.push("/")} aria-label="ProConnect home">
          <span className={styles.brandName}><span>Pro</span>Connect</span>
        </button>

        {authState.profileFetched ? (
          <div className={styles.accountActions}>
            <button type="button" className={`${styles.navAction} ${router.pathname === "/notifications" ? styles.navActionActive : ""}`} onClick={() => router.push("/notifications")}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
              <span>Notifications</span>
              {unreadCount > 0 && <span className={styles.notificationCount}>{unreadCount}</span>}
            </button>
            <button type="button" className={`${styles.navAction} ${router.pathname === "/profile" ? styles.navActionActive : ""}`} onClick={() => router.push("/profile")}>Profile</button>
            <span className={styles.navDivider} />
            <button type="button" className={styles.logoutButton} onClick={logout}>Log out</button>
          </div>
        ) : (
          <div className={styles.accountActions}>
            <button type="button" className={styles.signInLink} onClick={() => router.push("/login")}>Sign in</button>
            <button type="button" className={styles.joinButton} onClick={() => router.push("/login")}>Join now</button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default NavbarComponent;
