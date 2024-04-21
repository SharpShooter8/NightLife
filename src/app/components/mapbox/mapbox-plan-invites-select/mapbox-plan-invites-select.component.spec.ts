import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapboxPlanInvitesSelectComponent } from './mapbox-plan-invites-select.component';

describe('MapboxPlanInvitesSelectComponent', () => {
  let component: MapboxPlanInvitesSelectComponent;
  let fixture: ComponentFixture<MapboxPlanInvitesSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxPlanInvitesSelectComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxPlanInvitesSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
