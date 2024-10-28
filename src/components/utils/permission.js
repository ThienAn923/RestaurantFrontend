export const ROLES = {
  ADMIN: 1,
  CHEF: 2,
  RECEPTIONIST: 3,
}

export function hasPermission(userRole, requiredRoles) {
  return requiredRoles.includes(userRole);
}