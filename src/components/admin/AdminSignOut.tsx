export function AdminSignOut() {
  return (
    <form action="/api/admin/logout" method="post">
      <button type="submit" className="min-h-11 font-body text-xs text-muted transition-colors hover:text-brand-ink">
        Sign Out
      </button>
    </form>
  );
}
