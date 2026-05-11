interface SectionPlaceholderProps {
  title: string;
  subtitle?: string;
  description: string;
}

export function SectionPlaceholder({
  title,
  subtitle,
  description,
}: SectionPlaceholderProps) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">{subtitle}</p>
        )}
      </header>
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-12 text-center">
        <div className="text-sm text-zinc-500 dark:text-zinc-500 max-w-md mx-auto">
          {description}
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-amber-600 dark:text-amber-500 font-semibold mt-4">
          em construção
        </div>
      </div>
    </div>
  );
}
