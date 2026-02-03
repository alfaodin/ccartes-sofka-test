import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent {
  isOpen = false;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetY: 4, offsetX: -120 },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4, offsetX: -120 }
  ];

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  onEdit(): void {
    this.edit.emit();
    this.isOpen = false;
  }

  onDelete(): void {
    this.delete.emit();
    this.isOpen = false;
  }
}
