import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  containerClassName = '',
}) => {
  return (
    <div className={`relative ${containerClassName}`}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" " // This space is crucial for the floating label effect
        className="peer w-full bg-transparent border-2 border-brand-dark-blue text-brand-dark-blue dark:border-gray-300 dark:text-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-0 focus:border-indigo-500 dark:focus:border-indigo-500"
      />
      <label
        htmlFor={id}
        className="
          absolute 
          text-brand-dark-blue
          dark:text-gray-400
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
          
          peer-focus:text-indigo-600
          dark:peer-focus:text-indigo-500
          peer-focus:scale-75
          peer-focus:-translate-y-5
          peer-focus:top-3
          peer-focus:bg-background-light
          dark:peer-focus:bg-background-dark
          "
      >
        {label}
      </label>
    </div>
  );
};

export default FormField;