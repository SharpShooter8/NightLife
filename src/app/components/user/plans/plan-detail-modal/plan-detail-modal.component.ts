import { Component, Input, OnInit } from '@angular/core';
import { Location, Member, PlaceLocation, PlanData, PlanService, UserLocation } from 'src/app/services/database/plan.service';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-plan-detail-modal',
  templateUrl: './plan-detail-modal.component.html',
  styleUrls: ['./plan-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class PlanDetailModalComponent  implements OnInit {

  @Input() plan: {id: string, data: PlanData} | null = null;

  constructor(private modalCtrl: ModalController, private planService: PlanService, private auth: AuthenticationService) { }

  ngOnInit() {
    let test = 0;
  }

  getMembers(): Member[]{
    return this.plan?.data.members as Member[];
  }

  getPlaceLocations(): PlaceLocation[]{
    return this.plan?.data.placeLocations as PlaceLocation[];
  }

  getLocation(placeLocation: PlaceLocation): Location{
    return placeLocation.location as Location;
  }

  getUserLocations(): UserLocation[]{
    return this.plan?.data.userLocations as UserLocation[];
  }

  async deletePlan(){
    const uid = this.auth.currentUser.value?.uid;
    if(!uid || !this.plan?.id){
      return;
    }
    this.planService.removePlan(uid, this.plan?.id).subscribe(
      () => {
        this.modalCtrl.dismiss(null, 'deleted');
      }
    );
  }

}
