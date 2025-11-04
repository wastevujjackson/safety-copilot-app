'use client';

import { createContext, useContext, useState, ReactNode, HTMLAttributes } from 'react';

interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined);

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  const { setIsOpen } = context;

  return (
    <div onClick={() => setIsOpen(true)} className="inline-block">
      {children}
    </div>
  );
}

export function DropdownMenuContent({
  children,
  align = 'start',
  className = '',
}: {
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
}) {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

  const { isOpen, setIsOpen } = context;

  if (!isOpen) return null;

  const alignmentClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`absolute z-50 mt-2 w-56 ${alignmentClass} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}
      >
        <div className="py-1" role="menu">
          {children}
        </div>
      </div>
    </>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  asChild,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  asChild?: boolean;
  className?: string;
}) {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu');

  const { setIsOpen } = context;

  const handleClick = () => {
    if (onClick) onClick();
    setIsOpen(false);
  };

  if (asChild) {
    return <div onClick={handleClick}>{children}</div>;
  }

  return (
    <button
      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className}`}
      role="menuitem"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
