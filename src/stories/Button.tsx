import React from 'react';

import './button.css';

export interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean;
  /** What background color to use */
  backgroundColor?: string;
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large';
  /** Button contents */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Accessibility label. Set to false for buttons with text content, or provide a meaningful label for icon-only buttons */
  ariaLabel?: string | false;
}

/** Primary UI component for user interaction */
export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ariaLabel,
  ...props
}: ButtonProps) => {
  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
  
  // Handle ariaLabel prop for Storybook 11 compatibility
  // If ariaLabel is false, don't add aria-label (button has accessible text)
  // If ariaLabel is a string, use it as the aria-label
  // If ariaLabel is undefined and button has text, default to false
  const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
    ...props,
  };
  
  if (ariaLabel === false) {
    // Button has text content, no aria-label needed
  } else if (typeof ariaLabel === 'string') {
    buttonProps['aria-label'] = ariaLabel;
  } else if (label) {
    // Button has text, default to false for Storybook 11
    // This will be handled by the stories explicitly setting ariaLabel={false}
  }
  
  return (
    <button
      type="button"
      className={['storybook-button', `storybook-button--${size}`, mode].join(' ')}
      style={{ backgroundColor }}
      {...buttonProps}
    >
      {label}
    </button>
  );
};
