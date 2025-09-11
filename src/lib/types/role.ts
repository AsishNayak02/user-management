// Role-related TypeScript types

export interface RealmRole {
  id: string;
  name: string;
  description?: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
  attributes?: Record<string, any>;
}

export interface ClientRole {
  id: string;
  name: string;
  description?: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
  clientId: string;
  attributes?: Record<string, any>;
}

export interface RoleAssignment {
  realmRoleId: string;
  clientRoleIds: string[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  description?: string;
  type: 'realm' | 'client';
  clientId?: string;
  assignedClientRoles: ClientRole[];
  composite: boolean;
  attributes?: Record<string, any>;
}

export interface ClientInfo {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  enabled: boolean;
}

// Form types for role management
export interface CreateRoleFormData {
  name: string;
  description: string;
  type: 'realm' | 'client';
  clientId?: string;
  clientRoleIds?: string[];
}

export interface AssignClientRolesFormData {
  realmRoleId: string;
  clientRoleIds: string[];
}

export interface RoleTableProps {
  roles: RoleDefinition[];
  onRoleUpdated: () => void;
  onRoleDeleted: (roleId: string) => void;
}

export interface RoleAssignmentDialogProps {
  role: RoleDefinition;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete: () => void;
}
