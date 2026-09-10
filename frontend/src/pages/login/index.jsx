import UserLayout from '@/layout/UserLayout';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import styles from "./style.module.css"
import { loginUser, registerUser } from '@/config/redux/action/authAction';
import { emptyMessage } from '@/config/redux/reducer/authReducer';

function LoginComponent() {


  const authState = useSelector((state) => state.auth) // GET AUTH STATE FROM REDUX STORE 
  const statusMessage = typeof authState.message === "string"
    ? authState.message
    : authState.message?.message ?? "";

  const router = useRouter(); // FOR REDIRECTING TO DIFFERENT WEBPAGES WITHIN SAME WEBSITE

  const dispatch = useDispatch() // SENDS ACTION TO REDUX STORE

  const [userLoginMethod, setUserLoginMethod] = useState(false);

  // LOCAL REACT STATES FOR FORM FIELDS
  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const clearForm = () => {
    setEmailAddress("");
    setPassword("");
    setUsername("");
    setName("");
  };

  // AFTER SUCCESSFUL LOGIN REDIRECT TO /DASHBOARD (RUNS EVERYTIME SUCCESSFUL LOGIN)
  useEffect(() => {
    if(authState.loggedIn){
      router.push("/dashboard")
    }
  }, [authState.loggedIn])

  // RUNS ONLY ONCE (FOR THE FIRST TIME) WHEN THE LOGIN COMPONENT LOADS (IF TOKEN ALREADY EXISTS FOR THE USER NO NEED TO LOGIN AGAIN)
  useEffect(() => {
    if(localStorage.getItem("token")){
      router.push("/dashboard")
    }
  }, [])

  // RUNS EVERYTIME WHEN LOGIN/ SIGNUP MODE CHANGES TO CLEAR THE PREVIOUS SUCESS/ ERROR MESSAGE
  useEffect(() => {
    clearForm();
    dispatch(emptyMessage())
  }, [userLoginMethod])

  // EXECUTED WHEN USER SIGNS UP
  const handleRegister = async () => {
    console.log("Registering...")
    const resultAction = await dispatch(registerUser({
      username, 
      password,
      email,
      name
    }));

    if (registerUser.fulfilled.match(resultAction)) {
      clearForm();
    }
  }

  // EXECUTED WHEN USER SIGNS IN WITH THE FORM IN FRONTEND
  const handleLogin = () => {
    console.log("login...");
    dispatch(loginUser({email, password}))

  }

  return (
    <UserLayout>
      <div className={styles.container}>


        <div className={styles.cardContainer}>


          <div className={styles.cardContainer_left}>
            <p className={styles.cardleft_heading}> {userLoginMethod ? "Sign In" : "Sign Up"} </p>

            <p style={{color: authState.isError ? "red" : "green"}}>{statusMessage}</p>

            <div className={styles.inputContainers}>

              {/* ROW 1  OF SIGNUP FORM */}
              {/* ONLY DISPLAY THESE FIELDS IN SIGNUP FORM NOT LOGIN FORM I.E. IF USERLOGINMETHOD = FALSE (USER WANTS TO SIGNUP)*/}
              {!userLoginMethod && 
                <div className={styles.inputRow}>
                  <input value={username} autoComplete="off" onChange={(e) => setUsername(e.target.value)} className={styles.inputField} type="text" placeholder='Username' />
                  <input value={name} autoComplete="off" onChange={(e) => setName(e.target.value)} className={styles.inputField} type="text" placeholder='Name' />
                </div>
              }

              {/* EMAIL AND PASSWORD FIELDS ARE REQUIRED IN BOTH SIGNUP AND LOGIN FORMS */}
              <input value={email} autoComplete="off" onChange={(e) => setEmailAddress(e.target.value)} className={styles.inputField} type="text" placeholder='Email' />
              <input value={password} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} className={styles.inputField} type="password" placeholder='Password' />

              <div onClick={() => {
                 if(userLoginMethod){
                   handleLogin();
                 }
                 else{
                   handleRegister();
                 }
                }}
                className={styles.buttonWithOutline}>
                <p> {userLoginMethod ? "Sign In" : "Sign Up"} </p>
              </div>
              
            </div>

          </div>


          {/* RIGHT SIDE */}
          <div className={styles.cardContainer_right}>
            

              {userLoginMethod ? <p>Don't Have an Account? </p> : <p>Already Have an Account?</p>}
              <div onClick={() => {
                  setUserLoginMethod(!userLoginMethod)
                }}
                
                style={{color: "black", textAlign: "center"}}
                className={styles.buttonWithOutline}>
                  <p> {userLoginMethod ? "Sign Up" : "Sign In"} </p>
                </div>


          </div>


        </div>

      </div>
    </UserLayout>
  )
}

export default LoginComponent;
