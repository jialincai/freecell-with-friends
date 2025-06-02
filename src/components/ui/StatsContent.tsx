"use client";

import { useSession, signOut } from "next-auth/react";
import LoginContent from "@components/ui/LoginContent";

const StatsContent = () => {
  const { data: session } = useSession();

  if (mode === "login") return <LoginContent />;

  if (session) {
    return (
      <>
        <p>Welcome {session.user?.name}</p>
        <p>Your stats will go here.</p>
        <button onClick={() => alert("TODO: implement share")}>Share</button>
        <button onClick={() => signOut()}>Log out</button>
      </>
    );
  }

  return (
    <>
      <p>Want to start tracking your stats and streaks?</p>
      <button onClick={() => setMode("login")}>Create a free account</button>
      <button onClick={() => setMode("login")}>
        Already registered? Log in
      </button>
      <button onClick={() => alert("TODO: implement share")}>Share</button>
    </>
  );
};

export default StatsContent;
