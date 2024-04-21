import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { PlanData, PlanService } from 'src/app/services/database/plan.service';

@Component({
  selector: 'app-mapbox-create-plan',
  templateUrl: './mapbox-create-plan.component.html',
  styleUrls: ['./mapbox-create-plan.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MapboxCreatePlanComponent implements OnInit {

  @Output() planCreated: EventEmitter<{ id: string, data: PlanData }> = new EventEmitter<{ id: string, data: PlanData }>();
  @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();

  dateTimeButtonFormat = {
    date: {
      weekday: 'short',
      month: 'long',
      day: '2-digit',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  name: string = "";
  startDate: string = new Date().toISOString().slice(0, 16) + ":00";
  endDate: string = new Date().toISOString().slice(0, 16) + ":00";

  constructor(private planService: PlanService, private authService: AuthenticationService) { }

  ngOnInit() {
    let test = 0;
  }

  createPlan() {
    const uid = this.authService.currentUser.value?.uid as string;
    this.planService.createPlan(uid, this.name, this.startDate, this.endDate).subscribe(
      (plan) => {
        this.planCreated.emit(plan);
      }
    );
  }
}
