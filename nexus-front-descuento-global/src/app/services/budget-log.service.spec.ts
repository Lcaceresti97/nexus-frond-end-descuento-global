import { TestBed } from '@angular/core/testing';

import { BudgetLogService } from './budget-log.service';

describe('BudgetLogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BudgetLogService = TestBed.get(BudgetLogService);
    expect(service).toBeTruthy();
  });
});
