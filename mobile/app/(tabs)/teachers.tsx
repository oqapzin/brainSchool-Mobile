import React from 'react';
import { UserCrudScreen } from '../../src/components/UserCrudScreen';

export default function TeachersScreen() {
  return (
    <UserCrudScreen
      role="professor"
      singularLabel="Professor"
      pluralLabel="Professores"
    />
  );
}
