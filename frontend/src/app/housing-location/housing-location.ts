import {Component, input} from '@angular/core';
import {HousingLocationInfo} from '../housing-location';
import {RouterLink} from '@angular/router';
@Component({
  selector: 'app-housing-location',
  imports: [RouterLink],
  template: `
    <section class="listing">
      <img
        class="listing-photo"
        [src]="housingLocation().urlImagenCampeon"
        alt="Imagen de {{ housingLocation().nombre }}"
        crossorigin
      />
      <h2 class="listing-heading">{{ housingLocation().nombre }}</h2>
      <p class="listing-location">{{ housingLocation().clases.join(' / ') }}</p>
      <a [routerLink]="['/details', housingLocation().id]">Ver detalles</a>
    </section>
  `,
  styleUrls: ['./housing-location.css'],
})
export class HousingLocation {
  housingLocation = input.required<HousingLocationInfo>();
}