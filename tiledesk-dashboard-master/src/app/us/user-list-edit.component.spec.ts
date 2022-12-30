import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListEditComponent } from './user-list-edit.component';

describe('UserListEditComponent', () => {
  let component: UserListEditComponent;
  let fixture: ComponentFixture<UserListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
