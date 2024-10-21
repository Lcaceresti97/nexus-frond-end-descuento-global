import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";


@Component({
  selector: 'app-plugin',
  templateUrl: './plugin.component.html',
  styleUrls: ['./plugin.component.css']
})
export class PluginComponent implements OnInit {

  sub: string;
  auth: boolean;

  constructor(private _activeRouter: ActivatedRoute) {

    if (window.self !== window.top) {
      this.auth = true
      this._activeRouter.queryParams.subscribe(params => {
        this.sub = JSON.stringify(params['sub']);
        if (this.sub){
          sessionStorage.setItem('sub', this.sub)
        }
      });
    } else {
      this.auth = false
    }
    
  }

  ngOnInit() {
  }

}
