import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.sub = account.id as string; // 拿到 Google 的 sub
      }
      return token;
    },
    async session({ session, token }) {
      session.user.sub = token.sub;
      return session;
    }
  }
});

export { handler as GET, handler as POST };
