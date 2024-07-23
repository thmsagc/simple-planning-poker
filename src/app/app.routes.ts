import { Routes } from '@angular/router';
import {InicioComponent} from "./pages/inicio/inicio.component";
import {NotFoundComponent} from "./pages/not-found/not-found.component";
import {PlanningComponent} from "./pages/planning/planning.component";
import {AboutComponent} from "./pages/about/about.component";
import {RoomClosedComponent} from "./pages/room-closed/room-closed.component";

export const routes: Routes = [
  {path: '', component: InicioComponent},
  {path: 'room', children:[{path: ':code', component: PlanningComponent}]},
  {path: 'closed', component: RoomClosedComponent},
  {path: 'about', component: AboutComponent},
  {path: '**', component: NotFoundComponent}
];
