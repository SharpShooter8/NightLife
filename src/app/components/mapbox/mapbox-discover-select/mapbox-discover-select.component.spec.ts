import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapboxDiscoverSelectComponent } from './mapbox-discover-select.component';

describe('MapboxDiscoverSelectComponent', () => {
  let component: MapboxDiscoverSelectComponent;
  let fixture: ComponentFixture<MapboxDiscoverSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxDiscoverSelectComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxDiscoverSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
