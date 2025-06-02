"use client";

import { signIn } from "next-auth/react";

const LoginContent = () => {
  return (
    <div>
      <h1>Create a free account to track your stats</h1>

      <div>
        <button onClick={() => signIn("google")}>
          <img src="img/social/google.png" alt="Google" />
          Continue with Google
        </button>

        <button onClick={() => signIn("discord")}>
          <img src="img/social/discord.png" alt="Discord" />
          Continue with Discord
        </button>
      </div>
    </div>
  );
};

export default LoginContent;
