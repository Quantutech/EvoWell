import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MapZoomControls from '../../../src/components/maps/MapZoomControls';

describe('MapZoomControls', () => {
  it('calls zoom callbacks when controls are clicked', async () => {
    const user = userEvent.setup();
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();

    render(<MapZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} />);

    await user.click(screen.getByRole('button', { name: /zoom in/i }));
    await user.click(screen.getByRole('button', { name: /zoom out/i }));

    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onZoomOut).toHaveBeenCalledTimes(1);
  });

  it('disables controls when disabled state is set', () => {
    render(<MapZoomControls onZoomIn={vi.fn()} onZoomOut={vi.fn()} disabled />);

    expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
  });
});

