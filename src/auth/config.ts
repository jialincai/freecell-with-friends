import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { computeUserId } from "@auth/ids";
import { Account, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

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
    async jwt({ token, account }: { token: JWT; account: Account }) {
      if (account)
        token.fwf_uuid = computeUserId(
          account.provider,
          account.providerAccountId,
        );
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.fwf_uuid;
      }
      return session;
    },
  },
  pages: {
    signIn: "/?overlay=login",
  },
};

export default authOptions;
