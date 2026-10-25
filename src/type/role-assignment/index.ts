// Only the changes to a role's API/menu assignments
export interface RoleAssignmentUpdate {
    roleId: string;
    assign: string[];
    unassign: string[];
}

// IDs actually changed by the backend; already-applied ones are skipped
export interface RoleAssignmentResult {
    roleId: string;
    assigned: string[];
    unassigned: string[];
}
