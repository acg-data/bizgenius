import { StarIcon, UserIcon } from '@heroicons/react/24/solid';
import { CustomerProfilesData, CustomerProfile } from '../../../types/report';

interface CustomerProfilesProps {
  data: CustomerProfilesData;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    avatar: 'bg-blue-500',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    avatar: 'bg-purple-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    avatar: 'bg-green-500',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    avatar: 'bg-orange-500',
  },
};

function ProfileCard({ profile }: { profile: CustomerProfile }) {
  const colors = colorClasses[profile.colorScheme];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${colors.avatar} flex items-center justify-center`}>
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-apple-text">{profile.name}</h4>
            <p className="text-sm text-apple-gray">{profile.title}</p>
          </div>
        </div>
        {profile.isPrimary && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <StarIcon className="w-3 h-3" />
            Primary
          </div>
        )}
      </div>

      {/* Stats */}
      {profile.avgTicket && (
        <div className="mb-4 pb-4 border-b border-black/5">
          <span className="text-xs text-apple-gray">Avg. Ticket</span>
          <p className="text-lg font-semibold text-apple-text">{profile.avgTicket}</p>
        </div>
      )}

      {/* Demographics */}
      {(profile.demographics.ageRange || profile.demographics.profession || profile.demographics.location) && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-apple-gray mb-2">Demographics</h5>
          <div className="flex flex-wrap gap-2">
            {profile.demographics.ageRange && (
              <span className={`px-2 py-1 rounded-full text-xs ${colors.badge}`}>
                {profile.demographics.ageRange}
              </span>
            )}
            {profile.demographics.profession && (
              <span className={`px-2 py-1 rounded-full text-xs ${colors.badge}`}>
                {profile.demographics.profession}
              </span>
            )}
            {profile.demographics.location && (
              <span className={`px-2 py-1 rounded-full text-xs ${colors.badge}`}>
                {profile.demographics.location}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Behavior */}
      {(profile.behavior.visitTime || profile.behavior.decisionDriver || profile.behavior.traits) && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-apple-gray mb-2">Behavior</h5>
          <div className="space-y-1 text-sm text-apple-text">
            {profile.behavior.visitTime && <p>Visits: {profile.behavior.visitTime}</p>}
            {profile.behavior.decisionDriver && <p>Driven by: {profile.behavior.decisionDriver}</p>}
            {profile.behavior.traits && <p>Traits: {profile.behavior.traits}</p>}
          </div>
        </div>
      )}

      {/* Motivation */}
      {profile.motivation && (
        <div className="bg-white/50 rounded-xl p-3">
          <h5 className="text-xs font-medium text-apple-gray mb-1">Motivation</h5>
          <p className="text-sm text-apple-text">{profile.motivation}</p>
        </div>
      )}
    </div>
  );
}

export default function CustomerProfiles({ data }: CustomerProfilesProps) {
  return (
    <div className="space-y-6">
      <p className="text-apple-gray">
        Understanding your ideal customers is crucial for targeted marketing and product development.
      </p>

      <div className="grid grid-cols-2 gap-6">
        {data.profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
}
