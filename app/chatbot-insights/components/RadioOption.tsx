import React from 'react';

interface RadioOptionProps {
  name: string;
  value: string;
  checked?: boolean;
}

const RadioOption = ({ name, value, checked = false }: RadioOptionProps) => (
  <label className="flex items-center space-x-2 text-sm">
    <input
      type="radio"
      name={name}
      value={value}
      defaultChecked={checked}
      className="form-radio text-heading2"
    />
    <span>{value}</span>
  </label>
);

export default RadioOption;
