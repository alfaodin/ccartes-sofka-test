import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Confirmation Modal Component
 * Reusable modal for confirming destructive actions (like delete)
 */
@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  /**
   * Whether the modal is visible
   */
  @Input() isVisible = false;

  /**
   * Product name for delete confirmation
   */
  @Input() productName = '';

  /**
   * Emits when user confirms
   */
  @Output() confirm = new EventEmitter<void>();

  /**
   * Emits when user cancels
   */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Handle confirm button click
   */
  onConfirm(): void {
    this.confirm.emit();
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Handle overlay click (clicking outside modal)
   */
  onOverlayClick(event: MouseEvent): void {
    // Only close if clicking directly on overlay, not on modal content
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  /**
   * Handle escape key press
   */
  onEscapeKey(): void {
    this.onCancel();
  }
}
