import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapboxEditCustomLocationComponent } from './mapbox-edit-custom-location.component';

describe('MapboxEditCustomLocationComponent', () => {
  let component: MapboxEditCustomLocationComponent;
  let fixture: ComponentFixture<MapboxEditCustomLocationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxEditCustomLocationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxEditCustomLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
