import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FoursquareCardLargeComponent } from './foursquare-card-large.component';

describe('FoursquareCardLargeComponent', () => {
  let component: FoursquareCardLargeComponent;
  let fixture: ComponentFixture<FoursquareCardLargeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FoursquareCardLargeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FoursquareCardLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
