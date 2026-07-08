export * from '../../../../../lux/types/database';

export const MEMBER_ROLES = ["user", "admin", "owner"] as const;
export type MemberRole = typeof MEMBER_ROLES[number];

export function getRoleValue(role: MemberRole) {
    return MEMBER_ROLES.indexOf(role) ?? -1;
}