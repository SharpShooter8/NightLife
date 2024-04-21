import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular'

@Component({
  selector: 'app-profile-user-personal-data',
  templateUrl: './profile-user-personal-data.component.html',
  styleUrls: ['./profile-user-personal-data.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class ProfileUserPersonalDataComponent  implements OnInit {

  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    let test = 0;
  }

}
