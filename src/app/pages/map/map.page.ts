import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { Coords, MapboxMapComponent } from 'src/app/components/mapbox/mapbox-map/mapbox-map.component';
import { MapboxResultModalComponent } from 'src/app/components/mapbox/mapbox-result-modal/mapbox-result-modal.component';
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, MapboxMapComponent, MapboxResultModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapPage implements OnInit {

  coords!: Coords;
  modal: HTMLIonModalElement | null = null;

  constructor(private modalCtrl: ModalController) { }

  async ngOnInit() {
    console.log("Map Page");
  }

  async updateResults(coords: Coords) {
    this.coords = coords;
    await this.openModal();
  }

  async openModal() {
    if (this.modal) {
      await this.modal.dismiss(null, 'close');
    }

    this.modal = await this.modalCtrl.create({
      component: MapboxResultModalComponent,
      componentProps: {
        modalInput: {
          coords: this.coords,
        },
      },
      initialBreakpoint: .4,
      breakpoints: [0, .4, .8],
      backdropBreakpoint: .5,
    });

    this.modal.present();
  }

}



