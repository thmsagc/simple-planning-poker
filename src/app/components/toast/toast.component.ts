import { Component } from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  standalone: true,
  imports: [
    NgClass
  ],
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  showToast: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';

  show(title: string, message: string) {
    this.toastTitle = title;
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.hide(), 3000); // Esconde o toast após 3 segundos
  }

  hide() {
    this.showToast = false;
  }
}
