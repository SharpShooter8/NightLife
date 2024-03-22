import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FoursquareCardSmallComponent } from './foursquare-card-small.component';

describe('FoursquareCardSmallComponent', () => {
  let component: FoursquareCardSmallComponent;
  let fixture: ComponentFixture<FoursquareCardSmallComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FoursquareCardSmallComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FoursquareCardSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
