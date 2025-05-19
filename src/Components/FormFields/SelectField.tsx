import React from "react";

import { useField } from "formik";

interface SelectFieldProps {
  name: string;
  placeholder: string;
  disabled?: boolean;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string, value: string }[];
  error?: string;
  touched?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  placeholder,
  options,
  disabled,
  onChange,
  value,
  error,
  touched,
  ...props
}) => {
  const [field] = useField(props.name);
  return (
    <div className="mb-4">
      <select
        {...field}
        {...props}
        disabled={disabled}
        onChange={onChange}
        value={value}
        className={`w-full px-3 py-2 border ${error && touched ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200 ${disabled ? "text-gray-300" : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && touched ? (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      ) : null}
    </div>
  );
};

export default SelectField;
