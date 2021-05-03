import React, { Component } from "react";
import { Select } from "@shopify/polaris";

let availableLanguages = [
  { label: "🇺🇸  English ", value: "en" },
];

if(DEV_MODE){
  availableLanguages.push({ label: "🏴‍☠️  Development ", value: "xx" });
}

// if cahnged the land manually save selected locale in the db
//initiate the input with the land from the db || default dashboard locale if relevant, if not use en
export default class LanguagePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
        selected: this.props.locale || 'en',
    };
  }

  render() {
      const {onChangeLocale} = this.props;
    return (
      <Select
        className="languagePickerContainer"
        options={availableLanguages}
        onChange={value => {
          amplitude.logEvent("click-lang_picker", { value: value });
          console.log(`changing value to: ${value}`)
          this.setState({selected: value})
          onChangeLocale(value);
        }}
        value={this.state.selected}
      />
    );
  }
}
