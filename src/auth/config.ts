import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { computeUserId } from "@auth/ids";
import { Account, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { upsertUser } from "@lib/db/users";

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
    async jwt({ token, account }: { token: JWT; account?: Account | null }) {
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

    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (!account || !user.email) return "/overlay=login&error=auth";

      const id = computeUserId(account.provider, account.providerAccountId);
      const email = user.email;

      try {
        await upsertUser({ id, email });
        return true;
      } catch {
        console.log("Failed to upsert user");
        return "/?overlay=login&error=db";
      }
    },
  },
  pages: {
    signIn: "/?overlay=login",
  },
};

export default authOptions;
