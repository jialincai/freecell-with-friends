import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { computeUserId } from "@auth/ids";

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
      if (account && profile)
        token.frecell_id = computeUserId(
          account.provider,
          account.providerAccountId,
        );
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.frecell_id;
      return session;
    },
  },
  pages: {
    signIn: "/?overlay=login",
  },
};

export default authOptions;
