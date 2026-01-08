import { ConvexProvider, ConvexReactClient, useQuery as useConvexQuery, useMutation as useConvexMutation, useAction as useConvexAction } from "convex/react";
import { api } from "../convex/_generated/api";

// Create the Convex client
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://acrobatic-monitor-529.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

// Re-export hooks with proper typing
export const useQuery = useConvexQuery;
export const useMutation = useConvexMutation;
export const useAction = useConvexAction;

// Export the client and provider
export { convex, ConvexProvider };
export default convex;
