import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardReveledComponent } from './card-reveled.component';

describe('CardComponent', () => {
  let component: CardReveledComponent;
  let fixture: ComponentFixture<CardReveledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardReveledComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardReveledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
