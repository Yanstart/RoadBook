import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from '../../app/components/ui/Button';

test('renders Button component', () => {
  render(<Button label="Click Me" />);
  const buttonElement = screen.getByText(/Click Me/i);
  expect(buttonElement).toBeInTheDocument();
});