export interface FilterOption<T = string> {
  id: T;
  label: string;
}

// All 23 Official Districts of West Bengal (Alphabetical Order)
export const WEST_BENGAL_DISTRICTS: FilterOption[] = [
  { id: 'all', label: 'All Districts' },
  { id: 'alipurduar', label: 'Alipurduar' },
  { id: 'bankura', label: 'Bankura' },
  { id: 'birbhum', label: 'Birbhum' },
  { id: 'cooch_behar', label: 'Cooch Behar' },
  { id: 'dakshin_dinajpur', label: 'Dakshin Dinajpur' },
  { id: 'darjeeling', label: 'Darjeeling' },
  { id: 'hooghly', label: 'Hooghly' },
  { id: 'howrah', label: 'Howrah' },
  { id: 'jalpaiguri', label: 'Jalpaiguri' },
  { id: 'jhargram', label: 'Jhargram' },
  { id: 'kalimpong', label: 'Kalimpong' },
  { id: 'kolkata', label: 'Kolkata' },
  { id: 'malda', label: 'Malda' },
  { id: 'murshidabad', label: 'Murshidabad' },
  { id: 'nadia', label: 'Nadia' },
  { id: 'north_24_parganas', label: 'North 24 Parganas' },
  { id: 'paschim_bardhaman', label: 'Paschim Bardhaman' },
  { id: 'paschim_medinipur', label: 'Paschim Medinipur' },
  { id: 'purba_bardhaman', label: 'Purba Bardhaman' },
  { id: 'purba_medinipur', label: 'Purba Medinipur' },
  { id: 'purulia', label: 'Purulia' },
  { id: 'south_24_parganas', label: 'South 24 Parganas' },
  { id: 'uttar_dinajpur', label: 'Uttar Dinajpur' }
];

// Major 23 Cities in West Bengal (Alphabetical Order - Zero Districts, Zero Duplicates)
export const WEST_BENGAL_CITIES: FilterOption[] = [
  { id: 'all', label: 'All Cities' },
  { id: 'alipurduar', label: 'Alipurduar' },
  { id: 'asansol', label: 'Asansol' },
  { id: 'balurghat', label: 'Balurghat' },
  { id: 'bardhaman', label: 'Bardhaman' },
  { id: 'basirhat', label: 'Basirhat' },
  { id: 'berhampore', label: 'Berhampore' },
  { id: 'bishnupur', label: 'Bishnupur' },
  { id: 'chandannagar', label: 'Chandannagar' },
  { id: 'cooch_behar', label: 'Cooch Behar' },
  { id: 'dinhata', label: 'Dinhata' },
  { id: 'durgapur', label: 'Durgapur' },
  { id: 'haldia', label: 'Haldia' },
  { id: 'howrah', label: 'Howrah' },
  { id: 'jalpaiguri', label: 'Jalpaiguri' },
  { id: 'kalyani', label: 'Kalyani' },
  { id: 'kharagpur', label: 'Kharagpur' },
  { id: 'kolkata', label: 'Kolkata' },
  { id: 'krishnanagar', label: 'Krishnanagar' },
  { id: 'malda', label: 'Malda' },
  { id: 'midnapore', label: 'Midnapore' },
  { id: 'raiganj', label: 'Raiganj' },
  { id: 'siliguri', label: 'Siliguri' },
  { id: 'tufanganj', label: 'Tufanganj' }
];

// Zones / Regions
export const KOLKATA_ZONES: FilterOption[] = [
  { id: 'all', label: 'All Zones' },
  { id: 'Central Kolkata', label: 'Central Kolkata' },
  { id: 'Howrah', label: 'Howrah' },
  { id: 'North Kolkata', label: 'North Kolkata' },
  { id: 'Salt Lake & East Kolkata', label: 'Salt Lake & East' },
  { id: 'South Kolkata', label: 'South Kolkata' }
];

// Heritage & Legacy Filter Options
export const HERITAGE_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Heritage' },
  { id: 'heritage_century', label: 'Century Heritage (100+ Yrs)' },
  { id: 'heritage_traditional', label: 'Iconic & Traditional' }
];

// Passport Visited Filter Options
export const PASSPORT_STATUS_OPTIONS: FilterOption<'all' | 'unvisited' | 'visited'>[] = [
  { id: 'all', label: 'All Pandals' },
  { id: 'unvisited', label: 'Unvisited' },
  { id: 'visited', label: 'Already Visited' }
];

// Sort Options
export const SORT_OPTIONS: FilterOption<'rating' | 'ratingCount' | 'name'>[] = [
  { id: 'rating', label: 'Highest Rated ★' },
  { id: 'ratingCount', label: 'Most Ratings 🗳️' },
  { id: 'name', label: 'Alphabetical A-Z 🔤' }
];
