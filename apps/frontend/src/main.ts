/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('%cChristian Cartes!!', 'font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)');
console.log('%cFullstack Developer https://www.linkedin.com/in/christian-cartes/ ', 'background-color: darkblue; color: white; font-style: italic; border: 5px solid hotpink; font-size: 2em;');


bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
