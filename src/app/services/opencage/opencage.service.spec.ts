import { TestBed } from '@angular/core/testing';

import { OpencageService } from './opencage.service';

describe('OpencageService', () => {
  let service: OpencageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpencageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
