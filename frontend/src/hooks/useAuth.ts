import { useEffect, useRef } from "react";
import { useAction, useQuery } from "../lib/convex";
import { api } from "../convex/_generated/api";

export function useAuth() {
  // Fetch user details from Convex - this also tells us if user is authenticated
  const userDetails = useQuery(api.users.getUser, {});
  const ensureUser = useAction(api.users.ensureUser);
  const ensureAttemptedRef = useRef(false);

  // When query goes back to loading (e.g., after login), allow another ensure attempt
  useEffect(() => {
    if (userDetails === undefined) {
      ensureAttemptedRef.current = false;
    }
  }, [userDetails]);

  // If the session is authenticated but no user document exists, create it once.
  useEffect(() => {
    if (userDetails === null && !ensureAttemptedRef.current) {
      ensureAttemptedRef.current = true;
      ensureUser().catch((err) => {
        console.error("Failed to ensure user exists:", err);
        ensureAttemptedRef.current = false; // allow retry on next render
      });
    }
  }, [userDetails, ensureUser]);

  // Loading state: query is undefined while loading
  const isLoading = userDetails === undefined;

  // Authenticated if we got a user back (not null)
  const isAuthenticated = userDetails !== null && userDetails !== undefined;

  return {
    user: userDetails || null,
    isAuthenticated,
    isLoading,
    logout: () => {
      window.location.href = "/api/auth/logout";
    },
    refetch: () => {},
    subscription_tier: userDetails?.subscription_tier || "free",
    subscription_status: userDetails?.subscription_status || "inactive",
  };
}

export default useAuth;
