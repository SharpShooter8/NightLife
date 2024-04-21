import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonGrid, IonItem } from '@ionic/angular/standalone'

@Component({
  selector: 'app-profile-user-settings',
  templateUrl: './profile-user-settings.component.html',
  styleUrls: ['./profile-user-settings.component.scss'],
  standalone: true,
  imports: [IonItem, IonGrid, ]
})
export class ProfileUserSettingsComponent implements OnInit {

  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

}
