import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationService } from 'src/app/services/database/custom-location.service';
import { PlaceLocation, PlanData, PlanService, Role } from 'src/app/services/database/plan.service';
import { Plan, UserService } from 'src/app/services/database/user.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class PlansComponent implements OnInit {

  plans: {id: string, data: PlanData}[] = [];

  constructor(private planData: PlanService, private userData: UserService, private auth: AuthenticationService, private custom: CustomLocationService) {
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.getPlans();
      }
    })
  }

  ngOnInit() {
    let test = 0;
  }

  async getPlans(){
    this.plans = [];
    let uid = this.auth.currentUser.getValue()?.uid;
    if(!uid){return;}
    const data = await this.userData.getUserData(uid);
    const plans = data?.plans as Plan[];
    if(!plans){return;}
    console.log(plans);
    for(const plan of plans){
      const dataP = await this.planData.getPlanData(plan.planID as string, uid);
      if(dataP){
        this.plans.push({id: plan.planID as string, data: dataP});
      }
    }
  }

  async createPlan(){
    let uid = this.auth.currentUser.getValue()?.uid;
    if(!uid){return;}
    const id = await this.planData.createPlan(uid, "Tester", null, null);
    await this.userData.addOwnedPlan(uid, id);
    await this.getPlans();
  }

  async deletePlan(id: string){
    let uid = this.auth.currentUser.getValue()?.uid;
    if(!uid){return;}
    await this.planData.deletePlan(id, uid);
    await this.userData.removePlan(uid, id);
    await this.getPlans();
  }

}
