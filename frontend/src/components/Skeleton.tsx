import { Card, CardBody, CardHeader } from '@heroui/react';

interface SkeletonProps {
  className?: string;
}

/**
 * Basic skeleton element for custom layouts
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for circular avatars
 */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="skeleton skeleton-circle"
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Skeleton for a card with header and content
 */
export function SkeletonCard() {
  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <SkeletonAvatar />
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </CardHeader>
      <CardBody>
        <SkeletonText lines={3} />
      </CardBody>
    </Card>
  );
}

/**
 * Skeleton for idea card in the ideas list
 */
export function SkeletonIdeaCard() {
  return (
    <Card className="w-full">
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="skeleton h-6 w-3/4 mb-2" />
            <div className="skeleton h-4 w-1/2" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <SkeletonText lines={2} className="mb-4" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-24 rounded-full" />
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Skeleton for dashboard stats card
 */
export function SkeletonStatsCard() {
  return (
    <Card className="w-full">
      <CardBody className="p-6">
        <div className="flex items-center gap-4">
          <div className="skeleton skeleton-circle w-12 h-12" />
          <div className="flex-1">
            <div className="skeleton h-3 w-24 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Skeleton for table row
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton for full table
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="py-3 px-4 text-left">
                <div className="skeleton h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton for a list of ideas
 */
export function SkeletonIdeaList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonIdeaCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for dashboard page
 */
export function SkeletonDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-64" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Recent Ideas */}
      <div className="mb-6">
        <div className="skeleton h-6 w-32 mb-4" />
        <SkeletonIdeaList count={3} />
      </div>
    </div>
  );
}

/**
 * Skeleton for idea detail page
 */
export function SkeletonIdeaDetail() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-10 w-3/4 mb-4" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Content sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="mb-6">
          <CardHeader>
            <div className="skeleton h-6 w-40" />
          </CardHeader>
          <CardBody>
            <SkeletonText lines={5} />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default Skeleton;
