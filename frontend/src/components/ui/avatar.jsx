import React from 'react';

function getInitials(username) {
  if (!username) return '';
  const parts = username.split(/[^a-zA-Z0-9]/).filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Avatar = ({ username, size = 36 }) => {
  const initials = getInitials(username);
  return (
    <div
      className="flex items-center justify-center rounded-full bg-[#283039] text-white font-bold select-none"
      style={{ width: size, height: size, fontSize: size / 2 }}
      title={username}
    >
      {initials ? (
        initials
      ) : (
        <svg width={size / 1.5} height={size / 1.5} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#374151" />
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9CA3AF" />
        </svg>
      )}
    </div>
  );
};

export { Avatar }; 