import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MapboxResultCardComponent } from '../mapbox-result-card/mapbox-result-card.component';
import { FoursquareService, Place } from 'src/app/services/foursquare/foursquare.service';
import { OpencageService } from 'src/app/services/opencage/opencage.service';
import { firstValueFrom } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mapbox-result-modal',
  templateUrl: './mapbox-result-modal.component.html',
  styleUrls: ['./mapbox-result-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, MapboxResultCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})


export class MapboxResultModalComponent implements OnInit {

  BROWSE_BACKGROUND_COLOR : string = 'rgba(0, 0, 0, 0.1)';
  SELECTED_BACKGROUND_COLOR : string = 'rgba(0, 0, 0, 1.0)';

  places: Place[] = [];
  numResults = 10;

  backgroundcolor: string = this.BROWSE_BACKGROUND_COLOR;

  isSelected = false;
  selectedPlace: Place | null = null;

  modal: HTMLIonModalElement | undefined;

  constructor(private modalCtrl: ModalController, private foursquare: FoursquareService, private opencage: OpencageService) { }

  ngOnInit() {
    this.waitForModal();
  }

  async waitForModal() {
    do {
      this.modal = await this.modalCtrl.getTop();
      if (!this.modal) {
        console.log("Modal not found, waiting...");
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (!this.modal);

    this.modal.addEventListener("ionBreakpointDidChange", async () => {
      console.log("Breakpoint change");
      if(this.modal && ((await this.modal.getCurrentBreakpoint()) === 0.4 || (await this.modal.getCurrentBreakpoint()) === 0.0)){
        this.isSelected = false;
        this.selectedPlace = null;
        this.backgroundcolor = this.BROWSE_BACKGROUND_COLOR;
      }
      if (!this.isSelected && this.modal && (await this.modal.getCurrentBreakpoint()) === 0.8) {
        await this.modal.setCurrentBreakpoint(0.4);
      }
    });
  }

  @Input()
  set modalInput(input: ModalInput) {
    this.places = [];
    this.updatePlaces(input.coords);
  }

  async updatePlaces(coords: Coords) {
    try {
      // Call findCloseToLocation first
      const closeToLocationResults = await this.findCloseToLocation(coords);

      // Variable to store results from fillPlaces
      let fillPlacesResults: Place[] | null = null;

      // Check if fillPlaces needs to be called
      if (closeToLocationResults.length < this.numResults) {
        // If places length is less than 10, call fillPlaces
        fillPlacesResults = await this.fillPlaces(coords, this.numResults - closeToLocationResults.length);
      }
      console.log("CLOSE TO LOCATION");
      console.log(closeToLocationResults);
      console.log("FILL PLACES");
      console.log(fillPlacesResults);

      // Concatenate results from both functions
      if (closeToLocationResults) {
        this.places = this.places.concat(closeToLocationResults);
      }

      if (fillPlacesResults) {
        this.places = this.places.concat(fillPlacesResults);
      }
    } catch (error) {
      console.error("Error occurred during updatePlaces:", error);
    }
  }

  async findCloseToLocation(coords: Coords): Promise<Place[] | []> {
    let retryCount = 0;

    while (retryCount < 3) {
      try {
        // Fetch data from Opencage
        const opencageResults = await firstValueFrom(this.opencage.getDataFromLL(coords.lat, coords.lng));
        console.log("OPEN CAGE RESULTS:");
        console.log(opencageResults);

        // Check if Opencage results are available
        if (!opencageResults.results || opencageResults.results.length === 0) {
          return []; // No results found
        }

        // Array to hold all results from Foursquare
        const allFoursquareResults: Place[] = [];

        // Loop through Opencage results
        for (const result of opencageResults.results) {
          const placeName = result.formatted?.split(',')[0].trim();
          // Check if placeName is valid
          if (placeName) {
            // Fetch data from Foursquare
            const foursquareResults = await firstValueFrom(this.foursquare.placeSearch({
              query: placeName,
              ll: coords.lat + "," + coords.lng,
              radius: 80,
              fields: "distance,hours,rating,location,photos,name",
              limit: 3,
            }));
            console.log("PART 1:")
            console.log(foursquareResults);

            // Add Foursquare results to the array
            if (foursquareResults.results && foursquareResults.results.length > 0) {
              allFoursquareResults.push(...foursquareResults.results);
            }
          }
        }

        // If results are found, return them
        if (allFoursquareResults.length > 0) {
          return allFoursquareResults;
        } else {
          // Increment retry count
          retryCount++;
          console.log(`Retry ${retryCount} - No results obtained from Foursquare.`);
        }
      } catch (error) {
        console.error("Error occurred:", error);
        return []; // Return empty array in case of error
      }
    }

    console.log("Max retry limit reached, returning empty array.");
    return []; // Return empty array if max retry limit reached
  }

  async fillPlaces(coords: Coords, fillAmt: number): Promise<Place[] | []> {
    let retryCount = 0;

    while (retryCount < 10) {
      try {
        const foursquareResults = await firstValueFrom(this.foursquare.placeSearch({
          ll: coords.lat + "," + coords.lng,
          radius: 8000,
          fields: "distance,hours,rating,location,photos,name,fsq_id",
          limit: fillAmt,
          categories: "10000,13000,14000"
        }));

        console.log("PART 2:")
        console.log(foursquareResults);

        // Check if foursquareResults.results is valid before concatenating
        if (foursquareResults.results && foursquareResults.results.length > 0) {
          return foursquareResults.results;
        } else {
          // Increment retry count
          retryCount++;
          console.log(`Retry ${retryCount} - No results obtained.`);
        }
      } catch (error) {
        console.error("Error occurred while filling places:", error);
        return []; // Return empty array in case of error
      }
    }

    console.log("Max retry limit reached, returning empty array.");
    return []; // Return empty array if max retry limit reached
  }

  async clickOnResult($event: any) {
    this.isSelected = true;
    this.selectedPlace = $event;
    this.backgroundcolor = this.SELECTED_BACKGROUND_COLOR;
    this.modal?.setCurrentBreakpoint(.8);
    return;
  }

  closeModal() {
    return this.modalCtrl.dismiss(null, 'close');
  }

}

export interface Coords {
  lat: number;
  lng: number;
}

export interface ModalInput {
  coords: Coords;
}
