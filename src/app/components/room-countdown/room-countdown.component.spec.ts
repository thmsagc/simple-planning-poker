import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomCountdownComponent } from './room-countdown.component';

describe('RoomCountdownComponent', () => {
  let component: RoomCountdownComponent;
  let fixture: ComponentFixture<RoomCountdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomCountdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
