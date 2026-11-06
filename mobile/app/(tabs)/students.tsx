import React from 'react';
import { UserCrudScreen } from '../../src/components/UserCrudScreen';

export default function StudentsScreen() {
  return (
    <UserCrudScreen
      role="aluno"
      singularLabel="Estudante"
      pluralLabel="Estudantes"
    />
  );
}
