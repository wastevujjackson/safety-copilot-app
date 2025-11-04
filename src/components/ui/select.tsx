'use client';

import { createContext, useContext, useState, ReactNode, HTMLAttributes } from 'react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider
      value={{
        value: value || '',
        onValueChange: onValueChange || (() => {}),
        isOpen,
        setIsOpen,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  const { isOpen, setIsOpen } = context;

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  const { value } = context;

  return <span className="text-gray-900">{value || placeholder}</span>;
}

export function SelectContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  const { isOpen, setIsOpen } = context;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      <div
        className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto ${className}`}
      >
        {children}
      </div>
    </>
  );
}

export function SelectItem({
  value,
  children,
  className = '',
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  const { value: selectedValue, onValueChange, setIsOpen } = context;

  const handleClick = () => {
    onValueChange(value);
    setIsOpen(false);
  };

  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
}
