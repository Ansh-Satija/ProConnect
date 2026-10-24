export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/discover",
      permanent: false,
    },
  };
}

export default function ViewProfileIndex() {
  return null;
}
