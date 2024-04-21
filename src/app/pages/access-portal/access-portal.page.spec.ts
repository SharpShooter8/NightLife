import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccessPortalPage } from './access-portal.page';

describe('AccessPortalPage', () => {
  let component: AccessPortalPage;
  let fixture: ComponentFixture<AccessPortalPage>;

  beforeEach(async() => {
    fixture = TestBed.createComponent(AccessPortalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
