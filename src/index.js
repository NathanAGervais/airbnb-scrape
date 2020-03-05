import axios from 'axios';

const getAmenities = (listOfAmenities, availableAmenityIds) => {
  return listOfAmenities
    .map(a => ({
      name: a.name,
      id: a.id
    }))
    .filter(loa => availableAmenityIds.includes(loa.id));
};

const mapListing = data => {
  const { pdp_listing_detail: listing } = data;
  const availableAmenityIds =
    listing.root_amenity_sections.find(l => l.id === 'available_amenities')
      .amenity_ids || [];

  return {
    name: listing.name,
    amenities: getAmenities(listing.listing_amenities, availableAmenityIds),
    propertyType: listing.room_and_property_type || '',
    bathrooms: listing.bathroom_label || '',
    bedroom: listing.bedroom_label || '',
    id: listing.id
  };
};

const mapError = error => ({
  id: error.listingId,
  message: error.err.message,
  url: error.err.config.url
});

const mapResults = data => {
  const responses = data
    .filter(d => d['response'] !== undefined)
    .map(li => {
      return mapListing(li.response.data);
    });
  const errors = data
    .filter(d => d['err'] !== undefined)
    .map(error => mapError(error));

  return [{ listings: responses }, { errors }];
};

const getListings = async listingIds => {
  const requests = listingIds.map(listingId => {
    return axios
      .get(
        `https://www.airbnb.co.uk/api/v2/pdp_listing_details/${listingId}?_format=for_rooms_show&key=d306zoyjsyarp7ifhu67rjxn52tv0t20&`
      )
      .then(
        response => ({ response, listingId }),
        err => ({ err, listingId })
      );
  });
  return axios
    .all(requests)
    .then(
      axios.spread((...args) => {
        return args;
      })
    )
    .catch(err => {
      throw err;
    });
};

const getListingData = async listingIds => {
  const listingData = await getListings(listingIds);
  const results = mapResults(listingData);
  console.log(JSON.stringify(results, null, 4));
};

getListingData([
  '14531512',
  '19278160',
  '1939240',
  '2233443324424242',
  null,
  5
]);
