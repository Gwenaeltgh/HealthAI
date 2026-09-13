import React from 'react';
import { User } from '../types';

interface UserHeaderProps {
  user: User;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800">{user.name}</h1>
      <p className="text-gray-600">
        {user.age} ans · {user.gender} · {user.weightKg} kg · {user.heightCm} cm
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
          Maladie: {user.diseaseType ?? '—'}
        </span>
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
          Activité: {user.physicalActivityLevel ?? '—'}
        </span>
      </div>
    </div>
  );
};

export default UserHeader;