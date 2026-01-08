import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    // Email/Password authentication
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string | undefined,
        };
      },
    }),
    // Google OAuth (requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars)
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
