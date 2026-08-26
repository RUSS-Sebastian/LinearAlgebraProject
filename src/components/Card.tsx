import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, subtitle, icon, children, className = '', action }: Props) {
  return (
    <section
      className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="mt-0.5 flex-shrink-0 text-sky-600">{icon}</div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 leading-tight">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
