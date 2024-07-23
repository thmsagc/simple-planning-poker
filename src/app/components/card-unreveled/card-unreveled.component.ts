import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-card-unreveled',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './card-unreveled.component.html',
  styleUrl: './card-unreveled.component.scss'
})
export class CardUnreveledComponent {

  @Input() title: string;

}
