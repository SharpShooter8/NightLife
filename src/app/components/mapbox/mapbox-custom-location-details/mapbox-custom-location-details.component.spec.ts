import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapboxCustomLocationDetailsComponent } from './mapbox-custom-location-details.component';

describe('MapboxCustomLocationDetailsComponent', () => {
  let component: MapboxCustomLocationDetailsComponent;
  let fixture: ComponentFixture<MapboxCustomLocationDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxCustomLocationDetailsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxCustomLocationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
