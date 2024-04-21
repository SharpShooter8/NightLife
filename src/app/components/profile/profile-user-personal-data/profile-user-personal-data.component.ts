import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonGrid, IonItem } from '@ionic/angular/standalone'

@Component({
  selector: 'app-profile-user-personal-data',
  templateUrl: './profile-user-personal-data.component.html',
  styleUrls: ['./profile-user-personal-data.component.scss'],
  standalone: true,
  imports: [IonItem, IonGrid]
})
export class ProfileUserPersonalDataComponent  implements OnInit {

  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

}
