import { BASE_URL } from '@/config';
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
    return (
        <UserLayout>

            <DashboardLayout>
                <div>
                    <h1>Discover</h1>

                    {/* SEARCH BAR FOR SEARCH USERS FUNCTIONALITY */}
                    <div className={styles.searchContainer}>

                        <input type="text" placeholder='Search People...'
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                if (searchQuery.trim() === "") {
                                    return;
                                }
                                dispatch(searchUsers(searchQuery))
                                setSearchedQuery(searchQuery);
                            }}
                        >Search</button>

                    </div>

                    {/* DISPLAY SEARCH RESULTS */}

                    {searchedQuery === "" ? (

                        <h2>Search For People By Name or Username</h2>

                    ) : authState.searchResults.length === 0 ? (

                        <p>No Users Found For "{searchedQuery}"</p>


                    ) : (

                        <div className={styles.allUserProfile}>

                            {authState.searchResults.map((user) => {

                                return (
                                    <div
                                        key={user._id}
                                        className={styles.userCard}
                                        onClick={() => {
                                            router.push(`/view_profile/${user.username}`)
                                        }}
                                    >
                                        <img
                                            className={styles.userCard_image}
                                            src={`${BASE_URL}/${user.profilePicture}`}
                                            alt="Profile"
                                        />

                                        <div>
                                            <h1>{user.name}</h1>
                                            <p>@{user.username}</p>
                                        </div>
                                    </div>
                                )
                            })}

                        </div>
                    )}

                </div>
            </DashboardLayout>

        </UserLayout>
    )
}

export default DiscoverPage
