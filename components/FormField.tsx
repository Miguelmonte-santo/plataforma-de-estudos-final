import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
  disabled?: boolean; // Nova propriedade
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  containerClassName = '',
  disabled = false, // Padrão é falso
}) => {
  return (
    <div className={`relative ${containerClassName}`}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder=" "
        className={`peer w-full bg-transparent border-2 rounded-full py-2 px-4 focus:outline-none focus:ring-0 transition-colors
          ${disabled 
            ? 'border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:text-gray-500' 
            : 'border-brand-dark-blue text-brand-dark-blue focus:border-indigo-500 dark:border-gray-300 dark:text-gray-300 dark:focus:border-indigo-500'
          }
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute 
          duration-300 
          transform 
          -translate-y-5
          scale-75 
          top-3
          left-4
          origin-[0]
          bg-background-light 
          dark:bg-background-dark
          px-2
          pointer-events-none

          peer-placeholder-shown:scale-100 
          peer-placeholder-shown:translate-y-0
          peer-placeholder-shown:bg-transparent
          
          peer-focus:scale-75
          peer-focus:-translate-y-5
          peer-focus:top-3
          peer-focus:bg-background-light
          dark:peer-focus:bg-background-dark

          ${disabled
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-brand-dark-blue dark:text-gray-400 peer-focus:text-indigo-600 dark:peer-focus:text-indigo-500'
          }
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default FormField;