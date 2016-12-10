import { Component } from '@angular/core';
import * as io from 'socket.io-client';
import {MATERIAL_DIRECTIVES, MATERIAL_PROVIDERS} from "ng2-material";

class Client {
  user?: string;
  vendor: string;
  mac: string;
}

@Component({
  selector: 'client-list',
  template: `

  `
})
export class ClientListComponent {
  name = 'client list';
  private socket: any;

  clients: Client[];

  constructor() {
    this.socket = io('http://localhost:3000');
    this.socket.on('wifi_clients', (data: any) => {
      console.log(data);
      this.clients = data.currentClients;
    });
  }
}
