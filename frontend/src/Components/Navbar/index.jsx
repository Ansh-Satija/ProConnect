import React from 'react'
import styles from "./styles.module.css"
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { reset } from '@/config/redux/reducer/authReducer'

function NavbarComponent() {

    const router = useRouter()

    const authState = useSelector((state) => state.auth)

    const dispatch = useDispatch();

  return (

    <div className={styles.container}>
        
        <nav className={styles.navBar}>

            <h1
             className={styles.title}
             onClick={() => {router.push("/")}}>ProConnect</h1>

            <div className={styles.navBarOptionContainer}>

                {authState.profileFetched && <div>
                    
                    <div style={{display: "flex", gap: "1.2rem"}}>
                        {/* <p>Hey, {authState.userProfile?.userId?.name}</p> */}
                        <p onClick={() => {
                            router.push("/profile")
                        }} style={{fontWeight: "bold", cursor: "pointer"}}>Profile</p>

                        {/* LOGOUT OPTION */}
                        <p onClick={() => {
                            localStorage.removeItem("token")
                            router.push("/login")
                            dispatch(reset())
                           }} 
                            style={{fontWeight: "bold", cursor: "pointer"}}>Logout</p>

                    </div>

                </div>}

                {!authState.profileFetched && <div onClick={() => { 
                        router.push("/login") }} 
                        className={styles.buttonJoin}> 
                        <p>Be a Part</p>
                </div>}
                

            </div>
             
        </nav>

    </div>
  )
}

export default NavbarComponent
