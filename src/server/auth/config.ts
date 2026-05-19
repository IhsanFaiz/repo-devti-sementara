import { NextAuthConfig, type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from 'lib/prisma';
import bcrypt from 'bcryptjs'
// import { AxiosResponse } from 'axios';
// import { axiosLogin } from 'utils/axios'; // Ensure this path matches
// import endpoints from 'utils/endpoints'; // Ensure this path matches

/**
 * ---------------------------------------------------------
 * TYPE DEFINITIONS
 * ---------------------------------------------------------
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      accessToken?: string;
      provider?: string;
      // Add other properties if needed
    } & DefaultSession['user'];
  }

  interface User {
    // Add properties returned from your API
    accessToken?: string;
    id?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    provider?: string;
    id?: string;
  }
}

/**
 * ---------------------------------------------------------
 * HELPER FUNCTIONS
 * ---------------------------------------------------------
 */
// async function authLogin(username: string | undefined, password: string | undefined) {
//   try {
//     const { data }: AxiosResponse = await axiosLogin.post(endpoints.login, {
//       username: username,
//       password: password
//     });
//     return data;
//   } catch (error) {
//     console.error('Error during authLogin:', error);
//     return error; // Return error to be handled in authorize
//   }
// }

// async function getProfile(token: string) {
//   try {
//     const { data }: AxiosResponse = await axiosLogin.get(endpoints.profile, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     return data;
//   } catch (error) {
//     console.error('Error getting profile:', error);
//     return error;
//   }
// }

/**
 * ---------------------------------------------------------
 * MAIN NEXTAUTH V5 CONFIGURATION
 * ---------------------------------------------------------
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT || 30 * 24 * 60 * 60)
  },
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      id: 'login',
      name: 'login',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Enter Username' },
        password: { label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials) {
        try {

          // Note: In v5, credentials properties are unknown by default, so we cast strings
          const username = credentials?.username as string;
          const password = credentials?.password as string;

          const user = await prisma.user.findUnique({
            where: {
              username
            }
          })

          const isValid = await bcrypt.compare(password, user?.password as string)

          if(!isValid){
            throw new Error("Invalid username or password")
          }

          return{
            id: user?.id.toString(),
            name: user?.username
          }
        } catch (e: any) {
          const errorMessage = e?.response?.data?.message || e.message || 'Something went wrong!';
          // In v5, throwing an Error in authorize sends the user to the error page with ?error=errorMessage
          throw new Error(errorMessage);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token = { ...token, ...user };
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.token = token;
        session.user = {
          ...session.user,
          id: token.id as string,
          accessToken: token.accessToken as string,
          provider: token.provider as string
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return url;
    }
  }
} satisfies NextAuthConfig;
