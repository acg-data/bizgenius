import { useQuery } from "../lib/convex";
import { api } from "../convex/_generated/api";

export function useAuth() {
  // Fetch user details from Convex - this also tells us if user is authenticated
  const userDetails = useQuery(api.users.getUser, {});

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
