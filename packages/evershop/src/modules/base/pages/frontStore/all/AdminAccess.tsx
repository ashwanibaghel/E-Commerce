import { LockKeyhole } from 'lucide-react';
import React from 'react';

export default function AdminAccess() {
  return (
    <a
      href="/admin"
      className="baghel-admin-access"
      aria-label="Admin login"
      title="Admin login"
    >
      <LockKeyhole size={17} aria-hidden="true" />
    </a>
  );
}

export const layout = {
  areaId: 'headerMiddleRight',
  sortOrder: 2
};
