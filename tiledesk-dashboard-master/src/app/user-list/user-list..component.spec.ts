import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserList } from './user-list.component';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserList ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
