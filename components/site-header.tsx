import Link from "next/link";

export function SiteHeader() {
  // Verificar se estamos em ambiente de produção
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold">
            LATAM Portfolio Status
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          {!isProduction && (
            <>
              <Link
                href="/country-status"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Editor de País
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Admin
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
} 