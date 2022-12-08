import { LoggerInstance } from './../../../../chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'chat-like-unlike',
  templateUrl: './like-unlike.component.html',
  styleUrls: ['./like-unlike.component.scss']
})
export class LikeUnlikeComponent implements OnInit {

  private logger: LoggerService = LoggerInstance.getInstance();
  constructor() { }

  ngOnInit(): void {
  }

  onClick(icon: string){
    this.logger.debug('[LIKE-UNLIKE] onClick-->', icon)
  }

}
