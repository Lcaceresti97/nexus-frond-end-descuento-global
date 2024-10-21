import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LogModel } from 'src/app/model/model';

@Component({
  selector: 'app-logs-modal',
  templateUrl: './logs-modal.component.html',
  styleUrls: ['./logs-modal.component.css']
})
export class LogsModalComponent implements OnInit {

  // Props

  // Input | Output
  @Input() data: LogModel;

  // Form
  form: FormGroup;
  readonly: boolean = true;

  constructor(private activeModal: NgbActiveModal, private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.form = this.initForm();
    console.log(this.data);
  }

  // Methods
  closeModal() {
    this.activeModal.close();
  }

  /**
* Método encargado de construir el formulario reactivo
* 
*/
  initForm(): FormGroup {
    return this.formBuilder.group({
      id: [this.data.id],
      idclient: [this.data.idclient],
      ctaService: [this.data.ctaService],
      clientName: [this.data.clientName],
      ctaName: [this.data.ctaName],
      discount: [this.data.discount],
      dispoDiscount: [this.data.dispoDiscount],
      initialDate: [this.data.initialDate],
      finalDate: [this.data.finalDate],
      newLines: [this.data.newLines],
      user: [this.data.user],
      date: [this.data.date],
      action: [this.data.action],
      typeSubsidy: [this.data.typeSubsidyValue],
      comment: [this.data.comment],
    });
  }

}
