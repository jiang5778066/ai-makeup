import { loginRedirectUrl } from "@/lib/auth-redirect";

export function redirectToLogin(nextPath: string) {
  window.location.assign(loginRedirectUrl(nextPath));
}

export function redirectAfterAccountDeletion() {
  window.location.assign("/");
}
