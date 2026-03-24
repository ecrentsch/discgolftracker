import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, title, action, className = '' }: PageWrapperProps) {
  return (
    <main className={`max-w-4xl mx-auto px-4 pt-16 md:pt-20 pb-24 md:pb-8 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h1 className="text-2xl font-bold text-stone-900">{title}</h1>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </main>
  );
}
