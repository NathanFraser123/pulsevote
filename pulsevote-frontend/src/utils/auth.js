export function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

function decodeToken(token) {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    window.atob(base64)
      .split("")
      .map((character) => `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join("")
  );
  return JSON.parse(json);
}

export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const user = decodeToken(token);
    if (user.exp && user.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    return user;
  } catch {
    logout();
    return null;
  }
}

export function getRoles() {
  return getCurrentUser()?.roles ?? [];
}

/**
 * Checks if user has a role.
 * If organisationId is provided, checks role specifically for that organisation.
 */
export function hasRole(roleName, organisationId = null) {
  const roles = getRoles();

  // Global admin override
  if (roles.some((r) => r.role === "admin")) return true;

  return roles.some((role) => {
    if (role.role !== roleName) return false;
    if (!organisationId) return true; // General check (e.g., "is manager of ANY org")
    return role.organisationId?.toString() === organisationId.toString();
  });
}

export function logout() {
  localStorage.removeItem("token");
}