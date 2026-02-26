import countiesData from '@/data/counties.json';

interface SubCounty {
  id: string;
  name: string;
}

interface County {
  id: string;
  name: string;
  subCounties: SubCounty[];
}

// Function to extract only counties
export function countiesList(): { id: string; name: string }[] {
  // Type assertion to inform TypeScript about the shape of the data
  const data: County[] = countiesData as County[];

  return data.map(county => ({
    id: county.id,
    name: county.name
  }));
}

// Function to get sub-counties by county ID
export function getSubCountiesByCountyName(countyName: string): SubCounty[] {
    const data: County[] = countiesData as County[];
  
    const county = data.find(county => county.name === countyName);
  
    if (!county) {
      return []; // Return an empty array if the county is not found
    }
  
    return county.subCounties;
  }