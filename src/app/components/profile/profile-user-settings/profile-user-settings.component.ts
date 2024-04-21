import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular'

@Component({
  selector: 'app-profile-user-settings',
  templateUrl: './profile-user-settings.component.html',
  styleUrls: ['./profile-user-settings.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class ProfileUserSettingsComponent implements OnInit {

  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

}
