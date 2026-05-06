import { TextareaHTMLAttributes, forwardRef } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...props }, ref) {
    return <textarea ref={ref} className={`text-input textarea-input ${className}`} {...props} />;
  }
);
