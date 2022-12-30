import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListSignupComponent } from './user-list-signup.component';

describe('UserListEditComponent', () => {
  let component: UserListSignupComponent;
  let fixture: ComponentFixture<UserListSignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListSignupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
