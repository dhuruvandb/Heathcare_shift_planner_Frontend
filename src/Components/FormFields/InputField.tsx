/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useField } from "formik";

interface InputFieldProps {
  name: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: any;
  onBlur?: any;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  availableDates?: string[];
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, disabled, type = "text", error, touched, ...props }) => {
  const [field] = useField(props.name);

  // Generate min/max based on availableDates if type is date
  const dateLimits = type === "date" && props.availableDates
    ? {
      min: props.availableDates[0],
      max: props.availableDates[props.availableDates.length - 1]
    }
    : {};

  return (
    <div className="mb-4">
      {type === "textarea" ? (
        <textarea
          className={`w-full px-3 py-2 border ${error && touched ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200 ${disabled ? "text-gray-300" : ""}`}
          placeholder={placeholder}
          {...field}
          {...props}
        />
      ) : (
        <>
          <input
            className={`w-full px-3 py-2 border ${error && touched ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200 ${disabled ? "text-gray-300" : ""}`}
            placeholder={placeholder}
            type={disabled ? "" : type}
            {...field}
            {...props}
            list={type === "date" && props.availableDates ? "available-dates" : ""}
            {...dateLimits} // Apply min/max for date inputs
          />

          {type === "date" && props.availableDates && (
            <datalist id="available-dates">
              {props.availableDates.map((date) => (
                <option key={date} value={date} />
              ))}
            </datalist>
          )}
        </>
      )}
      {error && touched ? (
        <div className="text-red-500 text-xs text-left ml-[3px]">{error}</div>
      ) : null}
    </div>
  );
};

export default InputField;
