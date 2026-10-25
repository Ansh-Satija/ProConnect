import { mediaUrl } from '@/config';
import { getAllUsers, searchUsers } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashbaordLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { useRouter } from 'next/router';

function DiscoverPage() {

    const authState = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if (!authState.all_profiles_fetched) {
            dispatch(getAllUsers())
        }
    }, [authState.all_profiles_fetched])

    // STATE VARIABLE FOR SEARCH BAR INPUT
    const [searchQuery, setSearchQuery] = useState("");
    // to distinguish between: user has typed something OR user has actually performed a search (CLICKED SEARCH BTN)
    const [searchedQuery, setSearchedQuery] = useState("");
    const handleSearch = (event) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;
        dispatch(searchUsers(query));
        setSearchedQuery(query);
    };

    return (
        <UserLayout>

            <DashboardLayout>
                <main className={styles.discoverPage}>
                    <header className={styles.pageHeading}>
                        <span className={styles.eyebrow}>MEET YOUR NEXT CONNECTION</span>
                        <h1>Discover people</h1>
                        <p>Find people to learn from, share ideas with, and grow alongside.</p>
                    </header>

                    <form className={styles.searchContainer} onSubmit={handleSearch} role="search">
                        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="10.8" cy="10.8" r="6.8" />
                            <path d="m16 16 5 5" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Search by name or username"
                            aria-label="Search people by name or username"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit">Search people</button>
                    </form>

                    {/* DISPLAY SEARCH RESULTS */}

                    {searchedQuery === "" ? (
                        <section className={styles.emptyState}>
                            <span className={styles.emptyIcon} aria-hidden="true">⌕</span>
                            <h2>Start with a search</h2>
                            <p>Look up people by their name or username to find your next connection.</p>
                        </section>
                    ) : !authState.searchResults?.length ? (
                        <section className={styles.emptyState}>
                            <span className={styles.emptyIcon} aria-hidden="true">?</span>
                            <h2>No people found</h2>
                            <p>We couldn’t find anyone for <strong>“{searchedQuery}”</strong>. Try another name or username.</p>
                        </section>
                    ) : (
                        <section className={styles.resultsSection}>
                            <div className={styles.resultsHeading}>
                                <h2>People to discover</h2>
                                <span>{authState.searchResults.length} {authState.searchResults.length === 1 ? "person" : "people"}</span>
                            </div>
                            <div className={styles.allUserProfile}>

                            {authState.searchResults.map((user) => {

                                return (
                                    <button
                                        type="button"
                                        key={user._id}
                                        className={styles.userCard}
                                        onClick={() => {
                                            router.push(`/view_profile/${encodeURIComponent(user.username)}`)
                                        }}
                                    >
                                        <img
                                            className={styles.userCard_image}
                                            src={mediaUrl(user.profilePicture)}
                                            alt="Profile"
                                        />

                                        <div>
                                            <h3>{user.name}</h3>
                                            <p>@{user.username}</p>
                                        </div>
                                        <span className={styles.profileArrow} aria-hidden="true">View profile <span>→</span></span>
                                    </button>
                                )
                            })}

                            </div>
                        </section>
                    )}
                </main>
            </DashboardLayout>

        </UserLayout>
    )
}

export default DiscoverPage
