import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapboxPlanInviteMemberComponent } from './mapbox-plan-invite-member.component';

describe('MapboxPlanInviteMemberComponent', () => {
  let component: MapboxPlanInviteMemberComponent;
  let fixture: ComponentFixture<MapboxPlanInviteMemberComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxPlanInviteMemberComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxPlanInviteMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
