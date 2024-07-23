import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardUnreveledComponent } from './card-unreveled.component';

describe('CardUnreveledComponent', () => {
  let component: CardUnreveledComponent;
  let fixture: ComponentFixture<CardUnreveledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardUnreveledComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardUnreveledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
