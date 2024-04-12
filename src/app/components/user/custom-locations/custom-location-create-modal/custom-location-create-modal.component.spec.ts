import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomLocationCreateModalComponent } from './custom-location-create-modal.component';

describe('CustomLocationCreateModalComponent', () => {
  let component: CustomLocationCreateModalComponent;
  let fixture: ComponentFixture<CustomLocationCreateModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomLocationCreateModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomLocationCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
