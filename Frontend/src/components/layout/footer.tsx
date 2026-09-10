export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Ordering System</p>
        <p>A portfolio project - not a real restaurant.</p>
      </div>
    </footer>
  );
}
