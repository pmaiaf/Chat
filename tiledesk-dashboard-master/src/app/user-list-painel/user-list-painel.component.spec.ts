import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListPainel } from './user-list-painel.component';

describe('SigninComponent', () => {
  let component: UserListPainel;
  let fixture: ComponentFixture<UserListPainel>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListPainel ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListPainel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
