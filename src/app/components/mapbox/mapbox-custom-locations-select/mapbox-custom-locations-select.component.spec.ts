import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapboxCustomLocationsSelectComponent } from './mapbox-custom-locations-select.component';

describe('MapboxCustomLocationsSelectComponent', () => {
  let component: MapboxCustomLocationsSelectComponent;
  let fixture: ComponentFixture<MapboxCustomLocationsSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxCustomLocationsSelectComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxCustomLocationsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
