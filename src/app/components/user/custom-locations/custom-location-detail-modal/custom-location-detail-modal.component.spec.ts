import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomLocationDetailModalComponent } from './custom-location-detail-modal.component';

describe('CustomLocationDetailModalComponent', () => {
  let component: CustomLocationDetailModalComponent;
  let fixture: ComponentFixture<CustomLocationDetailModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomLocationDetailModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomLocationDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
