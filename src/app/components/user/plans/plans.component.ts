import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { timestamp } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CustomLocationService } from 'src/app/services/database/custom-location.service';
import { PlanData, PlanService } from 'src/app/services/database/plan.service';
import { UserService } from 'src/app/services/database/user.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class PlansComponent implements OnInit {

  plans: { id: string, data: PlanData }[] = [];

  constructor(private plan: PlanService, private user: UserService, private auth: AuthenticationService, private custom: CustomLocationService) {
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.getPlans(user.uid);
      }
    })
  }

  ngOnInit() {
    let test = 0;
  }

  async getPlans(uid: string) {
    const plans = await this.plan.getUserPlans(uid);
    plans.forEach(async (plan) => {
      this.plans.push({ id: plan, data: await this.plan.getPlanData(uid, plan) as PlanData })
    });
    console.log("User Plans:", plans);
  }

  async createPlan() {

  }

  async deletePlan(id: string) {

  }

}
