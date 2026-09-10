import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

import {useRouter} from "next/router"
import UserLayout from "@/layout/UserLayout";


export default function Home() {

  const router = useRouter();
  return (
    <UserLayout>
      <div className="container">

        <div className={styles.mainContainer}>
          
          <div className={styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration!</p>
            <p>A True Social Media Platform, with Stories No Bluffs!</p>

            <div onClick={() => { router.push("/login") }}  className={styles.buttonJoin}>

              <p>Join Now</p>

            </div>

          </div>

          <div className={styles.mainContainer_right}>
            <img src="images/homemain_connection.jpg"></img>
          </div>

        </div>

      </div>
    </UserLayout>
  );
}
