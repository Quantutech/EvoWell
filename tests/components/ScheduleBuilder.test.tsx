
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScheduleBuilder from '../../components/ScheduleBuilder';
import { Availability } from '../../types';

describe('ScheduleBuilder', () => {
  const mockAvailability: Availability = {
    days: ['Mon'],
    hours: [],
    schedule: [
      { day: 'Mon', active: true, timeRanges: [{ start: '09:00', end: '17:00' }] },
      { day: 'Tue', active: false, timeRanges: [] },
      { day: 'Wed', active: false, timeRanges: [] },
      { day: 'Thu', active: false, timeRanges: [] },
      { day: 'Fri', active: false, timeRanges: [] },
      { day: 'Sat', active: false, timeRanges: [] },
      { day: 'Sun', active: false, timeRanges: [] },
    ],
    blockedDates: []
  };

  it('renders weekly schedule correctly', () => {
    render(<ScheduleBuilder value={mockAvailability} onChange={vi.fn()} />);
    expect(screen.getByText('Weekly Hours')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    // Monday is active
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
  });

  it('toggles day availability', () => {
    const handleChange = vi.fn();
    render(<ScheduleBuilder value={mockAvailability} onChange={handleChange} />);
    
    // Find Tue toggle (index 1 in array, but visually look for label)
    // The component renders days with click handlers on the toggle div
    const tueLabel = screen.getByText('Tue');
    const row = tueLabel.closest('div')?.parentElement; 
    const toggle = row?.querySelector('.cursor-pointer');
    
    if (toggle) {
        fireEvent.click(toggle);
        expect(handleChange).toHaveBeenCalled();
        const newState = handleChange.mock.calls[0][0];
        expect(newState.schedule[1].active).toBe(true);
    } else {
        throw new Error("Toggle not found");
    }
  });

  it('adds blocked dates', () => {
    const handleChange = vi.fn();
    render(<ScheduleBuilder value={mockAvailability} onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('Time Off'));
    
    const dateInput = screen.getByLabelText(/select date/i);
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
    
    fireEvent.click(screen.getByText('Block Date'));
    
    expect(handleChange).toHaveBeenCalled();
    const newState = handleChange.mock.calls[0][0];
    expect(newState.blockedDates).toContain('2024-12-25');
  });
});
