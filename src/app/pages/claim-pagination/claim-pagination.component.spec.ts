import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPaginationComponent } from './claim-pagination.component';

describe('ClaimPaginationComponent', () => {
  let component: ClaimPaginationComponent;
  let fixture: ComponentFixture<ClaimPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimPaginationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClaimPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
