import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {window} from "rxjs";
import {WebSocketService} from "../../services/web-socket.service";
import {
  CountdownTimerComponent
} from "../../components/room-countdown/room-countdown.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    NgIf,
    CountdownTimerComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  uniqueId: string;
  @ViewChild('navbarCollapse') navbarCollapse: ElementRef;

  links: NavbarLink[];

  constructor(private router: Router) {
    this.uniqueId = 'navbarCollapse' + Math.random().toString(36).substr(2, 9);

  }

  closeNavbar() {
    if (this.navbarCollapse && this.navbarCollapse.nativeElement.classList.contains('show')) {
      const collapseElement = new (window as any).bootstrap.Collapse(this.navbarCollapse.nativeElement);
      collapseElement.hide();
    }
  }

  ngOnInit(): void {
    this.links = [
      new NavbarLink("About", ['about'])
    ]
  }

  async navigateToIndex() {
    await this.router.navigate(['']);
  }
}

class NavbarLink {
  titulo: string;
  routerLink : string[];

  constructor(titulo: string, routerLink: string[]) {
    this.titulo = titulo;
    this.routerLink = routerLink;
  }
}
