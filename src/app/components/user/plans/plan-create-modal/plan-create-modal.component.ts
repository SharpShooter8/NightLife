import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { PlanService } from 'src/app/services/database/plan.service';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';


@Component({
  selector: 'app-plan-create-modal',
  templateUrl: './plan-create-modal.component.html',
  styleUrls: ['./plan-create-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class PlanCreateModalComponent implements OnInit {

  constructor(private modalCtrl: ModalController, private auth: AuthenticationService, private plan: PlanService) { }

  name: string | undefined;
  startDate: string | undefined;
  endDate: string | undefined;

  ngOnInit() {
    let test = 0;
  }

  async createPlan() {
    const uid = this.auth.currentUser.value?.uid;
    if (!uid || !this.name || !this.startDate || !this.endDate) {
      console.log(this.name);
      console.log("oops");
      return;
    }
    this.plan.createPlan(uid, this.name, this.startDate, this.endDate).subscribe(
      () => {
        this.modalCtrl.dismiss(null, 'created');
      }
    );
  }

}
