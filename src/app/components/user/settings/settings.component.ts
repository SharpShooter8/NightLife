import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: []
})
export class SettingsComponent  implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("Settings Component Generated");
  }

}
