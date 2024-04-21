import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Coords, MapboxMapComponent } from 'src/app/components/mapbox/mapbox-map/mapbox-map.component';
import { MapboxModalComponent } from 'src/app/components/mapbox/mapbox-modal/mapbox-modal.component';
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, MapboxMapComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapPage implements OnInit {

  coords!: Coords;
  modal: HTMLIonModalElement | null = null;
  isModalOpen: boolean = false;

  constructor(private modalController: ModalController) { }

  async ngOnInit() {
    console.log("Map Page");
    this.openModal()
  }

  async updateResults(coords: Coords) {
    this.coords = coords;
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: MapboxModalComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'testing',
      mode: 'ios',
      backdropDismiss: false,
      backdropBreakpoint: 1,
    });
    modal.present();
    this.isModalOpen = true;

    const { data, role } = await modal.onWillDismiss();
    this.isModalOpen = false;
  }
}



