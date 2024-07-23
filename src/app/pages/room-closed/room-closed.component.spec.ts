import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomClosedComponent } from './room-closed.component';

describe('RoomClosedComponent', () => {
  let component: RoomClosedComponent;
  let fixture: ComponentFixture<RoomClosedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomClosedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomClosedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
