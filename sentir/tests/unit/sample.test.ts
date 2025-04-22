import { render, screen } from '@testing-library/react';
import React from 'react';

const SampleComponent = () => <div>Hello, world!</div>;

test('renders SampleComponent', () => {
  render(<SampleComponent />);
  const element = screen.getByText(/Hello, world!/i);
  expect(element).toBeInTheDocument();
});
