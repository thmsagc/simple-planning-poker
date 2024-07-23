import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {DecimalPipe, NgIf} from "@angular/common";
import {WebSocketService} from "../../services/web-socket.service";

@Component({
  selector: 'app-room-countdown',
  standalone: true,
  imports: [
    DecimalPipe,
    NgIf
  ],
  templateUrl: './room-countdown.component.html',
  styleUrl: './room-countdown.component.scss'
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  milliseconds: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  private intervalId: any;

  constructor(private webSocketService: WebSocketService) {
  }

  ngOnInit(): void {
    this.startTimer();

    this.webSocketService.getMessages().subscribe((data) => {
      if(data.roomExpiryTime !== null && data.roomExpiryTime !== undefined) {
        this.milliseconds = data.roomExpiryTime;
        this.resetTimer();
      } else {
        this.milliseconds = 0;
      }
      if(data.type === 'closed') {
        this.milliseconds = 0;
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  private startTimer() {
    this.resetTimer();
  }

  private resetTimer() {
    clearInterval(this.intervalId);
    this.calculateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
  }

  private updateTime() {
    if (this.milliseconds <= 0) {
      this.minutes = 0;
      this.seconds = 0;
      clearInterval(this.intervalId);
    } else {
      this.milliseconds -= 1000; // Decrementa 1 segundo
      this.calculateTime();
    }
  }

  private calculateTime() {
    this.minutes = Math.floor(this.milliseconds / 60000);
    this.seconds = Math.floor((this.milliseconds % 60000) / 1000);
  }
}
