import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
  children,
}: CardHeaderProps & { children?: ReactNode }) {
  // If children are provided, use them instead of title/subtitle
  if (children) {
    return (
      <div className={`mb-4 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        {typeof title === 'string' ? (
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        ) : (
          <div className="text-lg font-semibold text-gray-900">{title}</div>
        )}
        {subtitle && (
          typeof subtitle === 'string' ? (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          ) : (
            <div className="mt-1 text-sm text-gray-500">{subtitle}</div>
          )
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

export function CardTitle({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}
