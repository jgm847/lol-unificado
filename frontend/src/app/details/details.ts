import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HousingService} from '../housing';
import {HousingLocationInfo} from '../housing-location';
@Component({
  selector: 'app-details',
  template: `
    @if (housingLocation; as champion) {
      <article>
        <img
          class="listing-photo"
          [src]="champion.urlImagenCampeon"
          alt="Imagen de {{ champion.nombre }}"
          crossorigin
        />
        <section class="listing-description">
          <h2 class="listing-heading">{{ champion.nombre }}</h2>
          <p class="listing-location">{{ champion.clases.join(' / ') }}</p>
        </section>
        <section class="listing-features">
          <h2 class="section-heading">Informacion general</h2>
          <ul>
            <li>Lanzamiento: {{ champion.fechaLanzamiento }}</li>
            <li>Ultimo cambio: {{ champion.ultimoCambio }}</li>
            <li>Esencia azul: {{ champion.esenciaAzul }}</li>
            <li>Riot Points: {{ champion.riotPoints }}</li>
            <li><a [href]="champion.lolUrl" target="_blank" rel="noopener">Ver wiki oficial</a></li>
          </ul>
        </section>

        <section class="listing-features">
          <h2 class="section-heading">Habilidades</h2>
          <ul>
            @for (habilidad of champion.habilidades; track habilidad.habilidad) {
              <li>
                <strong>{{ habilidad.habilidad }} - {{ habilidad.nombre }}:</strong>
                {{ habilidad.descripcion }}
              </li>
            }
          </ul>
        </section>
      </article>
    } @else {
      <article>
        <h2>Campeon no encontrado</h2>
      </article>
    }
  `,
  styleUrls: ['./details.css'],
})
export class Details {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  route: ActivatedRoute = inject(ActivatedRoute);
  housingService = inject(HousingService);
  housingLocation: HousingLocationInfo | undefined;

  constructor() {
    const housingLocationId = parseInt(this.route.snapshot.params['id'], 10);
    this.housingService.getHousingLocationById(housingLocationId).then((housingLocation) => {
      this.housingLocation = housingLocation;
      this.changeDetectorRef.markForCheck();
    });
  }
}