import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  breadcrumbs?: Crumb[];
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  tags?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
  tags,
  children,
}: PageHeaderProps) {
  return (
    <div className="space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-txt-muted">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-3 h-3 text-txt-muted" />}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-accent transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-txt-primary font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {(title || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-display-lg text-txt-primary font-display">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-txt-secondary text-sm mt-1">{subtitle}</p>}
            {tags && <div className="flex items-center gap-3 mt-2">{tags}</div>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
}
