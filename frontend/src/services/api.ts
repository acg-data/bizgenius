/**
 * API Service Layer
 *
 * NOTE: For Convex operations, components should use the hooks directly:
 *   import { useMutation, useQuery, useAction } from '../lib/convex';
 *   import { api } from '../convex/_generated/api';
 *
 * This file provides HTTP-based API calls for features not yet migrated to Convex.
 */

// HTTP wrapper for branding endpoints (stub implementations)
// TODO: Migrate branding features to Convex backend
const httpApi = {
  async post(endpoint: string, data: any): Promise<{ data: any }> {
    // Stub implementations for branding features
    if (endpoint === '/branding/company-names') {
      // Generate simple name variations based on the idea
      const words = data.business_idea?.split(' ').slice(0, 3) || ['My', 'Business'];
      const suffixes = ['AI', 'Labs', 'Co', 'HQ', 'Pro'];
      const names = suffixes.map((suffix, i) =>
        words[i % words.length] + suffix
      );
      return { data: { names } };
    }

    if (endpoint === '/branding/logo-variations') {
      // Return placeholder logo URLs
      return { data: { logos: [null, null, null, null] } };
    }

    if (endpoint === '/branding/color-palettes') {
      // Return predefined color palettes
      return {
        data: {
          palettes: [
            ['#1D1D1F', '#F5F5F7', '#0066CC', '#34C759', '#FF9500'],
            ['#2C3E50', '#ECF0F1', '#3498DB', '#2ECC71', '#E74C3C'],
            ['#1A1A2E', '#EEEEF0', '#4A90D9', '#50C878', '#FF6B6B'],
          ],
        },
      };
    }

    if (endpoint === '/branding/random-palette') {
      const lockedColors = data.locked_colors || [];
      const palette = lockedColors.map((c: string | null) =>
        c || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      );
      return { data: { palette } };
    }

    throw new Error('Unknown endpoint: ' + endpoint);
  },
};

export default {
  post: httpApi.post,
};
