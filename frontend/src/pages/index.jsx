import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const router = useRouter();
  const [activePerson, setActivePerson] = useState("maya");
  const people = [
    { id: "maya", name: "Maya Chen", role: "Product designer", initials: "MC", color: "rose", x: "18%", y: "27%", note: "A shared interest can spark your next big idea." },
    { id: "leo", name: "Leo Martins", role: "Founder", initials: "LM", color: "gold", x: "76%", y: "20%", note: "Meet builders who turn good ideas into real things." },
    { id: "amara", name: "Amara Okafor", role: "Creative lead", initials: "AO", color: "violet", x: "84%", y: "68%", note: "Find fresh perspectives from people outside your usual circle." },
    { id: "noah", name: "Noah Williams", role: "Engineer", initials: "NW", color: "green", x: "22%", y: "77%", note: "One thoughtful introduction can take your work further." },
  ];
  const selectedPerson = people.find((person) => person.id === activePerson);

  return (
    <UserLayout>
      <Head>
        <title>ProConnect — Build meaningful professional connections</title>
        <meta
          name="description"
          content="Meet people, share ideas, and grow your professional network with ProConnect."
        />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <h2 id="hero-title" className={styles.headline}>
              Your next opportunity starts with <span>a conversation.</span>
            </h2>

            <p className={styles.description}>
              Meet people who share your ambition. Exchange ideas, grow your
              network, and make your next move with ProConnect.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => router.push("/login")}
              >
                Join ProConnect <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/login")}
              >
                Sign in
              </button>
            </div>

            <div className={styles.socialProof}>
              <div className={styles.avatarStack} aria-hidden="true">
                <span>J</span><span>M</span><span>A</span><span>+</span>
              </div>
              <p><strong>Good things happen</strong> when people connect.</p>
            </div>
          </div>

          <div className={styles.networkStage}>
            <div className={styles.networkGlow} />
            <div className={styles.networkCanvas}>
              <svg className={styles.networkLines} viewBox="0 0 100 100" aria-hidden="true">
                <line x1="50" y1="50" x2="18" y2="27" className={activePerson === "maya" ? styles.activeLine : styles.networkLine} />
                <line x1="50" y1="50" x2="76" y2="20" className={activePerson === "leo" ? styles.activeLine : styles.networkLine} />
                <line x1="50" y1="50" x2="84" y2="68" className={activePerson === "amara" ? styles.activeLine : styles.networkLine} />
                <line x1="50" y1="50" x2="22" y2="77" className={activePerson === "noah" ? styles.activeLine : styles.networkLine} />
                <line x1="18" y1="27" x2="76" y2="20" className={styles.faintLine} />
                <line x1="84" y1="68" x2="22" y2="77" className={styles.faintLine} />
              </svg>

              <div className={styles.centerNode} aria-hidden="true">
                <span className={styles.centerOrbit}></span>
                <span className={styles.youAvatar}>Y</span>
                <span className={styles.youLabel}>You</span>
              </div>

              {people.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  className={`${styles.personNode} ${styles[person.color]} ${activePerson === person.id ? styles.selectedNode : ""}`}
                  style={{ "--node-x": person.x, "--node-y": person.y }}
                  onClick={() => setActivePerson(person.id)}
                  onMouseEnter={() => setActivePerson(person.id)}
                  aria-pressed={activePerson === person.id}
                  aria-label={`${person.name}, ${person.role}`}
                >
                  <span className={styles.personAvatar}>{person.initials}</span>
                  <span className={styles.personName}>{person.name}</span>
                  <span className={styles.personRole}>{person.role}</span>
                </button>
              ))}

              <div className={styles.storyCard} aria-live="polite">
                <span className={styles.storySpark}>✦</span>
                <div>
                  <strong>{selectedPerson?.name} · {selectedPerson?.role}</strong>
                  <p>{selectedPerson?.note}</p>
                </div>
              </div>
              <span className={styles.stageCaption}>Every connection starts somewhere</span>
            </div>
          </div>
        </section>

      </main>
    </UserLayout>
  );
}
