import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HousingLocation} from '../housing-location/housing-location';
import {HousingLocationInfo} from '../housing-location';
import {HousingService} from '../housing';
@Component({
  selector: 'app-home',
  imports: [HousingLocation, RouterLink],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Buscar por campeon o clase" #filter />
        <button class="primary" type="button" (click)="filterResults(filter.value)">Buscar</button>
      </form>
    </section>
    <section class="results">
      @for (housingLocation of filteredLocationList; track housingLocation.id) {
        <app-housing-location [housingLocation]="housingLocation" />
      }
    </section>
  `,
  styleUrls: ['./home.css'],
})
export class Home {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  housingLocationList: HousingLocationInfo[] = [];
  housingService: HousingService = inject(HousingService);
  filteredLocationList: HousingLocationInfo[] = [];
  constructor() {
    this.housingService
      .getAllHousingLocations()
      .then((housingLocationList: HousingLocationInfo[]) => {
        this.housingLocationList = housingLocationList;
        this.filteredLocationList = housingLocationList;
        this.changeDetectorRef.markForCheck();
      });
  }
  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList = this.housingLocationList;
      return;
    }

    const normalizedText = text.toLowerCase();
    this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
      housingLocation.nombre.toLowerCase().includes(normalizedText) ||
      housingLocation.clases.some((clase) => clase.toLowerCase().includes(normalizedText)),
    );
  }
}