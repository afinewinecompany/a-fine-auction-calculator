/**
 * AvatarUpload Component Tests
 *
 * Tests for the avatar upload component including file selection,
 * validation, and upload states.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvatarUpload } from '@/features/profile/components/AvatarUpload';

describe('AvatarUpload', () => {
  const defaultProps = {
    currentAvatarUrl: null,
    displayName: 'Test User',
    email: 'test@example.com',
    isUploading: false,
    onFileSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render avatar fallback with initials when no avatar URL', () => {
      render(<AvatarUpload {...defaultProps} />);

      // Should render the avatar container - fallback shows initials
      // "Test User" -> initials "TU"
      const fallback = screen.getByText('TU');
      expect(fallback).toBeInTheDocument();
    });

    it('should render avatar component with avatar URL when provided', () => {
      render(
        <AvatarUpload
          {...defaultProps}
          currentAvatarUrl="https://example.com/avatar.jpg"
        />
      );

      // Avatar image loads asynchronously in Radix - check that the avatar container exists
      // and that the image element is present (may not have loaded yet)
      const avatarContainer = document.querySelector('[data-slot="avatar"]');
      expect(avatarContainer).toBeInTheDocument();
    });

    it('should render Change Avatar button', () => {
      render(<AvatarUpload {...defaultProps} />);

      expect(screen.getByRole('button', { name: /change avatar/i })).toBeInTheDocument();
    });

    it('should render file requirements hint', () => {
      render(<AvatarUpload {...defaultProps} />);

      expect(screen.getByText(/jpeg, png, or webp/i)).toBeInTheDocument();
      expect(screen.getByText(/max 2mb/i)).toBeInTheDocument();
    });
  });

  describe('Upload States', () => {
    it('should show uploading state when isUploading is true', () => {
      render(<AvatarUpload {...defaultProps} isUploading />);

      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      // Button should be disabled during upload
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should disable button when disabled prop is true', () => {
      render(<AvatarUpload {...defaultProps} disabled />);

      expect(screen.getByRole('button', { name: /change avatar/i })).toBeDisabled();
    });
  });

  describe('Error Display', () => {
    it('should display error message when provided', () => {
      render(<AvatarUpload {...defaultProps} error="File too large" />);

      expect(screen.getByRole('alert')).toHaveTextContent('File too large');
    });

    it('should not display error when null', () => {
      render(<AvatarUpload {...defaultProps} error={null} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should call onFileSelect when valid file is selected', async () => {
      const onFileSelect = vi.fn();
      render(<AvatarUpload {...defaultProps} onFileSelect={onFileSelect} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

      await userEvent.upload(fileInput, testFile);

      expect(onFileSelect).toHaveBeenCalledWith(testFile);
    });

    it('should not call onFileSelect for invalid file type', async () => {
      const onFileSelect = vi.fn();
      render(<AvatarUpload {...defaultProps} onFileSelect={onFileSelect} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });

      // Manually set the files since userEvent may filter based on accept attribute
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(onFileSelect).not.toHaveBeenCalled();
      // Should show error message
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should not call onFileSelect for file over 2MB', async () => {
      const onFileSelect = vi.fn();
      render(<AvatarUpload {...defaultProps} onFileSelect={onFileSelect} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Create a file larger than 2MB
      const largeFile = new File(
        [new ArrayBuffer(3 * 1024 * 1024)],
        'large-avatar.jpg',
        { type: 'image/jpeg' }
      );

      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(onFileSelect).not.toHaveBeenCalled();
      expect(screen.getByRole('alert')).toHaveTextContent(/less than 2mb/i);
    });

    it('should accept valid image types', async () => {
      const onFileSelect = vi.fn();
      render(<AvatarUpload {...defaultProps} onFileSelect={onFileSelect} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Test JPEG
      const jpegFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, jpegFile);
      expect(onFileSelect).toHaveBeenCalledWith(jpegFile);

      // Test PNG
      onFileSelect.mockClear();
      const pngFile = new File(['test'], 'avatar.png', { type: 'image/png' });
      await userEvent.upload(fileInput, pngFile);
      expect(onFileSelect).toHaveBeenCalledWith(pngFile);

      // Test WebP
      onFileSelect.mockClear();
      const webpFile = new File(['test'], 'avatar.webp', { type: 'image/webp' });
      await userEvent.upload(fileInput, webpFile);
      expect(onFileSelect).toHaveBeenCalledWith(webpFile);
    });
  });

  describe('Button Click', () => {
    it('should trigger file input when button is clicked', async () => {
      render(<AvatarUpload {...defaultProps} />);

      const button = screen.getByRole('button', { name: /change avatar/i });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Mock click on file input
      const clickSpy = vi.spyOn(fileInput, 'click');

      await userEvent.click(button);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Initials Fallback', () => {
    it('should show initials from display name', () => {
      render(<AvatarUpload {...defaultProps} displayName="John Doe" />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should show email initials when no display name', () => {
      render(
        <AvatarUpload {...defaultProps} displayName={null} email="john@example.com" />
      );

      expect(screen.getByText('JO')).toBeInTheDocument();
    });

    it('should handle single word display name', () => {
      render(<AvatarUpload {...defaultProps} displayName="John" />);

      expect(screen.getByText('JO')).toBeInTheDocument();
    });
  });
});
