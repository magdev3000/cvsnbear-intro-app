import React from 'react';
import classNames from 'classnames';
import { Stack, RadioButton, Label } from '@shopify/polaris';
import './RadioSelect.scss';

const RadioSelect = ({ input, label, choices, fullWidth, className, eventName }) => {
  return (
    <div className={classNames('RadioButton', className)} style={{ width: fullWidth ? '100%' : 'auto' }}>
      <Stack vertical>
        <Label>{label}</Label>
        {
          choices.map((choice, index) => {
            return (
              <RadioButton
                key={index}
                id={choice.value}
                label={choice.label}
                checked={choice.value === input.value}
                name={label}
                onChange={(a,b)=>input.onChange(b)}
                onFocus={()=>{
                  if (eventName) {
                    amplitude.logEvent(eventName,{value: `${!input.value}`})
                  }
                }}
              />
            );
          })
        }
      </Stack>
    </div>
  );
};

export default RadioSelect;