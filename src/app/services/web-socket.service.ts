import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  private subject: Subject<any>;

  constructor() {
    this.subject = new Subject<any>();
  }

  public connect(url: string, nickname: string): void {

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.socket.send(JSON.stringify({ type: 'nickname', nickname }));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.subject.next(data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      this.subject.next({type: 'closed'});
    };
  }

  public sendMessage(message: string): void {
    this.socket.send(JSON.stringify({ type: 'message', text: message }));
  }

  public sendEventVote(value: number): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'vote', value: value }));
  }

  public sendEventReveal(): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'revel', value: '' }));
  }

  public sendEventClear(): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'clear', value: '' }));
  }

  public sendEventStart(): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'start', value: '' }));
  }

  public sendEventNext(): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'next-story', value: '' }));
  }

  public sendEventBack(): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'back-story', value: '' }));
  }

  public sendEventAddStory(title: string): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'post-story', value: title }));
  }

  public sendEventRemoveStory(index: number): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'remove-story', value: index }));
  }

  public sendEventChangeModerator(index: number): void {
    this.socket.send(JSON.stringify({ type: 'event', name: 'change-moderator', value: index }));
  }

  public getMessages(): Observable<any> {
    return this.subject.asObservable();
  }

  public close(): void {
    this.socket.close();
  }
}
