import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProviderSettings from '../../../src/components/dashboard/tabs/ProviderSettings';
import { providers } from '../../../src/data/seed/providers';
import { UserRole } from '../../../src/types';

describe('ProviderSettings profile design controls', () => {
  const updateField = vi.fn();
  const handleSaveProfile = vi.fn();
  const handleAiBio = vi.fn();
  const handleImageUpload = vi.fn();
  const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

  beforeEach(() => {
    updateField.mockReset();
    handleSaveProfile.mockReset();
    handleAiBio.mockReset();
    handleImageUpload.mockReset();
    openSpy.mockClear();
  });

  it('allows selecting and previewing color schemes and saving design choice', async () => {
    const user = userEvent.setup();
    const profile = {
      ...providers[0],
      profileTheme: 'MIDNIGHT' as const,
      profileSlug: 'provider-preview-test',
    };

    render(
      <ProviderSettings
        editForm={profile}
        user={{
          id: profile.userId,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@demo.com',
          role: UserRole.PROVIDER,
          createdAt: '',
          updatedAt: '',
          isDeleted: false,
        }}
        updateField={updateField}
        handleSaveProfile={handleSaveProfile}
        isSaving={false}
        saveMessage=""
        specialtiesList={[]}
        handleAiBio={handleAiBio}
        aiLoading={false}
        handleImageUpload={handleImageUpload}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Forest/i }));
    expect(updateField).toHaveBeenCalledWith('profileTheme', 'FOREST');

    const previewButtons = screen.getAllByRole('button', { name: 'Preview' });
    await user.click(previewButtons[1]);
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('#/provider/provider-preview-test?previewTheme=FOREST'),
      '_blank',
      'noopener,noreferrer',
    );

    await user.click(screen.getByRole('button', { name: 'Save Design Choice' }));
    expect(handleSaveProfile).toHaveBeenCalled();
  });
});
