import { createHostListener } from '@angular/compiler/src/core';
import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private webReqService: WebRequestService) {}

  createList(title: string) {
    // want to send a wep request to create a list
    return this.webReqService.post('lists', { title });
  }
}
