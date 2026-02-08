import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Footer from '../../src/components/Footer';

vi.mock('../../src/App', () => ({
  useNavigation: () => ({
    currentPath: '#/',
    navigate: vi.fn(),
  }),
}));

describe('Footer global disclaimer', () => {
  it('renders the site-wide safety and verification disclaimers', () => {
    render(<Footer />);

    expect(
      screen.getByText(
        /EvoWell provides provider discovery and practice tools\. Evo is a navigation assistant and does not provide medical advice\./i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/For emergencies, contact local emergency services\./i)).toBeInTheDocument();
    expect(
      screen.getByText(/Provider verification supports transparency, but it isn['’]t a guarantee of outcomes\./i),
    ).toBeInTheDocument();
  });

  it('does not render contact or newsletter blocks', () => {
    render(<Footer />);

    expect(screen.queryByText(/support@evowell\.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/partners@evowell\.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/subscribe/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/email address/i)).not.toBeInTheDocument();
  });
});
