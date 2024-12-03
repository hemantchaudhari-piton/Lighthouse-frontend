import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GujaratCTSComponent } from './cts.component';

describe('CtsComponent', () => {
  let component: GujaratCTSComponent;
  let fixture: ComponentFixture<GujaratCTSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GujaratCTSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GujaratCTSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
