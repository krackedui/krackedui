import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  icon?: IconName;
  onClick?: () => void;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

/**
 * Where you are in a hierarchy. The last item is the current page and is not a link.
 *
 * On a narrow screen the middle collapses to an ellipsis, keeping the first and last — the two that
 * say where you came from and where you are. The hidden ones stay in the DOM for assistive tech.
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, className, ...rest },
  ref,
) {
  return (
    <nav ref={ref} aria-label="Breadcrumb" className={cn('bay-crumbs', className)} {...rest}>
      <ol className="bay-crumbs__list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          const middle = i > 0 && !last;
          return (
            <li
              key={i}
              className="bay-crumbs__item"
              data-middle={middle ? '' : undefined}
              data-last={last ? '' : undefined}
            >
              {i > 0 && (
                <Icon name="chevronRight" size={12} className="bay-crumbs__sep" />
              )}
              {last || (!item.href && !item.onClick) ? (
                <span className="bay-crumbs__current" aria-current={last ? 'page' : undefined}>
                  {item.icon && <Icon name={item.icon} size={12} />}
                  {item.label}
                </span>
              ) : (
                <a
                  className="bay-crumbs__link"
                  href={item.href}
                  onClick={
                    item.onClick
                      ? (e) => {
                          if (!item.href) e.preventDefault();
                          item.onClick?.();
                        }
                      : undefined
                  }
                >
                  {item.icon && <Icon name={item.icon} size={12} />}
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
      {items.length > 2 && (
        <span className="bay-crumbs__ellipsis" aria-hidden="true">
          <Icon name="chevronRight" size={12} className="bay-crumbs__sep" />
          <Icon name="more" size={12} />
          <Icon name="chevronRight" size={12} className="bay-crumbs__sep" />
        </span>
      )}
    </nav>
  );
});
