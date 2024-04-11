import { TestBed } from '@angular/core/testing';

import { CustomLocationService } from './custom-location.service';

describe('CustomLocationService', () => {
  let service: CustomLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
