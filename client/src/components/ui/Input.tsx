import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-stone-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-stone-900
          placeholder:text-stone-400 bg-white
          focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500
          disabled:bg-stone-50 disabled:text-stone-500
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-stone-300'}
          ${className}
        `}
        {...props}
      />
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <textarea
        ref={ref}
        rows={3}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-stone-900
          placeholder:text-stone-400 bg-white resize-none
          focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500
          ${error ? 'border-red-400' : 'border-stone-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <select
        ref={ref}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-stone-900 bg-white
          focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500
          ${error ? 'border-red-400' : 'border-stone-300'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
