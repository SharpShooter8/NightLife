import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapboxCreateCustomLocationComponent } from './mapbox-create-custom-location.component';

describe('MapboxCreateCustomLocationComponent', () => {
  let component: MapboxCreateCustomLocationComponent;
  let fixture: ComponentFixture<MapboxCreateCustomLocationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxCreateCustomLocationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxCreateCustomLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
