import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {CardReveledComponent} from "./components/card-reveled/card-reveled.component";
import {CardUnreveledComponent} from "./components/card-unreveled/card-unreveled.component";
import {ToastComponent} from "./components/toast/toast.component";
import {HeaderComponent} from "./layout/header/header.component";
import {FooterComponent} from "./layout/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgForOf, NgIf, ReactiveFormsModule, CardReveledComponent, CardUnreveledComponent, ToastComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  ngOnInit(): void {
  }

}
