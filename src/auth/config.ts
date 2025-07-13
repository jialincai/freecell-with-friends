import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { v5 as uuidv5 } from 'uuid';
import { findUserById, insertUser } from "@lib/db/users";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const id = uuidv5(`${account.provider}:${account.providerAccountId}`,
                           uuidv5("https://freecellwithfriends.com", uuidv5.URL));
        const email = token.email

        const existing = await findUserById(id)
        if (!existing) {
          await insertUser({ id, email: email ?? "" });
        }

        token.frecell_id = id
      }

      return token
    },

    async session({ session, token}) {
      session.user.id = token.frecell_id
      return session
    }, 
  },
};

export default authOptions;
