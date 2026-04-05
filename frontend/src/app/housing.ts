import {Injectable} from '@angular/core';
import {HousingLocationInfo} from './housing-location';

@Injectable({
  providedIn: 'root',
})
export class HousingService {
  private readonly apiUrl = '/api/custom/champions';

  async getAllHousingLocations(): Promise<HousingLocationInfo[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error(`Error cargando campeones: ${response.status}`);
    }
    return ((await response.json()) as HousingLocationInfo[]) ?? [];
  }

  async getHousingLocationById(id: number): Promise<HousingLocationInfo | undefined> {
    const response = await fetch(`${this.apiUrl}/${id}`);
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      throw new Error(`Error cargando campeón ${id}: ${response.status}`);
    }
    return (await response.json()) as HousingLocationInfo;
  }

  submitApplication(firstName: string, lastName: string, email: string) {
    console.log(firstName, lastName, email);
  }
}
