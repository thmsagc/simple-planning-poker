import {Component, OnInit, ViewChild} from '@angular/core';
import {CardReveledComponent} from "../../components/card-reveled/card-reveled.component";
import {CardUnreveledComponent} from "../../components/card-unreveled/card-unreveled.component";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {ToastComponent} from "../../components/toast/toast.component";
import {Subscription} from "rxjs";
import {WebSocketService} from "../../services/web-socket.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CountdownTimerComponent} from "../../components/room-countdown/room-countdown.component";

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [
    CardReveledComponent,
    CardUnreveledComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    ToastComponent,
    CountdownTimerComponent
  ],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss'
})
export class PlanningComponent implements OnInit {
  private wsSubscription: Subscription;
  public messages: string[] = [];
  public participants: string[] = [];
  public stories: string[] = [];

  nicknameForm : FormGroup;
  messageForm : FormGroup;
  storyForm : FormGroup;

  nickname : string = "";
  connected: boolean = false;

  started: boolean = false;
  reveled: boolean = false;
  votes: any = [];
  voteAverage: number = 0;
  currentStory: number = -1;
  code: string;

  @ViewChild(ToastComponent) toast: ToastComponent;

  constructor(private webSocketService: WebSocketService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
    this.code = this.route.snapshot.params['code'];
  }

  onConnect() {
    if (this.nicknameForm.valid) {
      this.webSocketService.connect('ws://192.168.1.167:3000/connect/' + this.code, this.nicknameForm.value.nickname);

      this.wsSubscription = this.webSocketService.getMessages().subscribe((data) => {
        this.connected = true;

        this.toast.show('Planning', data.text);

        if(data.type === 'nickname') {
          this.nickname = data.nickname;
          this.voteAverage = data.voteAverage;
          this.currentStory = data.currentStory;
          this.stories = data.stories;
          this.votes = data.votes;
          this.started = data.started;
          this.reveled = data.reveled;
        }

        if(data.type === 'welcome') {
          this.participants = data.participants;
        }

        if(data.type === 'disconnect') {
          this.participants = data.participants;
        }

        if(data.type === 'vote') {
          if(this.votes.filter((voto: any) => voto.nickname == data.nickname).length == 0) {
            this.votes.push({nickname: data.nickname});
          }
        }

        if(data.type === 'post-story') {
          this.stories = data.stories;
        }

        if(data.type === 'remove-story') {
          this.stories.splice(data.index, 1);
          this.currentStory = -1;
        }

        if(data.type === 'current-story') {
          this.currentStory = data.index;
          this.started = false;
          this.reveled = false;
          this.votes = [];
          this.voteAverage = 0;
        }

        if(data.type === 'start') {
          this.started = true;
          this.reveled = false;
          this.votes = [];
          this.voteAverage = 0;
        }

        if(data.type === 'clear') {
          this.started = false;
          this.reveled = false;
          this.votes = [];
          this.voteAverage = 0;
        }

        if(data.type === 'revel') {
          this.started = false;
          this.reveled = true;
          this.votes = data.votes;
          this.voteAverage = data.average;
        }

        if(data.type === 'change-moderator') {
          this.participants = data.participants;
        }

        if(data.type === 'closed') {
          this.router.navigate(['closed']);
        }
      });
    }
  }

  initializeForm() {
    this.nicknameForm  = this.formBuilder.group({
      nickname: ['', Validators.required]
    });

    this.messageForm  = this.formBuilder.group({
      mensagem: ['', Validators.required]
    });

    this.storyForm  = this.formBuilder.group({
      title: ['', Validators.required]
    });
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      this.webSocketService.sendMessage(this.messageForm.value.mensagem);
    }
  }

  onVote(value: number) {
    this.webSocketService.sendEventVote(value);
  }

  onStart() {
    this.webSocketService.sendEventStart();
  }

  onNext() {
    this.webSocketService.sendEventNext();
  }

  onBack() {
    this.webSocketService.sendEventBack();
  }

  onReveal() {
    this.webSocketService.sendEventReveal();
  }

  onClear() {
    this.webSocketService.sendEventClear();
  }

  onAddStory() {
    if(this.nickname == this.participants[0]) {
      if (this.storyForm.valid) {
        console.log(this.storyForm.value.title);
        this.webSocketService.sendEventAddStory(this.storyForm.value.title);
      }
    }
  }

  onRemoveStory(index: number) {
    if(this.nickname == this.participants[0]) {
      this.webSocketService.sendEventRemoveStory(index);
    }
  }

  onChangeModerator(index: number) {
    if(this.nickname == this.participants[0]) {
      this.webSocketService.sendEventChangeModerator(index);
    }
  }

  ngOnDestroy(): void {
    if(this.wsSubscription !== undefined) {
      this.wsSubscription.unsubscribe();
      this.webSocketService.close();
    }
  }

  protected readonly console = console;

}
