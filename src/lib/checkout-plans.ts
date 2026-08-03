export function planIdForCheckout(localId: string): string | null {
  switch (localId) {
    case "credits_100":
      return "credits_100";
    default:
      return null;
  }
}
