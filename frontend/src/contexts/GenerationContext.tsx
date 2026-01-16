import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../convex/_generated/api';
import { Provider } from '../convex/providers';

interface GenerationContextType {
  currentProvider: Provider;
  fallbackOrder: Provider[];
  isLoading: boolean;
  isGenerating: boolean;
  setActiveProvider: (provider: Provider) => Promise<void>;
  setFallbackOrder: (order: Provider[]) => Promise<void>;
  startGeneration: (sessionId: string) => void;
  endGeneration: () => void;
  getCostsBySession: (sessionId: string) => any;
  getRecentGenerations: (limit?: number) => any;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { data: providerSettings, isLoading: isLoadingSettings } = useConvexQuery(
    api.admin.getProviderSettings,
    isAuthenticated ? undefined : 'skip'
  );

  const setActiveProviderMutation = useConvexMutation(api.admin.setActiveProvider);
  const setFallbackOrderMutation = useConvexMutation(api.admin.setFallbackOrder);

  const currentProvider = providerSettings?.activeProvider || 'novita';
  const fallbackOrder = providerSettings?.fallbackOrder || ['novita', 'openrouter', 'cerebras'];

  const setActiveProvider = async (provider: Provider) => {
    try {
      await setActiveProviderMutation({ provider });
    } catch (error) {
      console.error('Failed to set active provider:', error);
      throw error;
    }
  };

  const setFallbackOrder = async (order: Provider[]) => {
    try {
      await setFallbackOrderMutation({ order });
    } catch (error) {
      console.error('Failed to set fallback order:', error);
      throw error;
    }
  };

  const startGeneration = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsGenerating(true);
  };

  const endGeneration = () => {
    setActiveSessionId(null);
    setIsGenerating(false);
  };

  const value: GenerationContextType = {
    currentProvider,
    fallbackOrder,
    isLoading: isLoadingSettings,
    isGenerating,
    setActiveProvider,
    setFallbackOrder,
    startGeneration,
    endGeneration,
    getCostsBySession: (sessionId: string) => {
      return {
        query: api.admin.getCostsBySession,
        args: { sessionId },
      };
    },
    getRecentGenerations: (limit?: number) => {
      return {
        query: api.admin.getRecentGenerations,
        args: { limit },
      };
    },
  };

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
}

export function useGenerationState() {
  const { isGenerating, currentProvider } = useGeneration();
  return { isGenerating, currentProvider };
}