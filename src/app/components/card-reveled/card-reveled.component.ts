import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-card-reveled',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './card-reveled.component.html',
  styleUrl: './card-reveled.component.scss'
})
export class CardReveledComponent {

  @Input() numero: number;
  @Input() title: string;

}
