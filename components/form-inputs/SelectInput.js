import React from 'react';
import { Select } from '@shopify/polaris';

const SelectInput = ({ label, input, options, className, onChange, eventName }) => {
  return (
    <div className={className}>
      <Select
        label={label}
        options={options}
        onChange={(value) => {
          amplitude.logEvent(eventName,{value: value})
          if (onChange) {
            onChange(value);
            return;
          }
          if (input.onChange) {
            input.onChange(value);
          }
        }}
        value={input.value}
      />
    </div>
  );
};

export default SelectInput;
