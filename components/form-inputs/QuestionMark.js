import React from 'react';
import { QuestionMarkMajorMonotone } from '@shopify/polaris-icons';
import { Icon, Tooltip } from '@shopify/polaris';
import './QuestionMark.css';

const QuestionMark = ({ content, className }) => {
  return (
    <div className={className}>
      <Tooltip light preferredPosition="above" content={content}>
        <Icon color="inkLighter" source={QuestionMarkMajorMonotone} />
      </Tooltip>
    </div>
  );
};

export default QuestionMark;
