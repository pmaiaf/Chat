import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponentAdmin } from './projects.component';

describe('SettingsComponent', () => {
  let component: ProjectsComponentAdmin;
  let fixture: ComponentFixture<ProjectsComponentAdmin>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsComponentAdmin ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsComponentAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
