/**
 * Site owner / admin account. Only this user can add travel packages
 * (the "Add Destination" nav item and /add-destination route).
 */
export const ADMIN_USER_ID = "6aefde47ac43b113594bc9d5";
export const ADMIN_EMAIL = "mhbsaim27@gmail.com";

export function isAdminId(userId?: string | null): boolean {
  return userId === ADMIN_USER_ID;
}
