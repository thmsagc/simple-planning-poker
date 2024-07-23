import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {RoomService} from "../../services/room.service";
import {Room} from "../../model/Room";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {

  joinForm: FormGroup;
  createForm: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder, private router: Router, private roomService: RoomService) {

  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.joinForm  = this.formBuilder.group({
      code: ['', [Validators.required, Validators.pattern('^[A-Z0-9]{5}$')]]
    });

    this.createForm  = this.formBuilder.group({
      type: ['Sequential', Validators.required]
    });
  }

  async onJoin() {
    if (this.joinForm.valid) {
      await this.router.navigate(['room', this.joinForm.value.code]);
      this.submitted = false;
    }
  }

  async onCreateRoom() {
    if (this.createForm.valid) {
      this.roomService.createRoom(this.createForm.value.type).subscribe(async (data) => {
        await this.router.navigate(['room', (data as Room).code]);
        this.submitted = false;
      })
    }
  }
}
