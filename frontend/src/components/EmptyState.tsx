import { ReactNode } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import {
  DocumentTextIcon,
  LightBulbIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Generic empty state component
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <Card className={`w-full ${className}`}>
      <CardBody className="text-center py-12 px-6">
        {icon && (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 max-w-sm mx-auto mb-6">{description}</p>

        {(action || secondaryAction) && (
          <div className="flex gap-3 justify-center">
            {action && (
              <Button
                color="primary"
                startContent={action.icon}
                onPress={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="bordered"
                onPress={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Empty state for ideas list
 */
export function EmptyIdeas({ onCreateIdea }: { onCreateIdea: () => void }) {
  return (
    <EmptyState
      title="No ideas yet"
      description="Get started by creating your first business idea. Our AI will help you develop it into a full plan."
      icon={<LightBulbIcon className="w-8 h-8 text-primary-500" />}
      action={{
        label: 'Create Your First Idea',
        onClick: onCreateIdea,
        icon: <PlusIcon className="w-4 h-4" />,
      }}
    />
  );
}

/**
 * Empty state for documents
 */
export function EmptyDocuments({ onGenerateDocument }: { onGenerateDocument: () => void }) {
  return (
    <EmptyState
      title="No documents generated"
      description="Generate business documents like plans, pitch decks, and financial models from your ideas."
      icon={<DocumentTextIcon className="w-8 h-8 text-primary-500" />}
      action={{
        label: 'Generate Documents',
        onClick: onGenerateDocument,
        icon: <PlusIcon className="w-4 h-4" />,
      }}
    />
  );
}

/**
 * Empty state for search results
 */
export function EmptySearchResults({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch: () => void;
}) {
  return (
    <EmptyState
      title="No results found"
      description={`We couldn't find any results for "${query}". Try adjusting your search terms.`}
      icon={<MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />}
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
      }}
    />
  );
}

/**
 * Empty state for billing/invoices
 */
export function EmptyBilling() {
  return (
    <EmptyState
      title="No billing history"
      description="Your billing history will appear here once you make your first payment."
      icon={<CreditCardIcon className="w-8 h-8 text-gray-400" />}
    />
  );
}

/**
 * Empty state for notifications
 */
export function EmptyNotifications() {
  return (
    <EmptyState
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
      icon={<InboxIcon className="w-8 h-8 text-gray-400" />}
    />
  );
}

/**
 * Empty state for filtered results (no matches)
 */
export function EmptyFilteredResults({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <EmptyState
      title="No matches"
      description="No items match your current filters. Try adjusting or clearing your filters."
      icon={<FolderOpenIcon className="w-8 h-8 text-gray-400" />}
      action={{
        label: 'Clear Filters',
        onClick: onClearFilters,
      }}
    />
  );
}

/**
 * Error state (for when data fails to load)
 */
export function ErrorState({
  title = 'Failed to load',
  description = 'Something went wrong while loading this content. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<ExclamationTriangleIcon className="w-8 h-8 text-danger-500" />}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
}

/**
 * Loading failed state with more detail
 */
export function LoadingError({
  message,
  onRetry,
  onGoBack,
}: {
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-danger-500" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to load content
          </h3>

          <p className="text-gray-600 mb-6">
            {message || 'There was a problem loading this page. Please check your connection and try again.'}
          </p>

          <div className="flex gap-3 justify-center">
            {onGoBack && (
              <Button variant="bordered" onPress={onGoBack}>
                Go Back
              </Button>
            )}
            {onRetry && (
              <Button color="primary" onPress={onRetry}>
                Try Again
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default EmptyState;
