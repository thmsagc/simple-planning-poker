import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private http: HttpClient) { }

  createRoom(type: string) {
    return this.http.post(environment.apiUrl + 'create-room', {type: type});
  }

}
