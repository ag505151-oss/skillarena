import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          const payload = await res.json() as { success: boolean; data?: { token: string; user: { id: string; name: string; email: string; role: string } } };
          if (!payload.success || !payload.data) return null;
          const { user, token } = payload.data;
          return { id: user.id, name: user.name, email: user.email, role: user.role, apiToken: token };
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'CANDIDATE';
        const apiToken = (user as { apiToken?: string }).apiToken;
        if (apiToken !== undefined) token.apiToken = apiToken;
      }
      if (!token.role) token.role = 'CANDIDATE';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = String(token.role ?? 'CANDIDATE');
        if (token.apiToken !== undefined) {
          (session as { apiToken: string }).apiToken = token.apiToken as string;
        }
      }
      return session;
    },
  },
};
