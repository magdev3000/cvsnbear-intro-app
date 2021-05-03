import React, { Component } from 'react';
import { ButtonGroup, Button, Label } from '@shopify/polaris';


class GroupButtonInput extends Component {

  onChange = (item) => {
    this.props.input.onChange(item.value);
    if(this.props.eventName) {
      amplitude.logEvent(this.props.eventName, {value: item.value})
    }
  };

  render() {
    const { input, items, label, fullWidth, className } = this.props;
    return (
      <div className={className}>
        {label ? <div className="Polaris-Labelled__LabelWrapper"><Label>{label}</Label></div> : null }
        <ButtonGroup fullWidth={fullWidth} segmented>
          {items.map((item) => (
            <Button
              primary={input.value === item.value}
              textAlign="center"
              key={`button-item-${item.value}`}
              onClick={this.onChange.bind(this, item)}
            >
              <div className={item.className}>{item.icon} {item.label}</div>
            </Button>
          ))}
        </ButtonGroup>
      </div>
    );
  }
}

export default GroupButtonInput;
