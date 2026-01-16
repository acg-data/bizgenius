import { ConvexProvider, ConvexReactClient, useQuery as useConvexQuery, useMutation as useConvexMutation, useAction as useConvexAction } from "convex/react";

// Create the Convex client
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL environment variable is required. Check your .env file.');
}
const convex = new ConvexReactClient(convexUrl);

// Re-export hooks with proper typing
export const useQuery = useConvexQuery;
export const useMutation = useConvexMutation;
export const useAction = useConvexAction;

// Export the client and provider
export { convex, ConvexProvider };
export default convex;
